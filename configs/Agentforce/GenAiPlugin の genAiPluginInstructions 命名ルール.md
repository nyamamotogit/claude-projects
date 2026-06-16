# GenAiPlugin の genAiPluginInstructions 命名ルール

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

GenAiPlugin の `<genAiPluginInstructions>` に記述するアクション名が、LLM に一致するアクションを見つけられず、エラーレスポンスを返す。

---

## 注意点

- GenAiPlugin の `<genAiPluginInstructions>` に記述するアクション名は、**GenAiFunction の API 名（developerName）** で書く必要がある
- Flow の名前（MasterLabel）で書いても LLM は一致するアクションを見つけられない

---

## 対処

### 誤った記述（Flow の名前）

```xml
<genAiPluginInstructions>
    <description>GetNegligentAccounts アクションを呼び出す</description>
    <sortOrder>1</sortOrder>
</genAiPluginInstructions>
```

**問題**: `GetNegligentAccounts` は Flow の MasterLabel。GenAiFunction の developerName とは異なる。

---

### 正しい記述（GenAiFunction の developerName）

```xml
<genAiPluginInstructions>
    <description>NeglectedAccountListup アクションを呼び出す</description>
    <sortOrder>1</sortOrder>
</genAiPluginInstructions>
```

**ポイント**: `NeglectedAccountListup` は GenAiFunction の developerName（API 名）。

---

## GenAiFunction の developerName 確認方法

### 方法 1: CLI で metadata 一覧取得

```bash
sf org list metadata --metadata-type GenAiFunction -o <alias>
```

出力例:

```
FullName: NeglectedAccountListup
Type: GenAiFunction
```

---

### 方法 2: SOQL で取得

```bash
sf data query -q "SELECT DeveloperName, MasterLabel FROM GenAiFunction" -t -o <alias>
```

出力例:

| DeveloperName | MasterLabel |
|---|---|
| NeglectedAccountListup | GetNegligentAccounts |

---

### 方法 3: ローカル XML を確認

```bash
cat force-app/main/default/genAiFunctions/NeglectedAccountListup/NeglectedAccountListup.genAiFunction-meta.xml
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<GenAiFunction xmlns="http://soap.sforce.com/2006/04/metadata">
    <description>放置状態の取引先を検出する</description>
    <developerName>NeglectedAccountListup</developerName>
    <masterLabel>GetNegligentAccounts</masterLabel>
    <!-- ... -->
</GenAiFunction>
```

---

## 推奨ワークフロー

1. GenAiFunction を UI または CLI で作成
2. `sf org list metadata --metadata-type GenAiFunction` で developerName を確認
3. GenAiPlugin の `<genAiPluginInstructions>` に **developerName** で記述

---

## 関連項目

- [GenAiFunction はソース形式デプロイ非対応](./GenAiFunction%20はソース形式デプロイ非対応.md)
- [GenAiPlugin の function 追加順序](./GenAiPlugin%20の%20function%20追加順序.md)
