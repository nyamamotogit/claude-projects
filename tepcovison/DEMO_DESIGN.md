# TEPCO HD × Salesforce Vision Demo 設計書

> 用途: Salesforce Innovation Center (SIC) で TEPCO HD 関常務向けに見せる Vision デモのHTMLモック設計。
> 実装方針: **Sonnet がこの設計書だけを見て HTML/CSS/JS のモックを完成できる**ように、画面・データ・台詞・演出をすべて具体化する。
> 想定: 実装は単一HTMLファイル＋同梱CSS/JS（ビルド不要）。本物の Salesforce / LWC を作るわけではないが、**「LWCで開発した Lightning Experience に見える」精度**を目指す。Tableau埋め込み・各種SaaSロゴ・複数データソース連携の"絵"も含める。

---

## 0. 全体ゴール

- 関常務（VIP, 経営層）に **「現場の入口は Salesforce のまま、AI が SAP・Teams・M365・AWS を束ねて働く」** 未来像を**体感**させる。
- To-Be ディスカッションペーパー（System of Engagement / Agency / Work / Context の4層）と画面要素を**1:1で対応付け**、デモ中に "今この層が動いている" を可視化する。
- 12〜15分・4シーン・主人公1人（田中：法人営業マネージャー）で完結。

---

## 1. ブランディング (TEPCO 準拠)

Salesforce Lightning Experience の構造はそのままに、**TEPCO ブランドカラーで上書き**する。

| 要素 | 値 |
|---|---|
| Primary (Header / Active Tab Bar) | `#003F8C` (TEPCO ブルー) |
| Secondary | `#0070C0` |
| Accent (CTA / リンク) | `#E60012` (TEPCO レッド・ワンポイント) |
| Background | `#F3F3F3` |
| Card Surface | `#FFFFFF` / border `#DDDBDA` |
| Text Primary | `#080707` |
| Text Secondary | `#3E3E3C` |
| Success / Warning / Error | `#2E844A` / `#FE9339` / `#EA001E` |

**ロゴ**: 左上に「TEPCO HD」テキストロゴ + 小さく "Powered by Salesforce" を併記（雲アイコン）。
**アプリ名**: 「TEPCO Workspace」。
**フォント**: `'Salesforce Sans', 'Hiragino Sans', 'Yu Gothic UI', sans-serif`。日本語混在で破綻しないこと。

---

## 2. 技術構成（モックの実装指針）

- **単一 `index.html`** + `assets/style.css` + `assets/app.js` （またはインライン）。
- **SLDS CSS を CDN 読込み**して土台を本物っぽく:
  ```html
  <link rel="stylesheet" href="https://unpkg.com/@salesforce-ux/design-system@2.21.0/assets/styles/salesforce-lightning-design-system.min.css">
  ```
  その上に `tepco-overrides.css` で色だけ上書き（CSS変数 `--slds-c-button-brand-color-background` 等）。
- **アイコン**: SLDS Utility/Standard SVG sprite を CDN 経由で利用。社外SaaSロゴ（SAP/Teams/M365/AWS/Slack/Tableau/ServiceNow/SharePoint）は `assets/logos/*.svg` に配置（Sonnet は inline SVG または public CDN を使う）。
- **画面遷移**: SPA 風に div の表示切替で4シーンを進める。`?scene=1〜4` の URL ハッシュで直接ジャンプできる。
- **演出**:
  - Coworker の応答は **1文字ずつタイピング表示**（20–30ms/char、`<span class="cursor">▍</span>` 点滅付き）。
  - A2A連携時は「✓ 設備保全Agent」「✓ 人事Agent」を順次フェードイン（各300ms）。
  - シーン進行は右下「次のシーンへ ▶」ボタン or キーボード `→`。
- **データ**: すべて `assets/data.js` の JSON で定義（API呼び出しなし）。
- **Tableau 埋め込み**: 実 Tableau ではなく、**Tableau風ダッシュボード画像 or Chart.js で再現**し、左上に Tableau ロゴ + "Embedded from Tableau Cloud" のチップを置く。

---

## 3. レイアウト仕様

### 3.1 グローバルシェル（全シーン共通）

```
┌──────────────────────────────────────────────────────────────────────┐
│ [TEPCO HD] TEPCO Workspace      [🔍 Ask Anything...]   [+][🔔3][👤田中] │ ← 高さ56px, 背景 #003F8C
├──────────────────────────────────────────────────────────────────────┤
│ [App Launcher⋮⋮] ホーム | 取引先 | 商談 | 設備 | ケース | 申請 | レポート | … │ ← 高さ40px, 白背景
├────────────────────────────────────────────────┬─────────────────────┤
│                                                │                     │
│  Main Canvas (1100px〜)                        │  Coworker Panel     │
│                                                │  (固定 400px, 右)   │
│                                                │                     │
└────────────────────────────────────────────────┴─────────────────────┘
[左下フローティング: To-Be Layer Indicator]  [右下: 次のシーン ▶]
```

#### To-Be Layer Indicator（左下・常時表示・80×280px）

縦に4段、いまアクティブな層が **TEPCOブルーで点灯** + パルスアニメ:
```
🟦 Engagement   ← Coworker 対話中はここが光る
⬜ Agency       ← 専門Agent呼出中
⬜ Work         ← Salesforce/SAP レコード操作中
⬜ Context      ← Data Cloud / M365 / AWS データ参照中
```
クリックで「この層では○○が動いています」のツールチップ表示。

### 3.2 Coworker パネル（右側固定）

- 上部: アバター(Astro風) + 「TEPCO Coworker」+ ステータスドット(緑)
- 中部: チャット履歴。ユーザー発話は右寄せ青背景白文字、Coworker は左寄せ白背景。
- Coworker の発話内には **構造化カード**を埋める（後述の各シーン参照）。各カードの右上に**出典バッジ**（SAP / Teams / Slack / SharePoint / Tableau / Data Cloud）。
- 下部: 入力ボックス + マイクアイコン + ✈送信。
- 入力欄上に**サジェストチップ**（シーンごとに変わる、3〜4個）。クリックで自動入力＆送信。

---

## 4. 4シーン詳細台本

各シーンに **(A) 画面状態 / (B) サジェストチップ / (C) ユーザー発話 / (D) Coworker 応答（カード仕様まで） / (E) 演出 / (F) 訴求メッセージ** を定義する。

### 🎬 シーン1: 朝のブリーフィング（Engagement → Agency 横断）

**(A) 画面**: ホームタブ。Main Canvas は左に「今日の予定（カレンダー風カード）」、右に「お知らせ」、中央に「主要KPI（Tableau埋め込み小ウィジェット）」。Coworker パネル展開済み。Layer Indicator は **Engagement 点灯**。

**(B) サジェストチップ**:
- 今日のタスクを教えて
- 急ぎの承認待ちは？
- 11時の会議の準備状況

**(C) ユーザー**: 「おはよう。今日のタスクと、急ぎ対応すべきものを教えて」

**(D) Coworker 応答（順にタイピング表示）**:

> おはようございます、田中さん。複数のシステムを横断して確認しました。

**カード1: 今日のサマリー**（出典バッジ: M365 / SAP / Slack / Salesforce）
| 区分 | 件数 | 詳細 |
|---|---|---|
| 🔴 期限超過 | 1 | 関電力 特高契約更改（本日17時）|
| 🟠 承認待ち | 2 | SAP経費 ¥48,200 / SAP購買 ¥1.2M |
| 💬 重要メンション | 3 | Teams 2 / Slack 1 |
| 📅 会議 | 4 | 直近: 11:00 関電力 役員定例 |

**カード2: 最優先アクション**
> 🔥 **関電力「特高契約更改 2026」が本日期限**
> ・契約書ドラフト: SharePoint に最新版あり
> ・SAP 与信チェック: **未実施**
> ・先方キーマン議事録: Teams 5/28 にあり
>
> [📋 まとめて準備する]  [📅 関係者を招集]

**(E) 演出**:
- カード1の各行が出現する瞬間に、行末の出典ロゴ（SAP/M365/Slack）が一瞬光る。
- カード2の「まとめて準備する」をホバーすると、ボタンが TEPCO レッドに変化。

**(F) 訴求**: 「全社員が毎朝開く Salesforce のホームに立つだけで、SAP・Teams・M365・Slack の重要事項が**勝手に集まる**」

---

### 🎬 シーン2: 商談を AI と進める（Work層: Salesforce + SAP + Tableau）

**(A) 画面遷移**: 「まとめて準備する」クリック → 取引先「関電力株式会社」レコードページへ。

**Record Page 構成**:
- **Highlights Panel**（青グラデ #16325C → #1B5297）: 取引先名 / 業種「電力・エネルギー」 / 年商 ¥85B / 担当 田中健一 / 取引ステータス「Active・特高」
- **左カラム (60%)**:
  - 詳細情報カード（住所・代表者・連絡先・契約区分）
  - **「財務サマリー」カード（SAP連携） — 右上に SAP ロゴ + "Live from S/4HANA"**
    - 直近12ヶ月売上 ¥2.85B / 未収金 ¥0 / 与信枠残 ¥1.2B / 支払遅延 0件
    - ミニ折れ線グラフ（Tableau埋込スタイル、月次売上推移）+ "Embedded from Tableau Cloud" チップ
  - 関連商談リスト（5件、特高契約更改がハイライト）
  - 関連ケースリスト（6件、すべて Closed）
- **右カラム (40%)**: Coworker パネル（シーン1から文脈継続）

**Layer Indicator**: **Work 点灯** + Context 薄点灯。

**(B) サジェストチップ**:
- 特高契約更改の状況をまとめて
- 過去のPPA提案事例は？
- 会議資料を作って

**(C) ユーザー**: 「特高契約更改の状況を整理して。SAPの取引と、先方の最新ニーズも込みで」

**(D) Coworker 応答**:

**カード1: 商談ステータス**（出典: Salesforce）
- 商談名: 特高契約更改 2026 / 金額 ¥320M / 確度 75% / 期限 本日17:00 / フェーズ 提案中

**カード2: SAP 取引健全性**（出典: SAP S/4HANA）
- 売上トレンド: 前年比 +6%（製造業向け増） ✓
- 与信: 余裕あり / 未収金 ¥0 ✓
- 取引リスク: **低**

**カード3: 先方の最新ニーズ**（出典: Teams 5/28 議事録 + Slack #営業-関東）
- 「省エネ提案を歓迎、PPA併用検討したい」（先方 山田部長 発言）
- 競合A社が同じ枠で動いている兆し（Slack 6/3）
- → **PPA 併用提案テンプレ**が活用できそうです

**カード4: 推奨アクション**（CTAボタン3つ）
- [📝 提案ドラフトを Word で作成]
- [📊 経営会議資料を PPT で作成]
- [📨 関係者3名に Teams で会議招集]

**(E) 演出**:
- 「提案ドラフトを Word で作成」をクリック → 画面右上に**トースト**（緑）「M365 Word に下書きを作成しました [開く]」
- 同時に Coworker チャットに「ドラフトの要点3つ:…」と要約が追記される

**(F) 訴求**: 「Salesforce のレコードページから離れずに、SAP・Tableau・M365 のアウトプットが揃う」

---

### 🎬 シーン3: 設備トラブル横断対応（Agency層 A2A の見せ場）

**(A) 画面遷移**: グローバルヘッダーの 🔔 通知 から「変電所Aアラーム」クリック → ケースレコードページへ。

**Record Page 構成**:
- Highlights Panel: ケース番号 #00012345 / 優先度 **Critical (赤バッジ点滅)** / 発生 09:42 / 場所 神奈川・川崎変電所A
- 左カラム:
  - アラート詳細（センサー値・温度推移ミニグラフ）
  - **設備マスタ連携カード（出典: AWS IoT + SAP PM）**: 設備ID, 設置年月, 直近点検日, メーカー
  - **地図カード**: 変電所A ピン + 半径20km の技術者ピン3名（カラーピン色分け）
- 右カラム: Coworker

**Layer Indicator**: **Agency が強く点灯 + Engagement / Work / Context すべて薄点灯**（横断であることを表現）。

**(B) サジェストチップ**:
- 類似事例と対応手順は？
- いま動ける技術者は？
- 必要な部品の在庫は？

**(C) ユーザー**: 「変電所Aの異常、過去の類似事例、出動可能な技術者、必要部品の在庫を一気に教えて」

**(D) Coworker 応答 — A2Aオーケストレーション可視化**:

応答冒頭で**専用パネル**を表示（重要演出）:
```
┌─ 🤖 関連エージェントに問い合わせ中 ─────────┐
│  ✓ 設備保全Agent（過去ログ照合中... 1.2s）   │
│  ✓ 人事Agent（在席・スキル照合中... 0.8s）   │
│  ✓ 調達Agent（部品在庫確認中... 1.5s）       │
│  ✓ 安全管理Agent（作業ルール確認... 0.6s）   │
└──────────────────────────────────────────────┘
```
（各行を順にチェックマーク化、最後に「✅ 4Agent から回答を統合しました」）

**カード1: 類似事例**（設備保全Agent / 出典: SharePoint + Data Cloud）
- 2024/11 変電所C 同型トランス過熱事例（復旧3.2時間）
- 復旧手順書 v2.3 [SharePoint リンク]
- 当時の作業者: 佐藤健一（→ 今回も推奨）

**カード2: 出動可能技術者**（人事Agent / 出典: M365 Teams 在席 + 人事DB）
| 氏名 | スキル | 距離 | 状態 |
|---|---|---|---|
| 佐藤 健一 | 高圧 ★★★ / 過去対応経験あり | 8km | **対応可** ✓ |
| 鈴木 隆 | 中圧 ★★ | 12km | 会議中 |
| 高橋 美咲 | 高圧 ★★ | 18km | 対応可 |

**カード3: 部品在庫**（調達Agent / 出典: SAP MM）
- 油圧センサー TYPE-3: 川崎倉庫 在庫6個 ✓
- 冷却ファンユニット: 横浜倉庫 在庫2個（要確認）

**カード4: 安全注意事項**（安全管理Agent / 出典: 社内規程DB）
- 高圧活線作業: 二人作業必須 / 絶縁手袋点検期限内であること
- 該当作業の最新KY書テンプレ: [リンク]

**カード5: 推奨アクション**
- [🚨 佐藤健一さんに出動依頼]（Teamsで通知＋カレンダー登録）
- [📦 川崎倉庫に部品ピッキング指示]（SAPに作業オーダー起票）
- [📋 KY書ドラフトを作成]

**(E) 演出**:
- 「出動依頼」クリック → 2つのトースト連続表示:
  1. 「Teams で佐藤健一さんに通知しました」
  2. 「SAP に作業オーダー WO-2026-0612-003 を起票しました」
- ケースの Highlights Panel のステータスが「New」→「In Progress」に変化。

**(F) 訴求**: 「**1つの問いが4つのAgentと4つのシステムを動かす**。これが A2A オーケストレーション」

---

### 🎬 シーン4: 経営ブリーフィング（Context層・Tableau の見せ場）

**(A) 画面遷移**: アプリ切替で「Executive Cockpit」アプリへ。
- ナビは「サマリー / 法人営業 / 小売 / 設備 / 人材」。
- Main Canvas は **3×2 の Tableau ダッシュボード埋め込みグリッド**。各タイルの左上に Tableau ロゴ + データソース名（Data Cloud / SAP BW / AWS Redshift）。

**ダッシュボードタイル構成**:
1. **売上 vs 計画**（折れ線, 出典: SAP BW）
2. **法人パイプライン**（縦棒スタック, 出典: Salesforce + Data Cloud）
3. **顧客解約予兆スコア Top10**（ヒートマップ, 出典: Data Cloud）
4. **設備リスクマップ**（日本地図, 出典: AWS IoT + SAP PM）
5. **現場の声トピック**（ワードクラウド, 出典: Teams + Slack を Data Cloud に集約）
6. **再エネ供給比率**（ゲージ, 出典: AWS データレイク）

**Layer Indicator**: **Context 強点灯**。

**(B) サジェストチップ**:
- 今期の進捗とリスクを3つ
- 現場で何が話されてる？
- 解約予兆の上位顧客と理由

**(C) ユーザー（関常務想定）**: 「今期の法人営業の進捗とリスク、現場の声を3行でまとめて」

**(D) Coworker 応答**:

**サマリーカード（最上段に大きく表示）**:
> ✅ **進捗**: 売上 計画比 102%, パイプライン前年比 +8%。Q2 着地はプラス見込み。
> ⚠ **リスク**: 製造業セグメント使用量 ▲5%（3社で工場縮小兆候）/ 関電力 PPA に競合A社接近 / 大口10社中2社で問合せ急増（解約予兆スコア 0.78↑）。
> 💬 **現場の声**: 「再エネメニュー資料が古い」(42回) / 「与信回答が遅い」(28回) / 「PPA提案テンプレ整備希望」(19回)。

**ドリルダウンカード（クリックで Tableau タイルがズーム）**:
- 各リスク項目の右に [📊 ダッシュボードで見る] ボタン → 該当 Tableau タイルが拡大表示

**推奨アクション**:
- [📅 製造業セグメント緊急レビュー会議を設定]
- [📝 再エネメニュー資料更新を広報部に依頼]

**(E) 演出**:
- サマリーの3行が**3秒かけて1行ずつフェードイン**。
- 「ダッシュボードで見る」クリックで該当タイルが画面中央にモーダル拡大、Tableau ツールバー（ロゴ・フィルタ・Download）も再現。

**(F) 締めメッセージ**:
> 「**社員の入口は Salesforce、頭脳は AI、手足は SAP / Teams / M365 / AWS**。
> 既に TEPCO HD で全社員が使う Salesforce が、明日からこの未来の入口になります。」

---

## 5. データ定義（モック用 JSON）

`assets/data.js` に以下を定義する。

### 5.1 ユーザー
```js
const CURRENT_USER = {
  name: "田中 健一", role: "法人営業部 マネージャー",
  avatar: "assets/avatar/tanaka.png", department: "法人営業本部"
};
```

### 5.2 通知（ヘッダーベル）
```js
const NOTIFICATIONS = [
  { id:1, type:"deadline", icon:"clock", text:"関電力 特高契約更改 期限本日17:00", source:"Salesforce" },
  { id:2, type:"approval", icon:"approval", text:"SAP経費承認 ¥48,200", source:"SAP" },
  { id:3, type:"approval", icon:"approval", text:"SAP購買承認 ¥1.2M", source:"SAP" },
  { id:4, type:"alert",    icon:"warning", text:"変電所A 温度異常アラート", source:"AWS IoT" }
];
```

### 5.3 取引先 / 商談 / ケース
```js
const ACCOUNT_KANDEN = {
  name:"関電力 株式会社", industry:"電力・エネルギー",
  revenue:"¥85B", owner:"田中 健一", tier:"特高",
  address:"東京都千代田区...", representative:"山田 太郎",
  sap: { sales12m:"¥2.85B", ar:"¥0", creditAvailable:"¥1.2B", overdue:0 }
};
const OPPS_KANDEN = [
  { name:"特高契約更改 2026", amount:"¥320M", probability:75, stage:"提案中", closeDate:"2026-06-12", flag:"deadline" },
  { name:"PPA併用提案",       amount:"¥150M", probability:40, stage:"検討中", closeDate:"2026-09-30" },
  /* 他3件 */
];
const CASE_SUBSTATION = {
  number:"00012345", subject:"川崎変電所A 温度異常",
  priority:"Critical", status:"New", openedAt:"2026-06-12 09:42",
  asset:"TR-KWS-A-03 (3φ油入トランス)", installed:"2014-03",
  lastInspection:"2026-04-18", manufacturer:"X電機"
};
```

### 5.4 技術者 / 部品 / 類似事例
```js
const ENGINEERS = [
  { name:"佐藤 健一", skill:"高圧 ★★★", distanceKm:8, status:"available", note:"2024年同型対応経験" },
  { name:"鈴木 隆",   skill:"中圧 ★★",  distanceKm:12, status:"in_meeting" },
  { name:"高橋 美咲", skill:"高圧 ★★",  distanceKm:18, status:"available" }
];
const PARTS = [
  { name:"油圧センサー TYPE-3", warehouse:"川崎倉庫", stock:6, ok:true },
  { name:"冷却ファンユニット",   warehouse:"横浜倉庫", stock:2, ok:false }
];
const SIMILAR_CASES = [
  { date:"2024-11-08", site:"変電所C", summary:"同型トランス過熱", recoveryHrs:3.2, doc:"復旧手順書 v2.3" }
];
```

### 5.5 経営ダッシュボード（数値はダミー）
```js
const EXEC_KPIS = {
  salesVsPlan: 1.02, pipelineYoY: 0.08,
  risks:[
    { id:1, label:"製造業セグメント使用量 -5%", level:"high", source:"SAP BW" },
    { id:2, label:"関電力 PPA に競合A接近",     level:"medium", source:"Slack" },
    { id:3, label:"大口10社中2社 解約予兆 0.78↑", level:"high", source:"Data Cloud" }
  ],
  voiceTopics:[
    { topic:"再エネメニュー資料が古い", count:42 },
    { topic:"与信回答が遅い",           count:28 },
    { topic:"PPA提案テンプレ整備希望",  count:19 }
  ]
};
```

### 5.6 シーン別 Coworker スクリプト
`SCENES = [{ id, suggestions:[], userMessage, agentResponse:[ {type:"text"|"card", ...} ] }]` の形で全台詞をデータ化し、JS は配列をなぞって描画するだけにする。

---

## 6. コンポーネント設計（HTML/CSSモジュール）

LWC 風に「コンポーネント単位」でクラス命名。実装は単なる div だが、**`data-component="c-xxx"` 属性**を付けて "LWCで作った風" を演出。

| コンポーネント | クラス名 | 主な責務 |
|---|---|---|
| グローバルヘッダー | `c-global-header` | ロゴ・グローバル検索・通知・プロフィール |
| アプリナビ | `c-app-nav` | タブ切替 |
| ホームレイアウト | `c-home-layout` | カレンダー / お知らせ / KPI |
| レコードページ | `c-record-page` | Highlights + 2カラム |
| Highlights Panel | `c-highlights-panel` | 青グラデ + コンパクト項目 |
| 詳細カード | `c-detail-card` | タイトル+項目グリッド |
| 関連リスト | `c-related-list` | テーブル+件数バッジ |
| Tableau埋込 | `c-tableau-tile` | ロゴ・ツールバー・チャート |
| Coworkerパネル | `c-coworker-panel` | チャット履歴・入力・サジェスト |
| Coworkerカード | `c-coworker-card` | 出典バッジ付き構造化応答 |
| A2A可視化 | `c-a2a-orchestrator` | 4エージェントのチェック演出 |
| Layerインジケータ | `c-layer-indicator` | 4層点灯 |
| トースト | `c-toast` | 右上スライドイン |
| 通知ドロップダウン | `c-notification-popover` | ベルクリック展開 |

各コンポーネントは独立した `<section>` で、ヘッダーは SLDS の `slds-card`, `slds-page-header`, `slds-grid` を流用。

---

## 7. 出典バッジ仕様

Coworker カードや SAP/Tableau タイルの右上に必ず付ける「出所が分かる」ピル。

```html
<span class="c-source-badge" data-source="sap">
  <img src="assets/logos/sap.svg"> Live from S/4HANA
</span>
```

| データソース | バッジ文言 | 色 |
|---|---|---|
| Salesforce | "Salesforce CRM" | 青 |
| SAP S/4HANA | "Live from S/4HANA" | SAPブルー |
| SAP BW | "From SAP BW" | SAPブルー |
| Microsoft Teams | "From Teams" | Teams紫 |
| Microsoft 365 | "M365 Graph" | M365赤 |
| SharePoint | "SharePoint" | 青緑 |
| Slack | "From Slack" | Slack紫 |
| AWS IoT | "AWS IoT Core" | AWSオレンジ |
| AWS Redshift | "AWS Redshift" | AWSオレンジ |
| Tableau | "Tableau Cloud" | Tableau青 |
| Data Cloud | "Salesforce Data Cloud" | 紺 |
| ServiceNow | "ServiceNow" | 緑 |

**実装**: ロゴSVGはinline化、なければ Simple Icons (https://simpleicons.org) のCDNからSVG取得。

---

## 8. 進行制御（演出スクリプト）

```js
// 疑似コード
async function runScene(sceneId) {
  setLayerIndicator(scene.activeLayers);
  renderMain(scene.mainView);
  await sleep(400);
  await typeUser(scene.userMessage);    // ユーザー発話を入力欄に流し込む演出
  await sleep(300);
  for (const block of scene.agentResponse) {
    if (block.type === "a2a") await renderA2A(block.agents);
    else if (block.type === "text") await typewriter(block.text);
    else if (block.type === "card") await fadeInCard(block);
  }
  enableActionButtons(scene.actions);
}
```

キーボード操作:
- `→` / Space: 次のシーン
- `←`: 前のシーン
- `R`: 現シーンをリプレイ
- `1`〜`4`: シーン直接ジャンプ

---

## 9. アクセシビリティ & 解像度

- **対象解像度**: 1920×1080 をベースに、1440×900 でも崩れないよう min-width 1280。
- 文字サイズは本物の Lightning より **+1pt** 大きめ（役員が見やすいよう）。
- コントラスト比 WCAG AA 準拠。
- 効果音は無し（プレゼン環境配慮）。

---

## 10. 成果物ファイル構成

```
tepcovison/
├── index.html                # シェル + シーン切替の枠
├── assets/
│   ├── style.css             # SLDS上書き + TEPCO ブランディング
│   ├── app.js                # シーン進行・タイピング・A2A演出
│   ├── data.js               # 全モックデータ
│   ├── logos/
│   │   ├── tepco.svg
│   │   ├── salesforce.svg
│   │   ├── sap.svg / teams.svg / m365.svg / sharepoint.svg
│   │   ├── slack.svg / aws.svg / tableau.svg / datacloud.svg
│   └── img/
│       ├── avatar-tanaka.png
│       ├── map-kawasaki.png       # シーン3の地図（静的画像可）
│       └── tableau-tile-*.png     # シーン4の各ダッシュボード（chart.jsで動的でも可）
└── DEMO_DESIGN.md            # （本書）
```

---

## 11. Sonnet への実装指示（要約）

1. **`index.html` 1ファイルに全部入れて良い**（assets を inline 可）。最初は単一ファイル動作優先。
2. SLDS を CDN で読み込み、その上に TEPCO カラーの CSS 変数を**最後に**上書きする。
3. シーンは4つ。`?scene=N` で直接ジャンプ可、右下「次へ」ボタンで進む。
4. Coworker の発話は**必ずタイピング演出**を入れる（生成AI感）。
5. 各 Coworker カードには**必ず出典バッジ**を1つ以上付ける。
6. シーン3の **A2A オーケストレーション可視化**は最重要演出。順次チェックマーク表示を必ず実装。
7. シーン4の Tableau タイルは Chart.js で簡易グラフでもよい。**ただし左上に Tableau ロゴ + "Tableau Cloud" バッジ**を必ず置く。
8. Layer Indicator は左下に常駐し、シーンごとに該当層を点灯させる。
9. ブランドカラーは `#003F8C`（TEPCO ブルー）を Primary、`#E60012`（TEPCO レッド）はワンポイント（CTA / Critical バッジのみ）。
10. 日本語フォント崩れに注意。`'Hiragino Sans', 'Yu Gothic UI'` を fallback に。
11. **本物の Salesforce に見えること** > 機能の網羅性。動かなくても見栄えを優先。
12. すべてのデータは `data.js` 相当に集約し、台詞・カード内容を**簡単に差し替え可能**にする。

---

以上。この設計書をそのまま Sonnet に渡して `index.html` 一式を生成させる前提で書かれています。
