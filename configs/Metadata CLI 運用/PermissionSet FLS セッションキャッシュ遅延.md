# PermissionSet FLS セッションキャッシュ遅延

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

field-meta.xml を追加・修正してデプロイ成功後、PermissionSet の fieldPermissions も追加してデプロイ。直後に SOQL で `SELECT New_Field__c FROM ...` を実行すると以下のエラー:

> `No such column 'New_Field__c' on entity`

---

## 注意点

### 誤診されやすさ

- 「フィールドが作成されていない」「デプロイが実は失敗している」「FieldDefinition と実体に乖離がある」と誤認しやすい
- Tooling API `FieldDefinition` には**正しく表示される**（org 的には存在する）が、SOQL/DML からは見えない
- コーディ系のサブエージェントが**独断で新フィールド追加や別設計への逃避**をする原因になる

### 真因

FLS の**セッションキャッシュ**。デプロイで PermissionSet が更新されても、実行ユーザーのセッションキャッシュは直ちに反映されない。新しい CLI セッション or 明示的キャッシュクリアで解消する。

---

## 対処

### 対処法 1: PermissionSet を再デプロイ（最も簡単）

同じ XML でも**再送信で FLS キャッシュが更新される**。

```bash
sf project deploy start --source-dir force-app/main/default/permissionsets/MyPermissionSet.permissionset-meta.xml -o <alias>
```

今回のプロジェクトでは、これで解消した。

---

### 対処法 2: CLI セッション再取得

```bash
sf org logout -o <alias>
sf org login web -a <alias>
```

---

### 対処法 3: 5-10 分待ってから再実行

自動 expire で解消する場合あり。ただし、時間がかかる。

---

### 対処法 4: 別の管理者ユーザー（キャッシュ未生成）で SOQL を実行して事実確認

```bash
sf data query -q "SELECT New_Field__c FROM CustomObject__c LIMIT 1" -o <alias> -u <別のユーザ名>
```

---

## 判別 SOQL（「実体はあるか FLS だけの問題か」確認）

```sql
-- Tooling API でフィールド実体の存在確認（FLS 無視）
SELECT QualifiedApiName, DataType
FROM FieldDefinition
WHERE EntityDefinition.QualifiedApiName = 'CustomObject__c'
AND QualifiedApiName = 'New_Field__c'
```

これで 1 件ヒットすれば**実体はあるので FLS 問題**と断定できる。

---

## サブエージェント運用への影響

実装系サブエージェント（コーディ相当）がこのエラーに遭遇すると、`describe` 結果に基づいて「フィールドがない」と結論し、独断で設計変更・新フィールド追加を始める事故パターンがある。

### 明示ルール

「フィールドが存在しないエラーは、まず PermissionSet 再デプロイと Tooling API FieldDefinition 確認の 2 段階を試してからアインシュタインへ報告」をサブエージェントの instruction に含める。

---

## 関連項目

- [CustomObject searchLayouts 空タグの罠](./CustomObject%20searchLayouts%20空タグの罠.md)
