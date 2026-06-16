# Flow Record Lookup で Rich Text フィールドは filter 不可（SOQL 制約）

## 結論

`Flow` の `<recordLookups>` や SOQL WHERE 句で **Rich Text（Long Text Area with HTML / RichTextArea）** 型のフィールドを**直接フィルタ条件にすると必ず失敗**する。

エラー例（実際のログ）:
```
このエラーは、フローでレコードの検索が試行されたときに発生しました:
(((Subject__c LIKE '%ドローン%') OR (Body_Rich__c LIKE '%ドローン%'))) ORDER
field 'Body_Rich__c' can not be filtered in a query call
```

Flow 自体は「未対応の障害」としてラップされ、UI では原因が見えにくい。
真因を突き止めるには `sf apex tail log` を並行起動してから `Flow.Interview.createInterview(...).start()` を Apex から直接呼び、
`FLOW_ELEMENT_ERROR` のサブメッセージを見る。

## なぜか

- Rich Text 型（`textarea` with Rich）は Salesforce プラットフォームの制約として SOQL WHERE 句でフィルタ不可。これは Flow に限らず、SOQL／Reports／List Views のフィルタも同様
- 一見フィルタできそうな UI になっていても、ランタイムで必ず落ちる
- `sf sobject describe` の戻り値で `type: textarea` かつ `extraTypeInfo: richtextarea` になっているフィールドが該当

## 対処策（優先順）

### 対処 1: フィルタ対象を通常の Text / String フィールドに寄せる（即採用）
- 件名（Subject 系）・タグ・カテゴリ picklist など filterable なフィールドだけで条件を組む
- 本文内容をデモ検索したいなら、平文の「要約テキスト」フィールドを別途用意して本文更新時に自動コピーする Flow を作る

### 対処 2: SOSL で検索する
- Apex Action で Flow から SOSL を呼ぶ
- SOSL は Rich Text 含む全テキストフィールドを対象に全文検索できる
- Flow から直接 SOSL は呼べないので Apex Invocable Action を 1 枚挟む

```apex
@InvocableMethod(label='稟議 SOSL 検索')
public static List<RingiSearchResult> searchRingi(List<SearchInput> inputs) {
    String keyword = inputs[0].keyword;
    List<List<SObject>> results = [FIND :keyword IN ALL FIELDS
        RETURNING Ringi__c(Id, Name, Subject__c, Ringi_Amount__c, Drafted_Date__c)];
    // ...
}
```

### 対処 3: Data Cloud + Retriever Action（本格派）
- 稟議 Rich Text を Data Cloud に取り込み、Vector Store にインデックス化
- Agentforce から Retriever Action 経由でセマンティック検索
- 実装: DMO 定義 → Data Stream → Vector Store Index → Retriever → Agent Action
- Org に Data Cloud が有効化されていることが前提

## デモ環境での判断指針（FlowOrchestrationDemo）

稟議デモで「過去稟議の曖昧検索」を Agentforce で見せる場合、以下の順で検討する:

1. **件名だけで引ける語彙設計になっているか** → そうなっているなら対処 1 が最速
2. **件名では足りず本文中のキーワードを拾いたいか** → 対処 2（SOSL）か対処 3（Data Cloud）
3. **デモ当日の確実性 vs 見せ場の豪華さ** → 対処 1 > 対処 2 > 対処 3 の順で事故確率低

## 参考: 再現手順と検出方法

```bash
# 1. apex log を並行 tail
sf apex tail log --target-org <org> --color &
# 2. Flow を直接呼ぶ
sf apex run --target-org <org> <<'EOF'
Map<String, Object> params = new Map<String, Object>{'keyword' => 'xxx'};
Flow.Interview fi = Flow.Interview.createInterview('MyFlow', params);
try { fi.start(); } catch(Exception e) { System.debug('NG: ' + e.getMessage()); }
EOF
# 3. FLOW_ELEMENT_ERROR 行の full message を確認
```

`fi.start()` のエラーメッセージだけ見ると「未対応の障害」としか出ず原因不明のままハマる。
`apex tail log` を並走させて FLOW_ELEMENT_ERROR の full payload を確認するのが最短。

---

2026-05-04 稟議検索 Agentforce 実装時に発生・特定。
Agent テストで Topic/Action は Pass するが Outcome が 0% になるパターンの真因がこれだった。
