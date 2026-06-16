# Agentforce で Rich Text 本文検索を実装する手順（Data Cloud + Retriever Action）

## 何を解決するか

Salesforce の **Rich Text フィールド（textarea with Rich）は SOQL WHERE 句で filter 不可** という制約があり、
Flow の Record Lookup では「本文に特定キーワードを含む稟議」を絞り込めない。
結果、Agentforce から「ドローン測量について書かれた稟議を探して」と聞かれても
件名に「ドローン」が入っていない限りヒットしない。

詳しい経緯: `Agentforce/Flow_RecordLookup_RichText_NotFilterable.md`

この制約を **Data Cloud + Vector Search + Retriever Action** で突破する。
デモ用途では「本文全文の意味検索ができる」訴求が通るようになる。

## 前提

- Data Cloud が Org で有効化されている（`DataStreamDefinition` metadata type が存在する）
- 対象ユーザーに以下の PermissionSet が付与されている:
  - `GenieAdmin` (Data Cloud アーキテクト)
  - `GenieUserEnhancedSecurity` (Data Cloud ユーザー)
- Data Cloud 初期化（Data Space, Default Home Org Data Space）が UI 上で完了している

## 全体フロー（7 ステップ）

```
[1] Data Stream で Ringi__c を取り込み
     ↓
[2] DLO (Data Lake Object) として格納
     ↓
[3] DMO (Data Model Object) へマッピング
     ↓
[4] Search Index / Vector Index 作成（Body_Rich__c を対象フィールドに）
     ↓
[5] Retriever Action 作成（Vector 検索を Agent から呼べる形に）
     ↓
[6] Agentforce Topic の Function に Retriever を追加
     ↓
[7] テスト → Active化
```

## 各ステップ詳細

### [1] Data Stream 作成（UI 操作必須）

**場所**: Setup → Data Cloud → Data Streams → New

1. **Source type**: `Salesforce CRM` を選択（同一 Org 内のオブジェクトを取り込むため）
2. **Connector**: `SFDC_LOCAL`（デフォルトで組織に存在）
3. **Object**: `Ringi__c` を選択
4. **Fields**: 最低限以下を取り込む
   - `Id` (Primary Key)
   - `Name`（稟議番号）
   - `Subject__c`（件名）
   - `Body_Rich__c`（本文 Rich Text ← これが核心）
   - `Ringi_Amount__c`
   - `Drafted_Date__c`
   - `Drafted_Department__c`
   - `CreatedDate`
   - `LastModifiedDate`
5. **Category**: `Engagement`（行動系ログ扱い）または `Other`
6. **Primary Key**: `Id`
7. **Record Modified Date Field**: `LastModifiedDate`
8. **Refresh Mode**: `Full Refresh` or `Incremental`（デモ用途なら Full で毎時取り込み）
9. **Deploy** → Data Stream が Running になるのを待つ（初回数分）

### [2] DLO（Data Lake Object）確認

Data Stream デプロイ成功で自動生成される。UI 上は Data Explorer → Data Lake Objects で確認。
API 名は `Ringi__dll` のような形式。

### [3] DMO（Data Model Object）マッピング

**場所**: Setup → Data Cloud → Data Streams → 作成した Stream を開く → Mappings タブ

1. **Target DMO**: 既存の汎用 DMO を使うか、新規作成
   - デモ用途なら **新規作成** が分かりやすい: 「Ringi」 DMO
2. **Category**: `Other`（Engagement カテゴリは行動データに使う）
3. **Primary Key**: `Ringi__dll.Id__c` → DMO の `Id__c`
4. **Semantic Mapping**: Body_Rich__c → DMO の `Body__c` （Text Long）
5. Save → Deploy

### [4] Search Index / Vector Index 作成

Data Cloud には 2 種類の検索インデックスがある:
- **Semantic Search Index (Vector)**: 埋め込みベースの意味検索。「ドローン測量」→「UAV を使った地形計測」もヒット。**本命**。
- **Full-Text Search Index**: 単語一致。低コストだが意味検索は不可。

**Vector Search Index 作成**

**場所**: Setup → Data Cloud → Search Index → New

1. **DMO**: 上で作った Ringi DMO を選択
2. **Type**: `Vector Database Index`
3. **Chunking**: `Semantic Chunker` または `Fixed-size Chunker (512 tokens)`
4. **Embedding Model**: `OpenAI ada-002` または `Salesforce sfr-embedding-2` （Org に応じて）
5. **Fields to Index**: `Body__c`（本文）+ `Subject__c`（件名）
6. **Metadata Fields**: `Id__c`, `Name__c`, `Drafted_Date__c`, `Ringi_Amount__c` （検索結果で返したい軸）
7. Save → Index ビルドを待つ（数分〜数十分）

ビルド完了すると Index Status が `Ready` になる。

### [5] Retriever Action 作成

Retriever は Agentforce から呼べる検索アクション。

**場所**: Setup → Data Cloud → Retrievers → New

1. **Name**: `Ringi_Body_Retriever`
2. **Label**: `稟議本文 Retriever`
3. **Source**: 上で作った Vector Search Index を選択
4. **Search Type**: `Hybrid` (Vector + Keyword) が精度的にはベスト
5. **Top K**: `5` （返す件数）
6. **Filters（オプション）**: デモ当日は全件対象で OK
7. **Grounding Instruction**: 「ユーザーの発話に意味的に近い稟議本文を返す」
8. Save → Test タブで試行可能

### [6] Agentforce Topic に Retriever を紐付け

Retriever はそのままでは Agent から呼べない。**Agent Action（Invocable）として露出させる**か、**Topic の Instruction から直接呼ぶ**かの 2 ルート。

**ルート A: Agent Action として公開（推奨）**

**場所**: Setup → Agentforce Studio → Agent Builder → 該当 Agent を開く → Actions → New

1. **Action Type**: `Retriever Action`
2. **Retriever**: 上で作った `Ringi_Body_Retriever`
3. **Input schema**: `searchQuery` (string) だけ
4. **Output schema**: 検索結果の Ringi 一覧
5. Save

**ルート B: Plugin の Function に Retriever 型を追加**

現在の `Ringi_SearchByBody` Function を Retriever 型に置き換える。
これは metadata 的には Function の `invocationTarget` を `retriever` に変える変更。
CompDemo / 本プロジェクトには先行実装例がまだ無いので、ルート A の方がトラブル少ない。

### [7] Bot Topic の Function リストに追加 → テスト → Active化

1. `Ringi_Search` GenAiPlugin の `<genAiFunctions>` に新アクションを追加
2. 既存の `Ringi_SearchByBody` は「件名のみ検索」として残す or 削除
3. Instruction を「本文の意味まで検索したいときは Retriever を使う」と追記
4. Agent Testing Center で 3 ケース再テスト
   - 「ドローン測量について書かれた稟議を探して」→ Retriever Action Pass / 結果に Body 断片が含まれる
   - 「去年の秋の 1,000 万超の ICT 稟議」→ 既存の SearchByPeriodAmount Pass
5. Bot を Reactivate

## 既知の落とし穴

1. **Vector Index のビルドに時間がかかる**: 初回は数十分。デモ当日前日までに完了させる
2. **Embedding モデルのライセンス**: Org に `Einstein Generative AI User` が必要
3. **Body_Rich__c の HTML タグ**: Rich Text は `<p>` `<br>` 等が含まれる。Data Cloud の Chunker は HTML-aware のものを選ぶか、DMO マッピング時に strip HTML する変換を挟む
4. **Filter で絞る場合は Metadata Field に含める**: 後から Retriever で期間 filter したいなら、Index 作成時に `Drafted_Date__c` を Metadata Field に含めておかないと後付け不可
5. **データ反映ラグ**: Data Stream は即時同期ではない。Refresh Mode を Incremental にするとリアルタイムに近くなるが、デモ前に必ず Full Refresh を 1 回
6. **Object 名の扱い**: カスタムオブジェクト `Ringi__c` は DLO では `Ringi__dll` のように `__dll` 接尾辞が付く。SOQL ではないので注意

## CLI でできること／UI 必須の境界

| ステップ | CLI 可否 | 備考 |
|---------|---------|------|
| [1] Data Stream | **UI 必須** | `DataStreamDefinition` metadata type はあるが、実質 UI 経由でしか安全に作れない |
| [2] DLO | 自動生成 | Stream デプロイで自動 |
| [3] DMO Mapping | **UI 必須** | `DataSrcDataModelFieldMap` はあるが依存関係が複雑 |
| [4] Search Index | **UI 必須** | `DataObjectSearchIndexConf` は retrieve 可能だが新規作成は UI |
| [5] Retriever | **UI 必須** | Agentforce Studio → Retrievers |
| [6] Topic 紐付け | CLI 可 | `.genAiPlugin-meta.xml` 編集で deploy |
| [7] テスト | CLI 可 | `sf agent test run` |

結論: **Data Cloud 初期構築は UI 作業 60%, CLI 作業 40%** と想定。
一度構築したら `sf project retrieve start -m "DataStreamDefinition:Ringi_Stream"` で XML 化して版管理できる。

## デモ用途での現実解

Data Cloud 構築に手間がかかり、**Vector Index ビルド待機** が読めないと、デモ当日までに完走しないリスク。
以下の判断ツリーで進める:

```
Q1: デモまでに丸 1 日以上使える？
 Yes → Data Cloud 本格実装（本文書の通り）
 No  → Q2
Q2: シーン 2-b の「本文から引く」訴求は絶対必要？
 Yes → 工数確保交渉 or シーン 2-b の表現を弱める
 No  → シーン 2-a（期間＋金額＋件名）のみで訴求し、シーン 2-b カット
```

## 重要: 「データライブラリ」と「Retriever」の違い（2026-05 調査結果）

Trailhead「Agentforce データライブラリの基本」モジュール（https://trailhead.salesforce.com/ja/content/learn/modules/agentforce-data-library-basics ）を一次情報として確認した結果、**Data Library と Retriever は別物**だと判明:

### データライブラリ (Data Library)
- **用途**: **非構造化データ（ファイル・ナレッジ記事）** をエージェントの知識源にする機能
- **選択可能なデータソース**: 公式ユニット原文より「Agentforce には、**ナレッジ記事とファイルのアップロードという 2 つのオプション**があります」
- **UI パス**: Setup → クイック検索「Agentforce Data Library」→ 「New Library」
- **Agent への紐付け**: Agent Builder → **Knowledge（ナレッジ）タブ** で選択
- **4 つの内部概念**: グラウンディング / チャンク / インデックス / レトリーバー（Retriever はデータライブラリの**内部パーツ**として使われている扱い）

### Retriever (Data Cloud)
- **用途**: **構造化データ（DMO）+ Vector Index** を検索する機能
- **対象**: Data Cloud で取り込んだ Data Model Object
- **UI パス**: Setup → クイック検索「Retriever」または「リトリーバー」/ 「Data Cloud Retriever」
- **Agent への紐付け**: Agent Builder → Topic → **Actions** セクションで Retrieval Action として追加

### 判断指針

| やりたいこと | 使う機能 |
|------------|---------|
| ファイル PDF を知識源にする | **データライブラリ**（File-based） |
| ナレッジ記事を知識源にする | **データライブラリ**（Knowledge-based） |
| **カスタムオブジェクトの本文フィールドを意味検索** | **Retriever**（Data Cloud 経由） |
| Data Cloud DMO 全般を検索 | **Retriever** |

### 本プロジェクト（FlowOrchestrationDemo）の場合

- 対象は **Ringi__c の Body_Rich__c（カスタムオブジェクトの Rich Text フィールド）**
- これは **構造化データ** なので **Retriever の守備範囲**
- データライブラリ画面からは作れない（「ファイル」または「ナレッジ記事」しか選択肢がないため）
- **Setup → クイック検索「Retriever」** または **「Data Cloud」→ Retrievers** メニューを探す

### 補足: データライブラリ作成手順（参考）

ファイルベースでデータライブラリを作る手順は Trailhead に明記あり:

1. Setup → クイック検索「Agentforce Data Library」
2. 「New Library」クリック
3. 一意のライブラリ名と説明を入力 → 保存
4. データソースとして「ナレッジ記事」or「Upload Files」を選択
5. ファイル選択後「保存」
6. Agent 側: Agent Builder を開く → **Knowledge タブ** → ライブラリを選択 → Activate

※ 上記は Data Cloud 経由の構造化検索には使えない。本プロジェクトの用途では Retriever 側を使う。

---

## 補足: デモ前のキーワード分布確認（Data Cloud の要否判定）

Data Cloud の検索価値は「**件名に出てこないが本文には書かれている語**」で検索したときに発揮される。
デモ前に以下の SOSL / SOQL でキーワード分布を調べ、**件名検索だけでヒットしないキーワード**を台本発話に採用するのが鉄則。

```apex
// 本文のみにあるキーワードを探すヘルパー
String[] kws = new String[]{'ライセンス', 'Salesforce', '現場', 'UAV'};
for (String k : kws) {
  Integer subjectHits = [SELECT COUNT() FROM Ringi__c WHERE Subject__c LIKE :('%' + k + '%')];
  List<List<SObject>> sosl = Search.query('FIND \'' + k + '\' IN ALL FIELDS RETURNING Ringi__c(Id)');
  Integer soslHits = sosl[0].size();
  System.debug(k + ': Subject=' + subjectHits + ' / 全体=' + soslHits + ' / 本文のみ=' + Math.max(0, soslHits - subjectHits));
}
```

**FlowOrchestrationDemo 実調査結果 (2026-05-04 時点)**:

| キーワード | 件名のみ | 本文のみ | 備考 |
|----------|---------|---------|------|
| ドローン / 測量 | 2 / 2 | 0 / 0 | 件名で引けるので Data Cloud の価値出ない |
| ICT / 端末 | 5 / 2 | 0 / 0 | 件名で引ける |
| **ライセンス** | 4 | **4** | 件名に出てこない稟議に本文に書かれている |
| **Salesforce** | 0 | **3** | 件名に一切出てこない。本文のみ |
| **現場** | 1 | **2** | 建設系でありがちなパターン |

**推奨**: 台本シーン 2-b は「**Salesforce の関連で何か稟議あったよね？**」の発話に変更すると Data Cloud の威力が最大化する。件名に「Salesforce」は 0 件、本文だけ 3 件ヒットする設計。

---

2026-05-04 S-n5p / FlowOrchestrationDemo 稟議デモ構築時に手順調査。
実装着手時は本書を辿る。詰まった箇所は本書末尾に追記。
