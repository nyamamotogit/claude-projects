# Metadata API で Draft Flow は Active 化できない

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-28  
**最終更新**: 2026-05-13（Scheduled Flow の実害事例を追記）  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処 → 実害事例（Scheduled Flow）

---

## 状況

`<status>Active</status>` を記載した Flow XML を Metadata API 経由でデプロイしたが、org 上で Draft / InvalidDraft のまま残った。

---

## 注意点

- Metadata API は **既存の Draft 版を更新する場合**、`status=Active` を無視して Draft のまま更新する
- **新規作成時のみ** Active が適用される
- Deploy 成功 = XML スキーマが正しいだけで、Active 化が成功したわけではない

---

## 対処

**自動化したい場合は対処法 0 を最優先**。手動なら対処法 1。

### 対処法 0: Tooling API で `FlowDefinition.Metadata.activeVersionNumber` を PATCH（自動化推奨）

CLI から HTTP PATCH 一発で Activate できる公式経路。CI/CD・スクリプト・エージェントから無人で叩ける。

```bash
ORG=floworc-demo
FLOW_NAME=Demo_Reset_Daily_Todos

# 1. FlowDefinition Id と最新版番号を取得
FLOWDEF_ID=$(sf data query --use-tooling-api -o $ORG --json \
  -q "SELECT Id FROM FlowDefinition WHERE DeveloperName='$FLOW_NAME'" \
  | jq -r '.result.records[0].Id')

LATEST_VER=$(sf data query --use-tooling-api -o $ORG --json \
  -q "SELECT LatestVersion.VersionNumber FROM FlowDefinition WHERE DeveloperName='$FLOW_NAME'" \
  | jq -r '.result.records[0].LatestVersion.VersionNumber')

# 2. instanceUrl + accessToken を取得
CREDS=$(sf org display -o $ORG --json | jq -r '.result | "\(.instanceUrl) \(.accessToken)"')
INSTANCE=$(echo $CREDS | awk '{print $1}')
TOKEN=$(echo $CREDS | awk '{print $2}')

# 3. PATCH で activeVersionNumber を最新版に書き換え
curl -s -X PATCH \
  "$INSTANCE/services/data/v63.0/tooling/sobjects/FlowDefinition/$FLOWDEF_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"Metadata\":{\"activeVersionNumber\":$LATEST_VER}}" \
  -w "\nHTTP %{http_code}\n"

# HTTP 204 = 成功
```

**ポイント**:
- `Flow` オブジェクトに対する Tooling API PATCH は "start not connected" エラーになるが、`FlowDefinition` の `Metadata.activeVersionNumber` への PATCH は **問題なく成功**する（別 API）
- 旧 Active 版は自動で Obsolete に。CronTrigger（Scheduled Flow）は次回発火から最新版に切り替わる
- Activate 解除（=非アクティブ化）したい場合は `"activeVersionNumber":null` を送る

### 対処法 1: UI で Active 化（最も簡単）

1. Setup → プロセスオートメーション → フロー
2. 対象 Flow を開く
3. 「有効化」ボタンをクリック

---

### 対処法 2: CLI で削除→再デプロイ（推奨）

既存 Draft 版を destructiveChanges で削除 → 再デプロイ（新規扱いで Active が適用される）

#### 手順

1. destructiveChanges.xml を作成:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>FlowName</members>
        <name>Flow</name>
    </types>
    <version>63.0</version>
</Package>
```

2. 空の package.xml を作成:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <version>63.0</version>
</Package>
```

3. デプロイ実行:

```bash
sf project deploy start --post-destructive-changes destructiveChanges.xml --manifest package.xml -o <alias>
```

4. 通常の Flow デプロイ:

```bash
sf project deploy start --source-dir force-app/main/default/flows/FlowName.flow-meta.xml -o <alias>
```

---

### 対処法 3: Tooling API で `Flow` オブジェクトに全メタデータ送信（非推奨）

> **⚠️ 通常は対処法 0（FlowDefinition への PATCH）を使う**。こちらは `Flow` オブジェクト直接の経路で、複雑かつ部分 PATCH 不可。

GET で全メタデータ取得 → status=Active に変更 → PATCH で全メタデータ送信。

**注意**: 部分 PATCH は "start not connected" エラーになるので、**必ず全体を送ること**。

#### 手順（例）

```bash
# 1. Flow ID 取得
FLOW_ID=$(sf data query -q "SELECT Id FROM FlowDefinition WHERE DeveloperName='FlowName'" -o <alias> --json | jq -r '.result.records[0].Id')

# 2. 最新バージョン番号取得
LATEST_VERSION=$(sf data query -q "SELECT VersionNumber FROM Flow WHERE Definition.DeveloperName='FlowName' ORDER BY VersionNumber DESC LIMIT 1" -o <alias> --json | jq -r '.result.records[0].VersionNumber')

# 3. Tooling API で全メタデータ取得
sf data query -q "SELECT Metadata FROM Flow WHERE VersionNumber=${LATEST_VERSION} AND DefinitionId='${FLOW_ID}'" -t -o <alias> --json > flow_meta.json

# 4. status を Active に変更（jq で編集）
jq '.result.records[0].Metadata.status = "Active"' flow_meta.json > flow_meta_active.json

# 5. PATCH で送信（全メタデータ）
# ※ Tooling API PATCH は REST API の curl で実施（sf CLI では部分的）
```

**この方法は複雑なため、対処法 1 または 2 を推奨。**

---

## 実害事例: Scheduled Flow で旧版が走り続けるパターン（2026-05-13）

`Demo_Reset_Daily_Todos`（毎日 0:15 JST 起動）の修正版（v4: GMT/JST 補正の `JstToday` formula 追加）を CLI deploy したが Draft のまま残り、**旧 v3（補正なし）の CronTrigger が動き続けて毎朝の Task.ActivityDate が前日付けのまま更新されていた**事例。

### 症状の見え方

- `sf project deploy start ... Status: Succeeded` で成功表示 → 完了と誤認
- 翌朝 `Task.ActivityDate = 昨日付け` のまま（GMT/JST バグが直っていないように見える）

### 真因の特定方法（即座に切り分けるクエリ）

```bash
# 1. Active と Latest の食い違いを確認
sf data query --use-tooling-api -o <alias> -q "
  SELECT Id, DeveloperName,
         ActiveVersion.VersionNumber,
         LatestVersion.VersionNumber,
         LatestVersion.Status
  FROM FlowDefinition
  WHERE DeveloperName = '<FlowName>'
"

# Active=v3 / Latest=v4(Draft) なら本症状
```

```bash
# 2. CronTrigger がどのバージョンに紐付いているか
sf data query -o <alias> -q "
  SELECT CronJobDetail.Name, PreviousFireTime, NextFireTime, TimesTriggered, State
  FROM CronTrigger
  WHERE CronJobDetail.Name LIKE '<FlowApiName>-%'
"

# Name='<FlowApiName>-3' のように **バージョン番号がサフィックス** に付く
# = Active 版にしか CronTrigger は発行されない
```

### Schedule Flow 特有の挙動

- **CronTrigger は Active 版（`<ApiName>-<バージョン番号>`）にのみ発行される**
- v4 を Activate すると **v3 用 CronTrigger は自動 Obsolete**、v4 用 CronTrigger が新規発行される
- Activate 前は v4 がいくら正しくても **絶対に動かない**

### 教訓

- Schedule Flow / Orchestrator / 自動起動系は CLI deploy 後に **必ず Activate を確認**
- 確認方法は **画面 (Setup → Flows)** だけでなく **`FlowDefinition.ActiveVersion.VersionNumber` SOQL** で機械的にも確認可能
- 完了報告のチェックリストに「Active 化確認」を明示的に入れる（特に dev 用 sandbox では一晩寝かさないと症状が出ないので翌日まで気付かない）

---

## 関連項目

- [destructiveChanges は FlowDefinition を削除しない](./destructiveChanges%20は%20FlowDefinition%20を削除しない.md)
- [UI Debug はトリガシミュレーション不可](../Flow%20Orchestrator/UI%20Debug%20はトリガシミュレーション不可.md)
- [Scheduled Flow の $Flow.CurrentDate は GMT 評価される](../デモ環境構築時/ScheduledFlow_CurrentDate_GMT評価問題.md) — GMT/JST 補正と組み合わせて出る罠
