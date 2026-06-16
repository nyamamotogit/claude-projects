# Agent Action は Flow が Active でないと IN/OUT 検出されない

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Flow が Draft 状態で Agent Action を作成すると、入力・出力パラメータが自動検出されず、スキーマが `{}` のまま保存される。

---

## 注意点

### 症状

- Agent Action 作成 UI で「入力パラメータ」「出力パラメータ」が空欄
- Agentforce が「技術的なエラー」を返す
- Flow を Apex で直接実行すると正常動作する（Flow は壊れていない）

### 真因

Flow が **Draft 状態**だと、Agent Action 作成 UI は Flow の `isInput=true` / `isOutput=true` 変数を検出できない。

---

## 対処

### 対処法 1: Flow を Active 化してから Agent Action を作成（推奨）

```bash
# Flow を Active 化（CLI または UI）
# CLI の場合は destructiveChanges で Draft を削除 → 再デプロイ（status=Active で新規扱い）

# または UI で「有効化」ボタンをクリック
```

Active 化後、Agent Action を UI で作成すると、入力・出力パラメータが自動検出される。

---

### 対処法 2: Draft で作成してしまった場合は削除→再作成

#### 手順

1. GenAiPlugin の `<genAiFunctions>` から該当 functionName を削除して CLI デプロイ
2. UI で Agent Action を削除
3. Flow を Active 化
4. UI で Agent Action を再作成（パラメータ設定含む）
5. GenAiPlugin に新しい functionName を追記して CLI デプロイ

---

## Agent Action 削除時の注意

GenAiPlugin（トピック）に `<genAiFunctions>` で登録済みの Agent Action を UI から削除しようとすると、以下のエラー:

> `Cannot complete this operation. この生成 AI 関数定義は、Salesforce の他の場所で参照されています。`

**対処順序**:

1. GenAiPlugin の `<genAiFunctions>` から該当 functionName を削除して CLI デプロイ
2. UI で Agent Action を削除

---

## 関連項目

- [GenAiFunction はソース形式デプロイ非対応](./GenAiFunction%20はソース形式デプロイ非対応.md)
- [GenAiPlugin の function 追加順序](./GenAiPlugin%20の%20function%20追加順序.md)
- [Metadata API で Draft Flow は Active 化できない](../Flow%20全般/Metadata%20API%20で%20Draft%20Flow%20は%20Active%20化できない.md)
