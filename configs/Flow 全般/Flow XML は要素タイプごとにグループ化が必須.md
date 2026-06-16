# Flow XML は「実行順」ではなく「要素タイプごと」にグループ化が必須

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-05-13
**Salesforce API**: 63.0
**構成**: 状況 → 注意点 → 対処

---

## 状況

Reception フローを「縦一直線で人間に読みやすく」リファクタリングしようとし、実行順に沿って XML を並べた:

```xml
<Flow>
    <recordLookups><name>Get_Ringi_Record</name>...</recordLookups>
    <recordLookups><name>Get_Approver_Stage20</name>...</recordLookups>
    ... (Approver 取得 ×8)
    <screens><name>Reception_Screen</name>...</screens>
    <screens><name>Approver_Assignment_Screen</name>...</screens>
    <recordLookups><name>Get_User_Stage20</name>...</recordLookups>  <!-- ← ここで再登場 -->
    ... (User 取得 ×8)
    <screens><name>Route_Preview_Screen</name>...</screens>
    <recordUpdates><name>Update_Approver_Stage20</name>...</recordUpdates>
    ...
</Flow>
```

deploy で以下のエラー:

```
Error parsing file: Element recordLookups is duplicated at this location in type Flow (846:14)
```

`recordLookups` を screens の後ろにもう一度書いたため XSD 上は「重複」と判定された。

---

## 注意点

- Flow Metadata XSD は **要素タイプごとに連続配置（同タイプを途中で挟まない）** という制約あり
- 実行順序は別物。connector / targetReference で表現するもの
- 該当する全要素タイプ：`actionCalls`, `assignments`, `collectionProcessors`, `decisions`, `loops`, `recordCreates`, `recordDeletes`, `recordLookups`, `recordRollbacks`, `recordUpdates`, `screens`, `stages`, `steps`, `subflows`, `transforms`, `waits` など
- 「実行順に並んでいると読みやすい」という直感は捨てる。XML はソース順 ≠ 実行順。Flow Builder で開いた時の見た目は connector で決まる

---

## 対処

### 正しい構造

```xml
<Flow>
    <apiVersion>...</apiVersion>
    <description>...</description>
    <environments>...</environments>
    <interviewLabel>...</interviewLabel>
    <label>...</label>
    <processType>...</processType>
    <runInMode>...</runInMode>

    <!-- recordLookups を全部まとめる（順番は読みやすさ優先で OK） -->
    <recordLookups><name>Get_Ringi_Record</name>...</recordLookups>
    <recordLookups><name>Get_Approver_Stage20</name>...</recordLookups>
    <recordLookups><name>Get_User_Stage20</name>...</recordLookups>
    ... 全 recordLookups

    <!-- recordUpdates を全部まとめる -->
    <recordUpdates>...</recordUpdates>
    ... 全 recordUpdates

    <!-- screens を全部まとめる -->
    <screens>...</screens>
    ... 全 screens

    <start>...</start>
    <status>Active</status>
    <variables>...</variables>
    ... 全 variables
</Flow>
```

### 推奨グループ順序

実害は無いが、Salesforce 出力の慣例 (XSD 順) に合わせると：

`apiVersion → description → environments → interviewLabel → label → processType → runInMode → assignments → decisions → dynamicChoiceSets → formulas → loops → recordLookups → recordUpdates → screens → stages → steps → variables → start → status`

完全な順序は org からデプロイし直したファイル（`sf project retrieve`）を見ると確実。

### 検出方法

エラーメッセージ `Element X is duplicated at this location` が出たら、**X が同タイプ要素の途中で別タイプ要素を挟んでいないか** を最初に疑う。

---

## 関連項目

- [Metadata API で Draft Flow は Active 化できない](./Metadata%20API%20で%20Draft%20Flow%20は%20Active%20化できない.md)
- [lightning-record-picker の出力属性は recordId](./lightning-record-picker%20の出力属性は%20recordId.md)
