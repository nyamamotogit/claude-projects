# destructiveChanges は FlowDefinition を削除しない

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

destructiveChanges.xml に `<members>FlowName</members>` を指定してデプロイしたら、ローカル XML は削除扱いになったが、Org 側には FlowDefinition が残存。

---

## 注意点

- FlowDefinition そのものは Metadata API では削除不可
- destructiveChanges で消せるのは**特定バージョン**（`<members>FlowName-2</members>`）のみ
- Tooling API の `DELETE /sobjects/FlowDefinition/{id}` も `INSUFFICIENT_ACCESS_ON_CROSS_REFERENCE_ENTITY` で拒否される

---

## 対処

### 対処法 1: Setup UI で削除（推奨）

1. Setup → プロセスオートメーション → フロー
2. 対象 Flow を開く
3. 「削除」ボタンをクリック

---

### 対処法 2: 非 Active 化 + 新バージョン作成で運用（通常の運用パターン）

FlowDefinition を完全削除する必要は通常ない。以下の運用で十分:

1. **activeVersionNumber=0** で非 Active 化
2. 新バージョンを別途作成 → Active 化

```bash
# 現在の Active バージョンを無効化（Tooling API）
sf data update record -s FlowDefinition -i <FlowDefinitionId> -v "ActiveVersionNumber=0" -t -o <alias>

# 新バージョンをデプロイ
sf project deploy start --source-dir force-app/main/default/flows/FlowName.flow-meta.xml -o <alias>
```

---

### 対処法 3: 特定バージョンのみ削除

特定のバージョン（例: バージョン 2）を削除する場合:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>FlowName-2</members>
        <name>Flow</name>
    </types>
    <version>63.0</version>
</Package>
```

```bash
sf project deploy start --post-destructive-changes destructiveChanges.xml --manifest package.xml -o <alias>
```

**注意**: 最新バージョンや Active バージョンは削除できない場合がある。

---

## FlowDefinition vs Flow の関係

| メタデータ型 | 説明 | 削除可否 |
|---|---|---|
| `FlowDefinition` | Flow の定義本体（全バージョンを含む親） | Metadata API では削除不可 |
| `Flow` | 特定バージョン（例: `FlowName-2`） | destructiveChanges で削除可 |

---

## 関連項目

- [Metadata API で Draft Flow は Active 化できない](./Metadata%20API%20で%20Draft%20Flow%20は%20Active%20化できない.md)
