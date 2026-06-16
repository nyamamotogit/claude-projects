# Flow Builder の保存できないエラーが見えないケース

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Flow Builder で Start 要素を編集して保存しようとすると「1件のエラーがあります」とだけ出て、どこがエラーか見えない。

---

## 注意点

- 左パネル「マネージャー」タブの警告は表示されるが、保存ブロッカーになる**本当のエラーは UI に出ない場合がある**
- Salesforce の既知の UI バグ
- エラー内容を確認できないため、原因特定が困難

---

## 対処

以下の 3 段階で試す。

### 対処法 1: 編集をキャンセルして破棄

1. Flow Builder 右上の「キャンセル」をクリック
2. 変更を破棄
3. 再度開いて、別の方法で編集（後述の対処法 2 または 3）

---

### 対処法 2: CLI で Flow XML をローカルに retrieve → テキストで修正 → Deploy

```bash
# Flow を取得
sf project retrieve start -m "Flow:FlowName" -o <alias>

# XML を直接編集
# force-app/main/default/flows/FlowName.flow-meta.xml

# デプロイ
sf project deploy start --source-dir force-app/main/default/flows/FlowName.flow-meta.xml -o <alias>
```

**メリット**:
- エラー内容が CLI のデプロイ結果で明示される
- Flow Builder の UI バグを回避できる

---

### 対処法 3: Tooling API 経由で Metadata JSON を直接 PATCH

**注意**: 高度な方法。Tooling API の Flow Metadata 構造を理解している場合のみ。

#### 手順（例）

```bash
# Flow ID 取得
FLOW_ID=$(sf data query -q "SELECT Id FROM FlowDefinition WHERE DeveloperName='FlowName'" -o <alias> --json | jq -r '.result.records[0].Id')

# 最新バージョン番号取得
LATEST_VERSION=$(sf data query -q "SELECT VersionNumber FROM Flow WHERE Definition.DeveloperName='FlowName' ORDER BY VersionNumber DESC LIMIT 1" -o <alias> --json | jq -r '.result.records[0].VersionNumber')

# Tooling API で全メタデータ取得
sf data query -q "SELECT Metadata FROM Flow WHERE VersionNumber=${LATEST_VERSION} AND DefinitionId='${FLOW_ID}'" -t -o <alias> --json > flow_meta.json

# JSON を編集（jq または手動）
# ...

# PATCH で送信（REST API の curl で実施）
# ※ sf CLI では部分的な PATCH 非対応
```

**この方法は複雑なため、対処法 2 を推奨。**

---

## 予防策

- **Flow Builder で複雑な編集をする前に、必ず retrieve でバックアップを取る**
- 特に Start 要素やトリガ条件の変更は、CLI で XML を直接編集する方が安全
- Flow のバージョン管理を Git で行い、いつでも戻せる状態にしておく

---

## 関連項目

- [Metadata API で Draft Flow は Active 化できない](./Metadata%20API%20で%20Draft%20Flow%20は%20Active%20化できない.md)
- [UI Debug はトリガシミュレーション不可](../Flow%20Orchestrator/UI%20Debug%20はトリガシミュレーション不可.md)
