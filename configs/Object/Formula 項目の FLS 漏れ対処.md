# Formula 項目の FLS 漏れに注意（新規作成時のチェックリスト）

**目的**: カスタムオブジェクトに Formula（Text/Number/Checkbox 等）項目を新規追加したとき、権限セット／プロファイルに FLS を付け忘れる事故の再発防止。

---

## 1. 事象

新規 Formula 項目を作成し `sf project deploy start` が成功しても、以下のいずれかが発生する:

1. **SOQL で `No such column` エラー**（admin でも発生）
2. **レコードページ / Compact Layout / リストビューに項目が表示されない**
3. **Apex / LWC からアクセスしたとき `FIELD_CUSTOM_VALIDATION_EXCEPTION` や null が返る**
4. **ダッシュボード・レポートのフィールド一覧に出てこない**

原因は **権限セットまたはプロファイルに `<fieldPermissions>` を追加していない**こと。

---

## 2. なぜ Formula なのに FLS が要るのか

Salesforce の FLS は Read/Edit の 2 段階だが、Formula は read-only（Edit 不可）。そのため「Formula だから権限不要」と誤解しがちだが、実際は:

- **Formula でも Read 権限が必要**（付けないとシステム管理者以外からは不可視）
- Salesforce のシステム管理者 Profile は「Modify All Data」を持つが、**FLS は個別に評価される**ため、field-level で明示的に付けないと SOQL でも見えない
- admin ユーザーが既に持つ権限セット（例: `Ringi_User`）にその Formula 項目が無ければ、admin でも `No such column` エラーになる（2026-05-04 実発生）

---

## 3. 新規項目作成時の必須チェックリスト

### 3.1 項目を作った直後にやること

1. ファイル `objects/<Obj>/fields/<Field>.field-meta.xml` を作成（deploy 対象）
2. 権限セット `permissionsets/<PS>.permissionset-meta.xml` に以下を追加（**忘れやすい**）:

```xml
<fieldPermissions>
    <field>Obj__c.Field__c</field>
    <readable>true</readable>
    <editable>false</editable>   <!-- Formula は常に false、Number/Text 入力項目は true でも可 -->
</fieldPermissions>
```

3. Compact Layout / Page Layout / FlexiPage 側の参照追加

### 3.2 deploy 後の確認手順（省略禁止）

```bash
# 1. フィールドが SOQL で見えるか
sf data query --target-org <org> --query "SELECT <Field__c> FROM <Obj__c> LIMIT 1"

# 2. No such column エラーが出たら FLS 不足
#    → 権限セットに fieldPermissions 追加 → 再 deploy
```

**警告サイン**: `No such column '<Field>' on entity '<Obj>'. If you are attempting to use a custom field, be sure to append the '__c' after the custom field name.` — `__c` は付いているのにエラーになる場合、**原因は FLS 不足**（項目が存在しないわけではない）。

---

## 4. 対象プロファイル／権限セットを漏らさない方法

- `grep -l "<Obj__c>\." force-app/main/default/permissionsets/*.permissionset-meta.xml` で、そのオブジェクトの FLS を持つ権限セットを列挙
- 新規項目追加時、上記の権限セット **全部** に新規項目の `<fieldPermissions>` を追加
- 特に、デモ環境で admin ユーザーが使う権限セットは必ず含める（最初のテストで引っかかる）

---

## 5. 関連する Salesforce の仕様

- Permission Set のメタデータは **追加・削除すると XML 差分が大きくなる**。複数人で編集するとマージで崩れやすい
- 既存の Permission Set を retrieve してローカルと比較すると、organization-wide な設定で差分が勝手に入ることがある（retrieve はしない運用が安全）
- Formula 項目を **新規作成** した直後に Compact Layout / Page Layout に入れると、FLS がなくても deploy 自体は成功する（組織側で layout に field が入るが、参照時に FLS で弾かれる）。**deploy 成功 = 使える、ではない**

---

## 6. よくある見落としパターン

| パターン | 症状 | 対処 |
|---|---|---|
| 新規 Formula 追加、権限セット未更新 | admin でも SOQL で見えない、レコードページで空白 | 権限セットに Read 追加して再 deploy |
| カスタムオブジェクト新規作成、ObjectPermissions は追加したが fieldPermissions 抜け | ListView で項目が選べない | `<fieldPermissions>` 追加 |
| プロファイル直書きで管理しているケース | Permission Set 経由で付けても見えない | プロファイルに入れるか、プロファイル → 権限セットへの移行を検討 |
| Compact Layout に追加したのに表示されない | タイトルバーの一部欄が空白 | 権限セット FLS を確認 |

---

## 7. 改訂履歴

| 日付 | 内容 |
|---|---|
| 2026-05-04 | 初版。FlowOrchestrationDemo PL-d19 で `Ringi_Title_Display__c` を追加後、権限セットに FLS を入れ忘れて admin でも `No such column` になった事例を記録 |
