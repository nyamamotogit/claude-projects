# GenAiPlugin の function 追加順序

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

GenAiPlugin の `<genAiFunctions>` に未登録のカスタム function 名を追加してデプロイした。

---

## 注意点

- `An unexpected error occurred` で失敗する
- エラーメッセージが不明瞭なため原因特定が遅れる
- GenAiFunction を先に org に作成してから GenAiPlugin を更新する必要がある

---

## 対処

### 正しい手順

1. **GenAiFunction を先に org に作成**（UI または retrieve）
2. **GenAiPlugin を更新**して function 参照を追加

#### 手順詳細

```bash
# Step 1: GenAiFunction を UI で作成（Setup → Agentforce → Agent Actions → New）

# Step 2: GenAiFunction を retrieve してソース管理に含める
sf project retrieve start --metadata "GenAiFunction:MyFunction" -o <alias>

# Step 3: GenAiPlugin XML に function 参照を追加
```

GenAiPlugin XML:

```xml
<GenAiPlugin xmlns="http://soap.sforce.com/2006/04/metadata">
    <description>営業支援トピック</description>
    <developerName>Sales_Support_Topic</developerName>
    <genAiFunctions>
        <functionName>MyFunction</functionName>
    </genAiFunctions>
    <genAiPluginInstructions>
        <description>営業関連のタスクを支援します。</description>
        <sortOrder>1</sortOrder>
    </genAiPluginInstructions>
    <language>ja</language>
    <masterLabel>営業支援</masterLabel>
    <pluginType>Topic</pluginType>
    <scope>Global</scope>
</GenAiPlugin>
```

```bash
# Step 4: GenAiPlugin をデプロイ
sf project deploy start --source-dir force-app/main/default/genAiPlugins/Sales_Support_Topic.genAiPlugin-meta.xml -o <alias>
```

---

## 誤った手順（失敗する）

```bash
# GenAiFunction が未作成の状態で GenAiPlugin をデプロイ
sf project deploy start --source-dir force-app/main/default/genAiPlugins/Sales_Support_Topic.genAiPlugin-meta.xml -o <alias>
```

**結果**: `An unexpected error occurred`

---

## 関連項目

- [GenAiFunction はソース形式デプロイ非対応](./GenAiFunction%20はソース形式デプロイ非対応.md)
- [Agent Action は Flow が Active でないと IN/OUT 検出されない](./Agent%20Action%20は%20Flow%20が%20Active%20でないと%20IN%20OUT%20検出されない.md)
