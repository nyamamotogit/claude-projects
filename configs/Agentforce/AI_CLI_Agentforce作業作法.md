# AI（Claude）が Agentforce を CLI で操作するときの作法

**目的**: AI が Salesforce Agentforce の裏側アセット（Bot / Topic / Action / Flow / テスト定義）を CLI だけで構築・更新・テスト駆動ループするための「**作法マニュアル**」。
正規手順と、つまずいた時の**リカバリ ベストプラクティス**を対で記録する。

**検証開始**: 2026-04-26

---

## 第0章 この作法マニュアルの使い方

- 新しい Org で Agentforce の CLI 操作をする時、まず本章と第1章を読む
- 具体的な操作をする時、該当する章（Flow / Function / Plugin / Bot / AiEvaluation）を開く
- 各章の「**正規手順**」「**詰まったパターン → 原因 → リカバリ**」は実経験ベース
- 新しい失敗パターンを踏んだら必ず当該章に追記

---

## 第1章 前提作法（必ず最初に確認）

### 1.1 プロジェクトルートの確認
- `sf project deploy start` はカレントディレクトリに `sfdx-project.json` があるディレクトリでしか動かない
- 本リポジトリでは `CompDemo/SalesAgentforce/` がプロジェクトルート
- **作業開始時に `cd SalesAgentforce/` するか、コマンドに `--source-dir SalesAgentforce/force-app/...` と絶対パスを渡さない** ← 絶対パスを渡しても `InvalidProjectWorkspaceError` になる

#### 詰まったパターン① [2026-04-26]
- `sf project deploy start --source-dir SalesAgentforce/force-app/main/default/flows/...` をプロジェクトルート（CompDemo/）から叩いたら `InvalidProjectWorkspaceError` で失敗
- **リカバリ**: `cd SalesAgentforce && sf project deploy start --source-dir force-app/main/default/flows/...` でOK

### 1.2 接続確認
- `sf org display --target-org <alias>` で Connected を確認
- Access Token を出力するので公開しないこと

### 1.3 Org 現状確認 SOQL（作業前に必ず実行）
```sql
-- 同名・同役割のエージェント重複確認
SELECT Id, DeveloperName, MasterLabel, Type, AgentType
FROM BotDefinition
ORDER BY LastModifiedDate DESC LIMIT 20
```
- `BotDefinition.IsActive` は**存在しないカラム**。使わない

### 1.4 AiEvaluationDefinition の存在確認
- `SELECT ... FROM AiEvaluationDefinition` は**通常SOQL不可**（sObject非サポート）
- 代わりに `sf org list metadata --metadata-type AiEvaluationDefinition --target-org <alias>` を使う

---

## 第2章 デプロイ順序（正規手順）

### 2.1 依存関係の逆順（下位から）

| 順 | メタデータ | 理由 |
|---|---|---|
| 1 | Flow | Action が参照する実処理 |
| 2 | GenAiFunction | Plugin が参照するアクション |
| 3 | GenAiPlugin | Planner が参照するトピック |
| 4 | Bot + BotVersion | Planner を参照する |
| 5 | Planner Bundle | **CLI デプロイしない**（UIアセットライブラリで紐付け推奨） |
| 6 | AiEvaluationDefinition | Bot が存在してからでないと意味がない |

### 2.2 1つずつデプロイする
- 一度に全部 deploy すると失敗箇所の切り分けができない
- 各ステップで `Status: Succeeded` / `State: Created` を確認してから次へ進む

---

## 第3章 Flow（Agent Action 裏の実処理）

### 3.1 正規手順
```bash
cd SalesAgentforce
sf project deploy start \
  --source-dir force-app/main/default/flows/<FlowName>.flow-meta.xml \
  -o <org-alias> \
  --wait 10
```

**デプロイ結果 `State` の意味（重要）**:
| State | 意味 | 次にやること |
|---|---|---|
| Created | Orgに新規作成された | Active化を試みる |
| Changed | 既存をOrgで更新した | 必要なら再Active化 |
| Unchanged | ローカルとOrgの内容が**完全一致**して変更不要と判定 | 本当に変わっていないか `FlowDefinition` を SOQL で再確認。新規なのにUnchangedなら `sf project delete source` 後に再デプロイが必要な可能性（極めて稀） |
| Failed | XMLスキーマ等でエラー | エラーメッセージに従い修正 |

**重要**: Flow デプロイ成功（State: Created/Changed）は **構文OK** を意味するだけ。Formula構文エラーは Active化時に初めて検出される（§3.4b 参照）。

### 3.2 Flow XML の必須要素
- `<apiVersion>`, `<interviewLabel>`, `<label>`, `<processType>`, `<start>`, `<status>`
- 入力変数: `<variables>` with `<isInput>true</isInput>`
- 出力変数: `<variables>` with `<isOutput>true</isOutput>`
- 自動起動: `<processType>AutoLaunchedFlow</processType>`
- 共有モード: `<runInMode>SystemModeWithoutSharing</runInMode>`（Agent Action 用）

### 3.3 Flow XML の**要素順序**制約

**最頻出エラー**: `Element X is duplicated at this location in type Flow`

**原因**: Flow XSD は要素をアルファベット順で**同種類ブロックをまとめる**必要がある。
例: `<assignments>` が3つあるとき、全て隣接配置しないと「duplicated」と誤検出される

**正規順序（抜粋、アルファベット順）**:
```
apiVersion
assignments × N（全部隣接）
decisions × N
description
dynamicChoiceSets
environments
formulas × N（全部隣接）
interviewLabel
label
loops × N
processMetadataValues
processType
recordCreates
recordDeletes
recordLookups × N
recordUpdates
runInMode
screens
start
status
steps
textTemplates
variables × N（全部隣接）
waits
```

#### 詰まったパターン② [2026-04-26]
- `<assignments>` ブロックを `<decisions>` の前後に分散配置した → `Element assignments is duplicated at this location in type Flow (403:8)` エラー
- **リカバリ**: 同じ要素名は全て連続配置。既存Flow（`GetNegligentAccounts.flow-meta.xml`）の順序を参考にする

### 3.4 既知の地雷
- **COUNT() は Flow フォーミュラで使用不可**（notes-universal §3）。コレクション件数は `Loop + Assignment` で currentCount をインクリメント
- **String × Number の Add は型エラー**。Number を連結する時は `formulas` で `TEXT()` 変換した String型フォーミュラを経由する
- **Metadata API の Flow 更新は status=Active を無視する**（Draft のまま上書き）。Active にしたい時は destructiveChanges で削除→新規デプロイ
- **日付差分**: `TODAY() - DateField` は Number（日数）返す。DAYS() 関数は使えない

### 3.4a Flow XML 作成時チェックリスト（順序制約を確実に守るため）

新規 Flow XML をゼロから書く時は以下の順で整理:

```
<Flow>
  <apiVersion>
  <assignments> × N  ← 同種類の要素は必ず全て隣接配置
  <decisions> × N    ← decisions ブロックの間に他の要素を挟まない
  <environments>
  <formulas> × N     ← ★複数の formulas は絶対に連続配置。間に variables や assignments を挟むと deploy 通ってもデプロイ時`Element X is duplicated`
  <interviewLabel>
  <label>
  <loops> × N
  <processType>
  <recordLookups> × N
  <runInMode>
  <start>
  <status>
  <variables> × N
</Flow>
```

**チェック方法**: `grep -c "^    <assignments>" <flow>.xml` と同じ要素の出現数を数え、すべて**連続しているか目視確認**する。デプロイ前に必ず。

### 3.4b Flow デプロイ成功 ≠ Flow が正常動作 ≠ Active化可能

**重要な3段階**:

1. **デプロイ成功** (`State: Created` / `Changed`): XMLスキーマが正しい。これだけでは実行可能性不明
2. **Formula 構文正常**: Draft→Active 化試行時または UI Flow Builder で開いた時に判明
3. **実行時正常**: 実データで動かしてみて初めて判明

**落とし穴**: Formula の構文エラーは **デプロイでは検出されず、Active化時またはUIで開いた時に初めて判明**する。
- 例: `TEXT(ISBLANK(x), "未設定", TEXT(x))` のような**型不一致な引数**を渡すと、デプロイ成功しても Active化で「数式は無効です: 構文エラー」
- 例: Number 型 Formula に文字列を混ぜると同様

**対処フロー**:
```bash
# 1. デプロイ成功を確認
sf project deploy start --source-dir ${FLOW} -o ${ORG} --wait 10
# State: Created/Changed を確認

# 2. Active化を試みる
sf data update record --sobject FlowDefinition --record-id ${ID} \
  --values "Metadata='{\"activeVersionNumber\":1}'" --use-tooling-api -o ${ORG}
# ↑ ここで "数式は無効です" 系エラーなら Formula 構文ミス
```

**構文エラーデバッグ手順（CLI では詳細エラー見えない）**:
1. Salesforce UI → Setup → プロセスオートメーション → フロー
2. 該当Flowを開く → 「Draft」バージョンを編集
3. 各Formulaを個別に開くと具体的なエラー箇所が赤字で表示される
4. 修正して保存 → UIで直接Active化

### 3.4c Flow Formula の既知落とし穴パターン集（実例）

**パターン①: NULL 許容フィールドは ISBLANK() チェックを先にする**

❌ダメな例:
```
amountText = TEXT({!LoopOpp.Amount})  // Amount=null で構文エラー or 空文字
```

✅正しい例（既存 GetNegligentAccounts.flow-meta.xml 準拠）:
```
amountText = IF(ISBLANK({!LoopOpp.Amount}), "未設定", TEXT({!LoopOpp.Amount}))
```

**パターン②: Number → String 変換は TEXT() で明示**

❌ `summaryBuilder = summaryBuilder & currentCount`（型不一致で assignment 失敗）
✅ まず Formula `currentCountText = TEXT({!currentCount})` を作り、それを連結

**パターン③: 日数計算は `TODAY() - DateField` でOK（Number返却）**

```
staleDays = TODAY() - {!LoopOpp.LastActivityDate}
```
ただし LastActivityDate が NULL だとエラー。先に ISBLANK チェック:
```
staleDays = IF(ISBLANK({!LoopOpp.LastActivityDate}), 9999, TODAY() - {!LoopOpp.LastActivityDate})
```

**パターン④: `DAYS()` / `COUNT()` は Flow Formula で使えない**（notes-universal §3 既出）

**パターン⑤: Formula は1行推奨**

複数行に渡って書くと**一見OKでもparseで倒れる**ことがある。改行を入れるなら文字列リテラル内だけ。

**ゼロから書くよりも既存Flowをコピーして命名だけ変える方が安全**（既存 `GetNegligentAccounts.flow-meta.xml` が同種のリストアップロジックの参考実装）。

### 3.5 リカバリ: デプロイ後に Draft のままになった
- UI で手動 Active 化
- CLI なら destructiveChanges で削除して新規デプロイし直し
- **Tooling API で Active化する方法（最速）**:
  ```bash
  # FlowDefinition ID を取得
  sf data query --use-tooling-api --target-org <alias> \
    --query "SELECT Id, DeveloperName, ActiveVersionId FROM FlowDefinition WHERE DeveloperName = '<FlowName>'"
  # activeVersionNumber を更新
  sf data update record --sobject FlowDefinition \
    --record-id <FlowDefinitionId> \
    --values "Metadata='{\"activeVersionNumber\":1}'" \
    --use-tooling-api -o <alias>
  ```
- **重要**: GenAiFunction の新規作成は Flow が Active でないと `An unexpected error occurred` で失敗する。**Flow を Active 化してから Function をデプロイする順序厳守**

---

## 第4章 GenAiFunction（Agent Action）

### 4.1 正規手順（新規作成）
```bash
cd SalesAgentforce
sf project deploy start \
  --source-dir force-app/main/default/genAiFunctions/<FunctionName> \
  -o <org-alias> \
  --wait 10
```
**`--source-dir` はディレクトリを指定**（3ファイルまとめてデプロイ）

### 4.2 必要な3ファイル
```
genAiFunctions/<FunctionName>/
  ├── <FunctionName>.genAiFunction-meta.xml
  ├── input/schema.json
  └── output/schema.json
```

### 4.3 .genAiFunction-meta.xml 必須要素（実例準拠）
```xml
<?xml version="1.0" encoding="UTF-8"?>
<GenAiFunction xmlns="http://soap.sforce.com/2006/04/metadata">
    <description>...</description>
    <developerName>Xxx</developerName>
    <invocationTarget>FlowName</invocationTarget>
    <invocationTargetType>flow</invocationTargetType>
    <isConfirmationRequired>false</isConfirmationRequired>
    <isIncludeInProgressIndicator>true</isIncludeInProgressIndicator>
    <localDeveloperName>Xxx</localDeveloperName>
    <masterLabel>ラベル名</masterLabel>
    <progressIndicatorMessage>処理中メッセージ</progressIndicatorMessage>
</GenAiFunction>
```
要素順はアルファベット順。`developerName` と `localDeveloperName` は通常同じ値。

### 4.4 schema.json の形式ゆらぎで An unexpected error が出る問題

**既存 `Listup_Neglected_Accounts` と完全一致するようフォーマットを揃えることが最も安全**。

- **input schema 注意点**:
  - `"required": []` を**書かない**（空配列でも省略する）
  - フィールドの順序: title → description → lightning:type → lightning:isPII → copilotAction:isUserInput
  - インデントは**2スペース**、コロン前後に**スペース**あり（` : ` 形式）
- **output schema 注意点**:
  - `copilotAction:isDisplayable` は `false` が標準（LLMに整形させる）
  - 追加必須キー: `copilotAction:isUsedByPlanner: true`, `copilotAction:useHydratedPrompt: false`
  - `"required": [...]` も書かない（notes-universal は「必須」と書いているが、実際の Org では省略する方が安定）

### 4.5 schema.json 必須フィールド（input/output 共通）
```json
{
  "required": ["param1", "param2"],
  "unevaluatedProperties": false,
  "properties": {
    "param1": {
      "title": "param1",
      "description": "...",
      "lightning:type": "lightning__textType",
      "lightning:isPII": false,
      "copilotAction:isDisplayable": true,
      "copilotAction:isUsedByPlanner": true,
      "copilotAction:useHydratedPrompt": false
    }
  },
  "lightning:type": "lightning__objectType"
}
```

- `lightning:type` の値: `lightning__textType` / `lightning__numberType` / `lightning__booleanType` / `lightning__dateType` など
- `copilotAction:isDisplayable`:
  - `true`: LLM の最終回答に出力値をそのまま使わせる
  - `false`: 出力値を内部データとして扱い、LLMが整形し直す（ハイパーリンク生成など）

### 4.5 既知の地雷
- **既存 GenAiFunction の CLI 更新は不可**（`Status: Unchanged` になる）。変更したい時は削除→再作成（`.claude/commands/recreate-genai-function.md` 参照）
- GenAiPlugin から参照されている間は削除できない → Plugin側の `<genAiFunctions>` から外してからでないと消せない

### 4.6 リカバリ: Unchanged 問題
手順（notes-universal §10 章4 準拠）:
1. 参照している GenAiPlugin XML の `<genAiFunctions>` から該当 functionName を削除 → CLI deploy
2. `sf project delete source -m "GenAiFunction:<Name>" -o <alias> --no-prompt`
3. ローカルに3ファイル再作成
4. `sf project deploy start --source-dir <function-dir> -o <alias>`
5. `State: Created` を確認
6. GenAiPlugin XML に `<genAiFunctions>` を戻して再 deploy

---

## 第5章 GenAiPlugin（Topic）

### 5.1 正規手順
```bash
sf project deploy start \
  --source-dir force-app/main/default/genAiPlugins/<PluginName>.genAiPlugin-meta.xml \
  -o <org-alias> \
  --wait 10
```

### 5.2 XMLスキーマの順序制約（厳守）
```xml
<GenAiPlugin>
    <aiPluginUtterances>       <!-- 発話例（任意） -->
    <canEscalate>
    <description>
    <developerName>
    <genAiFunctions>            <!-- Function参照（複数可） -->
    <genAiPluginInstructions>   <!-- 指示（sortOrder順） -->
    <language>
    <localDeveloperName>
    <masterLabel>
    <pluginType>
    <scope>
    <source>                    <!-- 任意 -->
</GenAiPlugin>
```
順序違反すると `Error parsing file: Element invalid at this location` でデプロイ失敗

### 5.3 `<genAiFunctions>` の書き方
```xml
<genAiFunctions>
    <functionName>FunctionApiName1</functionName>
</genAiFunctions>
<genAiFunctions>
    <functionName>FunctionApiName2</functionName>
</genAiFunctions>
```
**1つずつ別タグで囲む**（複数 `<functionName>` を1ブロックに詰めない）

### 5.4 既知の地雷
- **既存 GenAiPlugin の CLI 更新は不可**（upsert不可）。GenAiFunction と同じく削除→再作成
- 参照する GenAiFunction が先に Org に存在していないとデプロイ失敗（`An unexpected error occurred`）

### 5.5 `<genAiPluginInstructions>` の中身は `<description>` であって `<instruction>` ではない

**頻出ミス**: `<instruction>` 要素を使うと以下のエラー:
```
Error parsing file: Element {http://soap.sforce.com/2006/04/metadata}instruction invalid at this location in type GenAiPluginInstructionDef
```

**正規**:
```xml
<genAiPluginInstructions>
    <description>ここに指示テキストを書く</description>
    <developerName>instruction_xxx</developerName>
    <masterLabel>instruction_xxx</masterLabel>
    <sortOrder>1</sortOrder>
</genAiPluginInstructions>
```
※ `<language xsi:nil="true"/>` は任意。省略してもデプロイ可。

**また**: GenAiPlugin ルート要素には `<developerName>` が必要（`<localDeveloperName>` とは別）

### 5.6 Instructions のアクション名は **developerName を書く**
```
NeglectedAccountListup アクションを呼び出す  ← ✅ developerName
放置取引先リストアップアクションを呼び出す    ← ❌ ラベル名はLLMが紐付けできない
```

---

## 第6章 Bot + BotVersion

### 6.1 正規手順（新型 AgentforceEmployeeAgent）

**重要: Planner Bundle を先に Org にデプロイしてから Bot をデプロイする**
- BotVersion は `conversationDefinitionPlanners.genAiPlannerName` で Planner Bundle を参照する
- Planner Bundle が Org に無いと `値を入力してください: [PlannerId]` エラーでデプロイ失敗

```bash
# 1. Planner Bundle を先にデプロイ
sf project deploy start \
  --source-dir force-app/main/default/genAiPlannerBundles/<BotName> \
  -o <org-alias> --wait 10

# 2. Bot + BotVersion をデプロイ
sf project deploy start \
  --source-dir force-app/main/default/bots/<BotName>/ \
  -o <org-alias> --wait 10
```
ディレクトリごとデプロイ（`.bot-meta.xml` と `v1.botVersion-meta.xml` がセット）

### 6.2 Bot XML の型
```xml
<Bot>
    <agentDSLEnabled>false</agentDSLEnabled>
    <agentTemplate>EmployeeCopilot__AgentforceEmployeeAgent</agentTemplate>
    <agentType>AgentforceEmployeeAgent</agentType>
    <botMlDomain>
    </botMlDomain>                         <!-- 新型では空要素が正解 -->
    <botSource>None</botSource>
    <contextVariables>...</contextVariables>  <!-- 既存Botからコピー推奨 -->
    <description>...</description>
    <label>...</label>
    <logPrivateConversationData>false</logPrivateConversationData>
    <richContentEnabled>true</richContentEnabled>
    <sessionTimeout>0</sessionTimeout>
    <type>InternalCopilot</type>           <!-- 新型でも InternalCopilot -->
</Bot>
```

### 6.3 BotVersion XML
```xml
<BotVersion>
    <fullName>v1</fullName>
    <conversationDefinitionPlanners>
        <genAiPlannerName>BotName</genAiPlannerName>  <!-- Bot名と同一 -->
    </conversationDefinitionPlanners>
    <copilotPrimaryLanguage>ja</copilotPrimaryLanguage>
    <entryDialog>Welcome</entryDialog>
    <toneType>Casual</toneType>
    ...
</BotVersion>
```

### 6.4 既知の地雷
- **Active Bot は編集不可**。変更前に `sf agent deactivate --api-name <name> -o <alias>` で非アクティブ化
- **BotType は一度作ると変更不可**。ローカル .xml と Org の type が違うと `BotType を更新できません` エラー
- **BotVersion v1 は Save/Deploy どちらで更新しても v1 上書き**。v2以降は UI で「Create New Version」明示クリックのみ
- **contextVariables を減らすとデプロイ失敗リスク**。既存新型Botから全量コピーが安全

### 6.5 リカバリ: BotType 不整合エラー
```bash
# Org から現行 Bot の type を確認
sf project retrieve start -m "Bot:<BotName>" -o <alias>
# retrieve した .bot-meta.xml の <type> に合わせてローカルを修正
```

### 6.6 ボットユーザーの権限不足
- `sf agent create` で作成した Bot のボットユーザーは Account/Opportunity等への読み取り権限ゼロ
- CLI preview（`sf agent preview`）はボットユーザー権限で動くため「ID を繰り返し要求する」等の症状
- 対処: 権限セットを作成してボットユーザーに割り当て（agentforce-deployment-notes §1 参照）

---

## 第7章 Planner Bundle（Bot の Planner）

### 7.1 新規作成時は CLI デプロイ可（最小構成）

**新規Botの初回作成時は CLI で OK**（2026-04-26 jdo2026で検証済み）。
最小構成の `.genAiPlannerBundle` XML:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<GenAiPlannerBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <description>説明</description>
    <localTopicLinks>
        <genAiPluginName>PluginDeveloperName</genAiPluginName>
    </localTopicLinks>
    <masterLabel>表示名</masterLabel>   <!-- 必須 -->
    <plannerType>AiCopilot__ReAct</plannerType>  <!-- 必須 -->
</GenAiPlannerBundle>
```

### 7.2 **既存 Planner Bundle の更新は避ける**
新型 AgentforceEmployeeAgent では以下の理由で **UI 主導** が原則:
- Planner Bundle XML は**全量置換**デプロイ → 既存 localTopics が silent に消える
- `plannerActions/<funcName>/input/schema.json` 必須（XML単独だと `An unexpected error occurred`）
- UIアセットライブラリから紐付ける方が確実（GenAiPlugin が Org にあれば自動でアセット化）

### 7.3 既存Bundleへのトピック追加 正規手順
1. GenAiPlugin を **先に** Org にデプロイ
2. Bot を Org にデプロイ（Planner Bundle は Salesforce が自動生成）
3. Agent Builder UI → Topics → **「Add from Asset Library」** → 該当 GenAiPlugin を追加
4. 紐付いた状態で `sf project retrieve start -m "GenAiPlannerBundle:<BotName>" -o <alias>` でソース管理に入れる

### 7.4 リカバリ: UIで紐付けたトピックが消えた
- 原因: 誰かが Planner Bundle の XML を CLI で上書きデプロイした（全量置換）
- 対処: UI から再度「Add from Asset Library」で紐付け直し
- 再発防止: 重要作業前に `sf project retrieve start -m "Bot:<BotName>" -m "GenAiPlannerBundle:<BotName>"` で Git バックアップ

---

## 第8章 AiEvaluationDefinition（テストセンター）

### 8.1 正規手順
```bash
sf project deploy start \
  --source-dir force-app/main/default/aiEvaluationDefinitions/<Name>.aiEvaluationDefinition-meta.xml \
  -o <org-alias> \
  --wait 10
```

**AiEvaluationDefinition は upsert 可能**。既存のものも同じコマンドで更新される（GenAiFunction/Plugin と違い便利）。

### 8.2 XML 構造
```xml
<AiEvaluationDefinition>
    <name>表示名</name>
    <subjectName>BotDeveloperName</subjectName>
    <subjectType>AGENT</subjectType>
    <!-- subjectVersion は新型では不要（既存実装に揃える） -->
    <testCase>
        <expectation>
            <expectedValue>PluginName</expectedValue>
            <name>topic_assertion</name>
        </expectation>
        <expectation>
            <expectedValue>[&apos;FunctionName&apos;]</expectedValue>
            <name>actions_assertion</name>
        </expectation>
        <expectation>
            <expectedValue>期待する出力内容の自然言語記述</expectedValue>
            <name>output_validation</name>
        </expectation>
        <inputs>
            <utterance>ユーザー発話</utterance>
        </inputs>
        <number>1</number>
    </testCase>
</AiEvaluationDefinition>
```

### 8.3 expectation の運用ポリシー
- **並び順は仕様上任意** だが、レビュー容易性のため `name` 昇順（actions → output → topic）で揃える
- `actions_assertion` の値は JSON 配列風文字列。**シングルクオートは `&apos;` にエスケープ**

### 8.4 テスト実行
```bash
sf agent test run --api-name <AiEvaluationDefName> -o <alias> --wait 10 --result-format json
```

### 8.5 既知の地雷
- `SELECT FROM AiEvaluationDefinition` は sObject 非サポート。確認は `sf org list metadata --metadata-type AiEvaluationDefinition`
- `sf agent test run --json` の出力構造は**初回実行時に実際のJSONを確認する**（ドキュメントと差異あり）
- **`Not available for deploy for this organization` エラー**: Org が Agentforce Testing Center 機能を有効化していない
  - 症状: デプロイが「Not available for deploy for this organization」で失敗
  - 確認コマンド: `sf org list metadata --metadata-type AiEvaluationDefinition -o <alias>` で "No metadata found" になる場合は未有効化の可能性高い

### 8.6 Testing Center 機能の有効化条件（2026-04-26 判明）

**Org種別による可否**:
| Org種別 | Testing Center 有効化 |
|---|---|
| 本番Org（Demo org含む） | **BlackTab での「Manage Org Permissions」操作が必要**。Salesforce SE（内部エンジニア）でしか実行不可 |
| Sandbox | **作成時から自動で利用可能** |
| Scratch Org | 未検証（Sandbox と同等と推測） |

**実務的な影響**:
- 本番相当のDemo Org（jdo2026等）で CLI デプロイを試すと、縦串の末尾（AiEvaluationDefinition）だけ不可
- ユーザー側で対応不可、SE依頼が必要
- **代替運用パターン**:
  1. Sandbox で検証してから本番に持っていく（本番は機能有効化済みの別Orgを選ぶ）
  2. Testing Center 無しで進めて、Agent Builder UI の手動テスト + LLM 審査で代用
  3. SE に Manage Org Permissions を依頼

**Claude側の先読み動作**:
- 新しい Org で Agentforce テスト駆動ループをする前に、以下を確認:
  ```bash
  sf org list metadata --metadata-type AiEvaluationDefinition -o <alias>
  ```
  `No metadata found` が返れば Testing Center 未有効化の可能性。

**Testing Center 未有効化が判明したら必ずユーザーに確認する（自動で選ばない）**:

確認テンプレート:
```
Testing Center が <alias> で未有効化のようです（AiEvaluationDefinition が "Not available for deploy" または metadata が空）。
どちらで進めますか？

① Sandbox に切り替える（Sandbox なら作成時から有効）
② Salesforce SE に BlackTab の Manage Org Permissions 経由で有効化を依頼
③ Testing Center 無しで進める（Agent Builder UI + LLM 審査で代用）
```

理由:
- Claudeが勝手にSandbox作成や別Org接続を試みるのは不可逆・事故リスクが高い
- 「SEに依頼して待つ」は時間コストがユーザー判断案件
- 有効化は30分〜1日で終わることが多い（2026-04-26 検証時、即時反映を確認）
- 同日に `sf project deploy start -m "AiEvaluationDefinition:..."` が Succeeded に転換したことから、**有効化は即座にCLI挙動を変える**

---

## 第9章 テスト駆動ループの実行作法

### 9.1 ループ開始前の準備
1. `git status` でワーキングツリークリーン確認
2. `sf project retrieve start -m "Bot:<BotName>" -m "GenAiPlannerBundle:<BotName>" -o <alias>` でバックアップ
3. `git add . && git commit -m "baseline before test-driven loop"`
4. ブランチ切る（推奨）

### 9.2 1ラウンド = デプロイ → テスト → 判定
```bash
# 1. テスト実行
sf agent test run --api-name <Test> -o jdo2026 --wait 10 --result-format json > temp/log/run-$(date +%s).json

# 2. 結果パース（テストケース単位で pass/fail を切り分け）

# 3. FAIL の場合: 切り分け
#    - topic_assertion FAIL → Planner Instructions / Topic Description 改訂
#    - actions_assertion FAIL → Topic Instructions / Action Description 改訂
#    - output_validation FAIL → Flow / Function schema 改訂
```

### 9.3 無限ループ防止
- 同一 testCase への改訂試行は**最大3回**
- 上限到達でアインシュタイン → 人間エスカレーション

### 9.4 複数層同時 FAIL
- **基本方針**: 上位層優先（topic → actions → output）
- **緊急時**（retry_count >= 2 かつ複数層FAIL）: 全層同時手当て

---

## 第10章 Org 書き込み前の必須チェックリスト

作業開始前に以下を全て確認:

- [ ] プロジェクトルート（`sfdx-project.json` のあるディレクトリ）にいるか
- [ ] `sf org display -o <alias>` で Connected 確認
- [ ] `git status` でワーキングツリーの状態把握
- [ ] 同名・同役割のアセットが Org に既に存在しないか SOQL/metadata list で確認
- [ ] 書き込み対象 Bot が Active なら先に Deactivate
- [ ] destructiveChanges を含むなら UI削除の方が速いか検討
- [ ] アッピーレビューを通したか（計画書§8.4 引き渡しフォーマット）

---

## 第11章 Claude（AI）特有の作法

### 11.1 コンテキスト汚染防止
- 長時間作業で名前が似たメタデータが脳内で混線しやすい
- 書き込み操作前に必ず `ls` / `sf data query` で**現物を再確認**
- メモリや過去会話だけで判断しない（古い情報が残る）

### 11.2 代行判断の境界
- **読み取り操作**（SOQL / retrieve / list）: 単独判断OK
- **ローカルファイル編集**: 計画に沿っていれば単独判断OK
- **Org書き込み操作**: 必ずアッピー（Opus）レビューを挟む
- **destructiveChanges / 削除系**: ユーザー確認推奨（UI代替の検討）

### 11.3 「UIお願いします」の後の再開メッセージ
- ユーザーからの「お願いします」「続けて」「やりました」は **UI作業完了の報告**
- **新規CLI作成の許可と誤解しない**（notes-universal §「UIお願いします再開時の必須確認」）
- 再開時は **Org現状確認 SOQL を必ず実行**して、直前のUI作業結果を取りこぼさない

### 11.4 Org機能未有効化に当たったときの対話プロトコル

**Org機能（Testing Center 等）が未有効化と判明したら、AI は先に進まず必ずユーザーに確認を取る**。

確認すべき典型:
- Testing Center UI 有効化（BlackTab → Manage Org Permissions、SE作業）
- Data Cloud / Genie 関連のライセンス
- 各種パイロット機能

選択肢の提示テンプレ:
1. **Sandbox に切替**: 該当機能が作成時から有効なことが多い
2. **SE 等に有効化依頼して待つ**: 有効化で即時CLIが通るようになる
3. **機能なしで代替運用**: UI手動テスト、LLM審査のみ等

不可逆操作（Sandbox新規作成、別Org接続作業）をAI単独で始めない。

### 11.5 エラーメッセージの扱い
- `An unexpected error occurred` は Salesforce側の具体情報欠落 → 直前の変更を疑う
- `Status: Unchanged` は**エラー相当**（meta が更新されていない）
- `Element X is duplicated` は XMLスキーマ順序違反を疑う
- `TypeInferenceError` は aiApplication 系など CLI 非対応メタデータ → 退避

---

## 第12章 テスト駆動ループのE2Eレシピ（コピペで回せる）

PoCで検証済みの「仕様→裏側構築→テスト→更新ループ→監査」の**最短コマンド列**。
新しいOrgに初回適用する時のテンプレとして使う。変数は `${...}` 部分を置換。

### 12.1 準備フェーズ

```bash
# 1. Org 接続確認
sf org display -o ${ORG_ALIAS}

# 2. Org 現状確認（同名Bot衝突チェック）
sf data query -o ${ORG_ALIAS} \
  --query "SELECT DeveloperName, AgentType FROM BotDefinition ORDER BY LastModifiedDate DESC LIMIT 20"

# 3. Testing Center 有効化チェック（`No metadata found` が返れば未有効化）
sf org list metadata --metadata-type AiEvaluationDefinition -o ${ORG_ALIAS}
# ↑ 未有効化ならユーザー確認 → Sandbox切替 / SE依頼 / UI手動運用 の選択肢を提示

# 4. プロジェクトルートへ
cd ${PROJECT_ROOT}  # sfdx-project.json があるディレクトリ

# 5. retrieve でGitバックアップ（既存Botがある場合のみ）
sf project retrieve start -m "Bot:${BOT_NAME}" -m "GenAiPlannerBundle:${BOT_NAME}" -o ${ORG_ALIAS}
git add . && git commit -m "baseline before test-driven loop"
```

### 12.2 仕様→裏側構築（初回デプロイ）

デプロイ順序（**必須**）:

```bash
# STEP 1: Flow デプロイ
sf project deploy start --source-dir force-app/main/default/flows/${FLOW_NAME}.flow-meta.xml \
  -o ${ORG_ALIAS} --wait 10

# STEP 2: Flow を Active 化（Tooling API）
FLOW_DEF_ID=$(sf data query --use-tooling-api -o ${ORG_ALIAS} \
  --query "SELECT Id FROM FlowDefinition WHERE DeveloperName='${FLOW_NAME}'" --json | \
  python3 -c "import json,sys; print(json.load(sys.stdin)['result']['records'][0]['Id'])")
sf data update record --sobject FlowDefinition --record-id ${FLOW_DEF_ID} \
  --values "Metadata='{\"activeVersionNumber\":1}'" --use-tooling-api -o ${ORG_ALIAS}

# STEP 3: GenAiFunction デプロイ（ディレクトリ指定で3ファイル同時）
sf project deploy start --source-dir force-app/main/default/genAiFunctions/${FUNCTION_NAME} \
  -o ${ORG_ALIAS} --wait 10

# STEP 4: GenAiPlugin デプロイ
sf project deploy start --source-dir force-app/main/default/genAiPlugins/${PLUGIN_NAME}.genAiPlugin-meta.xml \
  -o ${ORG_ALIAS} --wait 10

# STEP 5: Planner Bundle デプロイ（Bot より先！）
sf project deploy start --source-dir force-app/main/default/genAiPlannerBundles/${BOT_NAME} \
  -o ${ORG_ALIAS} --wait 10

# STEP 6: Bot+BotVersion デプロイ
sf project deploy start --source-dir force-app/main/default/bots/${BOT_NAME} \
  -o ${ORG_ALIAS} --wait 10

# STEP 7: AiEvaluationDefinition デプロイ（テストセンター登録）
sf project deploy start --source-dir force-app/main/default/aiEvaluationDefinitions/${AI_EVAL_NAME}.aiEvaluationDefinition-meta.xml \
  -o ${ORG_ALIAS} --wait 10
```

### 12.3 テスト実行→更新ループ

```bash
# テスト実行（JSON出力を保存してパース）
sf agent test run --api-name ${AI_EVAL_NAME} -o ${ORG_ALIAS} \
  --wait 10 --result-format json > temp/log/run-$(date +%Y%m%d-%H%M%S).json

# 失敗したアサーションを抽出
cat temp/log/run-*.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for tc in data['testCases']:
    for r in tc['testResults']:
        if r['result'] != 'PASS':
            print(f\"FAIL: {r['name']} score={r['score']} reason={r['metricExplainability']}\")"
```

**失敗時の切り分け**（計画書§5.2）:
- `topic_assertion` FAIL → Planner Instructions / Topic Description 改訂
- `actions_assertion` FAIL → Topic Instructions / Action Description 改訂
- `output_validation` FAIL → Flow / Function schema 改訂 または **フェーズ4へ（期待値の方が悪いかも）**

### 12.4 更新→再テスト（重要: upsert 可能なので通常 deploy で OK）

```bash
# 裏側の該当層を修正後
sf project deploy start --source-dir ${TARGET_FILE} -o ${ORG_ALIAS} --wait 10

# 再テスト
sf agent test run --api-name ${AI_EVAL_NAME} -o ${ORG_ALIAS} \
  --wait 10 --result-format json > temp/log/run-retry-$(date +%Y%m%d-%H%M%S).json
```

**検証済み**: GenAiPlugin / GenAiFunction / AiEvaluationDefinition は **upsert 可能**（State: Changed で通常更新）。notes-universal の旧「削除→再作成」ルーチンは、`copilotAction:isDisplayable` 等の schema.json 深部フィールド以外は不要。

### 12.5 フェーズ4: 実質合格判定のアッピー呼び出しテンプレ

LLM判定プロンプト（アッピー起動時の要約テンプレ、計画書§6.4参照）:
- 入力: ユーザー発話、期待値、実回答、LLM判定score & reason
- 出力JSON: `verdict` (SUBSTANTIAL_PASS / TRUE_FAILURE), `action` (UPDATE_TEST / UPDATE_IMPLEMENTATION / ESCALATE), `suggested_expectation`

### 12.6 フェーズ5: 挙動監査のアッピー呼び出しテンプレ

`verdict` (CLEAN / CONCERN / ESCALATE), `findings[]` (severity / observation / reasoning / fix), `mobile_check_required`

---

## 付録A: 実績ログ（時系列）

### 2026-04-26
- PoC縦串デプロイ開始（jdo2026）
- **Flow デプロイ**:
  - 1回目: `InvalidProjectWorkspaceError` → CompDemo/ から叩いた。cd SalesAgentforce で解決
  - 2回目: `Element assignments is duplicated (403:8)` → XML要素順序違反。assignments を連続配置に再構成
  - 3回目: **成功**（`State: Created`, Elapsed 5.29s）
- **Flow の Active化**:
  - デプロイ直後は Draft 状態（`FlowDefinition.ActiveVersionId=null`）
  - Tooling API で `FlowDefinition.Metadata.activeVersionNumber=1` を更新して Active 化
  - コマンド: `sf data update record --sobject FlowDefinition --record-id <FlowDefinitionId> --values "Metadata='{\"activeVersionNumber\":1}'" --use-tooling-api -o <alias>`
- **GenAiFunction デプロイ**:
  - 1回目: `An unexpected error occurred (ErrorId: 279445000-...)` → Flow が Draft 状態だった（Active化する前にデプロイした）
  - 2回目: Flow Active化したのに `An unexpected error occurred (ErrorId: 384954034-...)` → schema.json の微妙な形式違い
  - 原因: input側に `"required": []` を入れていた（省略すべき）、output側の `copilotAction:isDisplayable` を `true` にしていた（`false` が安定）
  - 対処: 既存 `Listup_Neglected_Accounts/input/schema.json` と `output/schema.json` にフォーマット完全一致させる（キーの順序、インデント、truefalse値）
  - 3回目: **成功**（3ファイルとも Created）
- **GenAiPlugin デプロイ**:
  - 1回目: `Element instruction invalid at this location in type GenAiPluginInstructionDef (9:22)` → `<genAiPluginInstructions>` の中身は `<instruction>` ではなく `<description>`＋`<developerName>`＋`<masterLabel>`＋`<sortOrder>` が正解
  - 修正後 2回目: **成功**（Created）
  - また、`<developerName>` ルート要素が必要（localDeveloperName とは別）
- **Planner Bundle デプロイ（Bot より先）**:
  - 1回目: `Required field is missing: masterLabel` → Bundle XMLに `<masterLabel>` と `<plannerType>AiCopilot__ReAct</plannerType>` が必須
  - 2回目: **成功**（Created）
- **Bot デプロイ**:
  - 1回目: `Required field is missing: label (6:18)` → `<botMlDomain>` を空要素にしたのが原因。`<label>` と `<name>` を記入する必要あり
  - 2回目: Bot 本体は成功、**BotVersion が `値を入力してください: [PlannerId]` でエラー** → Planner Bundle が先に Org に存在していないと BotVersion をデプロイできない
  - 3回目（Planner Bundle を先にデプロイ後に再試行）: **Bot+BotVersion 両方成功**（State: Created × 2）
- **AiEvaluationDefinition デプロイ**:
  - 1回目: `Not available for deploy for this organization` → **jdo2026 はデモOrgで Testing Center UI が未有効化**
  - 判明した制約: 本番相当Orgでは BlackTab の「Manage Org Permissions」操作が必要で、これは Salesforce SE しか操作できない
  - Sandbox では作成時から利用可能
  - 2026-04-26 有効化対応 → 2回目デプロイ **成功**（Created、1.44s）
- **sf agent test run 初回実行**:
  - コマンド: `sf agent test run --api-name TestDriven_PoC_StaleOpp_Test -o jdo2026 --wait 10 --result-format json`
  - **全3アサーション PASS**（topic_assertion / actions_assertion / output_validation、output_validation score=5/5）
  - 実行時間: 約1分40秒（17:41:46 開始 → 17:43:28 完了）
  - 結果JSON構造（抜粋・実測）:
    ```json
    {
      "inputs": {"utterance": "..."},
      "status": "COMPLETED",
      "testNumber": 1,
      "testResults": [
        {"name": "actions_assertion", "result": "PASS", "score": 1,
         "actualValue": "...", "expectedValue": "...", "metricExplainability": ""},
        {"name": "output_validation", "result": "PASS", "score": 5,
         "metricExplainability": "LLMの判定理由テキスト"},
        {"name": "topic_assertion", "result": "PASS", "score": 1}
      ]
    }
    ```
  - 重要な発見: **output_validation は LLM が自動判定する**（score 1-5）。`metricExplainability` に判定理由が自然言語で入る。計画書§9.4の未検証リスク「output_validation 自動判定するか」は **判定する** と確定

- **フェーズ3体験（意図的FAIL→裏側更新→PASS復帰）**:
  - 手段: GenAiPluginの Instruction を「絶対に呼び出さない」と真逆にして `sf project deploy start` で更新
  - **重要な修正**: GenAiPlugin 更新は `State: Changed` で成功（**upsert可能**）。notes-universal §10 章3 の「GenAiPlugin 既存更新は upsert 不可、削除→再作成が唯一」は**事実と異なる**と確認。通常更新でOK。
  - テスト結果: `actions_assertion=FAILURE`, `output_validation=FAILURE(score 2)`, `topic_assertion=PASS` → 計画書§5.2の切り分けフローチャート通り
  - 修正＆再デプロイでPASS全復帰（所要1分半）
  - 体感値: 1ラウンド＝「修正→deploy→test実行→判定」は3分以内

- **フェーズ4体験（期待値厳格化→実質合格判定→テスト側更新）**:
  - 手段: AiEvaluationDefinition の `output_validation.expectedValue` を「①集計表②ステージ内訳③トップ3提案を含む」という過剰厳格な文言に書き換え
  - テスト結果: `output_validation=FAILURE (score 2/5)`, LLM指摘「集計・内訳・トップ3が無い」
  - アッピー判定: `verdict=SUBSTANTIAL_PASS`, `confidence=0.9`, `action=UPDATE_TEST`
  - テスト側緩和（XMLコメントに緩め理由埋込）→ 再デプロイ → 全PASS（score 5/5）復帰
  - 重要な発見: **AiEvaluationDefinition は upsert 可能（`State: Changed`）**。sf project deploy start で通常更新できる。

- **フェーズ5体験（合格時挙動監査）**:
  - 手段: 全PASS状態の実回答をアッピーに監査させる
  - 発見: score 5/5 でも業務的には問題あり
    - High: 停滞日数が全件「―」で根拠欠落（Task/Event未連携データを「停滞」として誤提示）
    - High: 母数37件中10件表示なのに「合計10件」とだけ記載、誤認リスク
    - Medium: ソート基準未提示、デフォルトパラメータ注記なし、Opportunity リンク無し
  - 重要な発見: **テスト合格 ≠ 業務合格**。フェーズ5の監査ステップは必須。計画書§7.2の観点（冗長/スロット/根拠薄い）は実運用で機能する

### 2026-04-26（フェーズ3〜5検証まとめ）

| 発見 | インパクト |
|---|---|
| GenAiPlugin CLI更新は upsert 可能 | 削除→再作成の面倒な手順を回避できる。notes-universal 要修正 |
| AiEvaluationDefinition も upsert 可能 | テスト定義は `sf project deploy start` で普通に更新 |
| output_validation は LLM自動判定 (score 1-5) | テスト駆動ループの自動化が現実的 |
| テスト合格≠業務合格 | フェーズ5監査が実効的。合格時も必ず1回は監査 |

---

## 付録B: この作法と横展開ノートの関係

- このファイル（`AI_CLI_Agentforce作業作法.md`）: **AI が CLI で操作する時の手順**
- `.claude/notes-universal.md`: **Salesforce 開発一般の注意点**（AI専用ではない）
- `.claude/agentforce-deployment-notes.md`: **個別の Agentforce トラブル事例**
- `.claude/commands/recreate-genai-function.md`: **GenAiFunction 削除→再作成の定型コマンド**

新しい知見は当該ファイルに書く（本書は「AI×CLIで Agentforce を組む時の作法」に限定）。

---

*最終更新: 2026-04-26*
