# Data Cloud 系 SObject マッピング（2026-05-05 実調査）

Data Cloud / Data 360 で UI から作成した各種オブジェクトが、どの SObject に対応しているかの実調査結果。
CLI / MCP から既存リソースを SOQL で引きたい時に使う。

## UI 概念 → SObject 対応表

| UI 上の概念 | 日本語 UI | SObject 名 | 主要カラム |
|-----------|---------|----------|----------|
| Data Stream | データストリーム | **DataStreamDefinition** (metadata type) | Full Name (ex: `Ringi_c_Home`) |
| Data Lake Object (DLO) | データレイクオブジェクト | `*__dll` 接尾辞の動的 sobject | — |
| Data Model Object (DMO) | データモデルオブジェクト | `*__dlm` 接尾辞の動的 sobject | — |
| **Search Index / 検索インデックス** | 検索インデックス | **`DataSemanticSearch`** | `Name`, `SemanticSearchApiName`, `PrimaryDmo`, `VectorDmo`, `ChunkDmo`, `AttachmentDmo`, `RuntimeStatus`, `SearchType`, `IndexRefreshedOn` |
| Retriever / 取得 | 取得 | **未特定**（2026-05-05 時点） | — |
| Data Library | データライブラリ | 未特定 | — |
| AI Application | AI アプリケーション | `AIApplication` | `DeveloperName`, `Status`, `Type` |

## 分かっている使い方

### 検索インデックスの一覧取得

```bash
sf data query --target-org <alias> \
  --query "SELECT Id, Name, SemanticSearchApiName, PrimaryDmo, VectorDmo, ChunkDmo, RuntimeStatus, SearchType FROM DataSemanticSearch"
```

出力例（FlowOrchestrationDemo 2026-05-05）:
```
Id: 18lIc0000008OKzIAM
Name: Ringi__c_Home
```

### Data Stream の一覧取得

```bash
sf org list metadata --metadata-type DataStreamDefinition --target-org <alias>
```

## 未特定の SObject 候補（今後の調査対象）

次の sobject 名で Retriever が探せる可能性がある（`sobject list -s all` で確認済みの Data Cloud 関連オブジェクト）:
- `DataAssetSemanticGraphEdge`
- `DataSemanticSearch` ← 検索インデックスだと判明済
- `DataSemanticSearchFeed`
- `DataSemanticSearchHistory`
- `SemanticModelChangeEvent`
- `UnstructuredStorageSpace` / `UnstructuredStorageSpaceShare`
- `AIApplication` / `AIApplicationConfig`

### 調査したが使えなかったもの

- `DiscoveryAIModel` metadata type → 「No metadata found」
- `AiRetriever` metadata type → INVALID_TYPE
- `GenAiDataSearch` metadata type → INVALID_TYPE
- `DataObjectSearchIndexConf` metadata type → 「No metadata found」
- `GenAiPluginRetrievalAction` sobject → not supported
- `MLDataDefinition` tooling sobject → 0 records

## 結論

**Retriever (取得) を SOQL で引き当てる手段は 2026-05-05 時点で未確定**。以下の回避策がある:

1. **ユーザーに UI で API 名を教えてもらう**（確実）
2. **`DataSemanticSearch` に紐づくデフォルト Retriever を使う**（Search Index 作成時に自動生成される Retriever）
3. Platform Events / Change Events で Retriever 作成イベントを拾う（要調査）

## Retriever を Agentforce Agent に紐付ける経路

**調査結果**: GenAiPlugin (`*.genAiPlugin-meta.xml`) の `<genAiFunctions>` 要素は **GenAiFunction のみ参照可能** で、Retriever を直接紐付ける構文は存在しない。

正しい紐付けルートは以下のいずれか:

### ルート A: Agent Builder UI で Retriever を Action 化（2026-05-05 検証結果: **このルートは存在しない**）

Topic → Actions セクションから Retriever を直接 Action 化する選択肢は UI に存在しない。
Actions には GenAiFunction しか追加できず、Retriever を参照する導線がない。

### ルート A': プロンプトビルダー経由（正規ルート）

Trailhead 原文: 「実行時には、ユーザーのクエリがプロンプトテンプレートに追加され、関連するデータに接続するレトリーバーを参照します。」

正しい順序:

1. **Retriever 作成**（Data Cloud → Einstein Studio → 取得）
2. **プロンプトテンプレート作成**（設定 → Einstein → プロンプトビルダー）
   - タイプ: Flex
   - Resources で Retriever を参照
3. **そのプロンプトテンプレートを GenAiFunction にラップ**
   - `invocationTarget`: プロンプトテンプレート API 名
   - `invocationTargetType`: `prompt_template` または相当
4. Topic に GenAiFunction として追加

### ルート B: GenAiFunction で Retriever をラップする

Retriever を呼ぶ Apex Action / Flow を 1 枚挟んで、既存の GenAiFunction 経路で呼ぶ。
Apex Invocable で `ConnectApi.DataCloudRetriever.search()` 系を呼び出す。

### ルート A'': Agent Builder の「データ」タブから「データライブラリ」接続（2026-05-05 実機判明・最短正解）

**これが 2026-05 時点の Agentforce 正規ルート**。トレイルヘッド教材にも note 記事にも載っていない UI 導線。

#### 手順

1. **設定 → Agentforce スタジオ → Agentforce エージェント**
2. 対象 Agent を開く（例: 「稟議アシスタント」/ API 名: `Ringi_Agent`）
3. 画面左ペインの **「データ」タブ**（Topics の横・上・下にある）
4. 「データライブラリ」セクションで **「接続」**
5. 既存の Retriever / Data Library を選ぶ

#### ハマりポイント

- **Topic → Actions 経由**では Retriever を選べない（GenAiFunction のみ表示される）
- 「**データ**」タブという専用導線がある
- これを知らないと「データライブラリ割り当てエラー」などの曖昧メッセージで詰まる
- Trailhead モジュール `agentforce-data-library-basics` にも具体手順が載っていない（2026-05 時点）

#### 画面上の表示名

- 日本語: **「データ」タブ** → **「データライブラリ」** セクション → **「接続」**

#### エラー時

「エージェントへのデータライブラリの割り当て中にエラーが発生しました」と Toast で出ることがある。
Console 上は `Toast: please provide at least the "label" property to show the toast` でエラー本文欠落。
Network タブの Fetch/XHR で 4xx/5xx の Response を見て真因特定する。

#### 実戦で遭遇した挙動（2026-05-05 FlowOrchestrationDemo）

- Agent を **無効化状態でデータライブラリを紐付け**: ✅ 成功
- その後 **UI で有効化**: ❌ 「データライブラリ割り当てエラー」Toast
- DevTools Network 確認: 4xx/5xx は出ず、代わりに `aura?r=XX` リクエストが **ステータス 0 / プロトコル unknown** で中断
- **CLI `sf agent activate`** で代替有効化: ✅ 成功

**結論**: UI 経由で「データライブラリ紐付け済 Agent を有効化」する操作が、ブラウザ拡張機能・ネットワーク経路・Aura RPC の組み合わせで止まることがある。
**回避策**: 無効化状態で UI から紐付け → CLI `sf agent activate` で代替有効化。
実績例: Ringi_Agent / 稟議アシスタント、admin@floworchestration.jp.demo、2026-05-05。

#### データライブラリ紐付け後の XML 構造変化（2026-05-05 retrieve 結果）

Agent Builder で「データ」タブからデータライブラリを紐付けると、retrieve した XML 構造が以下のように変わる:

1. **GenAiPlannerBundle が拡張される**
   - `<localTopics>` に Topic 本体が埋め込まれる（旧: GenAiPlugin 単独ファイル参照）
   - `<plannerActions>` に `AnswerQuestionsWithKnowledge_XXX` が自動追加
     - `invocationTarget`: **`streamKnowledgeSearch`**
     - `invocationTargetType`: `standardInvocableAction`
     - **これがデータライブラリ / Retriever 経由の検索実行経路**
   - `<localActionLinks>` に `genAiFunctionName` で参照
2. **Topic / Function 名に内部 ID 接尾辞が付く**
   - `Ringi_Search` → `Ringi_Search_16jIc000000wknW`
   - `Ringi_SearchByBody` → `Ringi_SearchByBody_179Ic000000TREQ`
   - この接尾辞は Org 内部 ID（`16jIc...` は Topic、`179Ic...` は Action）
3. **旧 `genAiPlugins/*/` / `genAiFunctions/*/` ファイルとの二重化**
   - Org 側は新形式（Planner 埋め込み）が正
   - 旧ファイルは参照されない（残しても害はないが、真実の位置が不明瞭）

#### 運用指針

- データライブラリ紐付け後は **Plannerbundle 全体を retrieve し直す** ことで Git 管理を最新化
- 旧 `genAiPlugins/` は delete 可、ただし `sf project deploy` には含まれないので残しても害はない
- 以後の Topic / Instruction 編集は **Planner Bundle 内の `<localTopics>` を直接編集** するのが正解

### 落とし穴: 「データライブラリ」経由で Retriever を紐付けようとして失敗

Agent Builder 画面には **Knowledge / データライブラリ** のセクションもあるが、**そこから Retriever を紐付けようとすると失敗する**:

エラー表示: `エージェントへのデータライブラリの割り当て中にエラーが発生しました`

Console を見ても **Toast 本文が空欠落（"Toast: please provide at least the 'label' property"）** で具体的な原因が画面上に出ない。
Network タブの Response で真因を確認する必要がある（多くの場合、データライブラリは非構造化データ専用で、Data Cloud 構造化 Retriever を受け付けない仕様のため）。

**回避策**: データライブラリ経路ではなく、**Topics → Actions 経路** から Retriever を Action として追加する。

### ルート C: retrieve してメタデータ化

ルート A で UI から紐付けた後、以下で retrieve:

```bash
sf project retrieve start --metadata "GenAiPlugin:<name>" --target-org <alias>
sf project retrieve start --metadata "Bot:<name>" --target-org <alias>
sf project retrieve start --metadata "GenAiPlannerBundle:<name>" --target-org <alias>
```

retrieve した XML に Retriever 参照要素が追加されているはずで、以降は Git 管理 + CLI deploy で回せる。

## 参考: Data Cloud UI の日本語化ラベル

| 英語 | 日本語 |
|-----|-------|
| Data Stream | データストリーム |
| Data Model Object | データモデルオブジェクト |
| Data Lake Object | データレイクオブジェクト |
| Search Index | 検索インデックス |
| Vector Database Index | ベクトルデータベースインデックス |
| **Retriever** | **取得** ← 独特の訳 |
| Data Library | データライブラリ |
| Chunk | チャンク |
| Embedding | 埋め込み |
| Grounding | グラウンディング |
| Hybrid Search | ハイブリッド検索 |

---

2026-05-05 S-n5p FlowOrchestrationDemo で稟議検索 Retriever 作成時に調査。
CLI で Retriever API 名を拾う手段が未確定なのが最大のハマりどころ。
