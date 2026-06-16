---
name: salesforce-lightning-mockup
description: Salesforce Lightning Experience風の画面モックアップを単一HTMLとして作成・修正する。SLDS公式CSS (slds-* クラス + 個別SVGアイコン) ベース。Recordページ、リストビュー、Home、ダッシュボード、Service Console、カンバン等のページタイプと、Buttons / Modals / Toasts / Path / Data Table / Tabs / Tiles / Forms / Page Header 等のSLDSコンポーネントを完備。Salesforce画面・SLDSコンポーネント・取引先/商談/リード/ケース等のレコードページを作成・編集するときに使用する。
---

# Salesforce Lightning UI Mockup Skill

Salesforce Lightning Experience風の画面モックアップを **単一のHTMLファイル** として組み立てるためのテンプレート集。**SLDS公式CSSをベース**にしつつ、ヘッダー・ナビゲーションなど SLDS が想定していない部分は最小限の自前 CSS で補完する構成。

## ⚠️ 最重要ルール (これを守らないと画面が崩れる)

過去のトライ＆エラーで判明した「絶対やらない」「必ずやる」リスト。**新規生成時は必ずこれをチェック**。

| やる/やらない | 内容 | 理由 |
| --- | --- | --- |
| ❌ 使わない | **Tailwind CSS (`<script src="...cdn.tailwindcss.com">`)** | Tailwind の Preflight が SLDS の `<ul>`/`<button>`/`<table>` 等を全部潰して画面が崩れる。`preflight: false` 設定でも干渉が残る |
| ❌ 使わない | **`<svg><use xlink:href="...symbols.svg#xxx"/></svg>` のスプライト参照** | `file://` で開いた時にCORSで弾かれてアイコンが透明になる |
| ❌ 使わない | **`slds-timeline` クラス** | 内部で `overflow: hidden` + `line-height: 1` が複数当たっており、テキストが切れる。代わりに自前 `sf-timeline*` クラスを使う |
| ❌ 使わない | **`slds-truncate` をタイトル系に使う** | 切り詰められて「中村役員 四半期…」のように欠ける |
| ❌ 使わない | **`Einstein`** | 古いブランド。**Agentforce** に統一する。アイコンは `utility/agent_astro.svg` |
| ✅ 必ずやる | アイコンは **`<img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/{sprite}/{name}.svg">`** で個別読み込み | スプライト参照より確実 |
| ✅ 必ずやる | utility アイコンは **CSS `filter` でグレー化** (個別SVGは fill="#fff" のため白背景で透明になる) | 見た目を本物に近づける |
| ✅ 必ずやる | ヘッダー・ナビ・タイムラインは **自前クラス (`sf-*`)** で書く | SLDS は記録ページ以外を想定していない |
| ✅ 必ずやる | `<body class="slds-scope">` を必ず付ける | SLDS スタイルがスコープされるため |

## 🚦 使い方の決め手（最初にこれを見る）

ユーザーの依頼を読んで、まず **どのページタイプか** を判断する。

| ユーザーの言葉 | 使うテンプレート |
| --- | --- |
| 「取引先」「商談」「ケース」のレコード詳細 | `templates/record-page.html` |
| 「一覧」「リストビュー」「テーブル」 | `templates/list-view.html` |
| 「ホーム」「ダッシュボードの上のページ」 | `templates/home-page.html` |
| 「カンバン」「ステージ別ボード」 | `templates/kanban.html` |
| 「Service Console」「ケース管理画面」「3ペイン」 | `templates/console.html` |
| 「ダッシュボード」「KPI」「グラフ」 | `templates/dashboard.html` |

## 📁 ディレクトリ構成

```
.claude/skills/salesforce-lightning-mockup/
├── SKILL.md                  ← このファイル
├── style-tokens.html         ← CDN リンク・カスタム CSS・SLDS 早見表
├── templates/                ← ページタイプ別フルHTML
│   ├── record-page.html
│   ├── list-view.html
│   ├── home-page.html
│   ├── kanban.html
│   ├── console.html
│   └── dashboard.html
└── components/               ← SLDS コンポーネントスニペット集
    ├── global-shell.html     ← Global Header + App Nav + Utility Bar
    ├── page-header.html
    ├── path.html
    ├── buttons.html
    ├── badges.html
    ├── modals.html
    ├── toasts.html
    ├── data-table.html
    ├── forms.html
    ├── activity-timeline.html
    ├── tiles-tree.html
    ├── agentforce-panel.html
    └── slack-channel-embed.html  ← Chatter の代わりに Slack チャンネルを埋め込む
```

## 🎨 必須ヘッダ（コピペで使う）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{タイトル} | Salesforce</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/styles/salesforce-lightning-design-system.min.css">
<style>
  /* ============== ベース ============== */
  body {
    background: linear-gradient(to bottom, #b0c4df 0%, #f3f3f3 250px) #f3f3f3;
    min-width: 1024px;
    margin: 0;
  }
  .sf-main { max-width: 1440px; margin: 0 auto; padding: 1rem; }
  .sf-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .sf-col-2-3 { flex: 0 0 calc(66.666% - 0.375rem); }
  .sf-col-1-3 { flex: 0 0 calc(33.333% - 0.375rem); }

  /* ============== Global Header ============== */
  .sf-header {
    background: white; height: 3rem;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 1rem; border-bottom: 1px solid #c9c9c9;
    position: sticky; top: 0; z-index: 50;
  }
  .sf-header-search { width: 50%; max-width: 36rem; }
  .sf-header-actions { display: flex; align-items: center; gap: 0.5rem; }
  .sf-cloud-logo { width: 36px; height: auto; }

  /* ============== ヘッダー共通アイコンボタン ============== */
  /* SLDS の utility SVG は fill="#fff" のため filter で灰色化（重要） */
  .sf-icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem; border-radius: 0.25rem;
    cursor: pointer; background: transparent; border: none; padding: 0;
  }
  .sf-icon-btn:hover { background: #f3f3f3; }
  .sf-icon-btn img {
    width: 18px; height: 18px;
    filter: brightness(0) saturate(100%) invert(43%) sepia(13%) saturate(295%) hue-rotate(180deg) brightness(95%) contrast(85%);
  }
  /* 検索ボックス内の虫眼鏡アイコン（白なので灰色化） */
  .slds-input__icon {
    filter: brightness(0) saturate(100%) invert(43%) sepia(13%) saturate(295%) hue-rotate(180deg) brightness(95%) contrast(85%);
  }
  /* お気に入りボタン (青背景・白アイコン) */
  .sf-favorite-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 0 10px; height: 2rem;
    background: #1b96ff; border-radius: 0.25rem;
    border: none; cursor: pointer;
  }
  .sf-favorite-btn img {
    width: 14px; height: 14px;
    filter: brightness(0) invert(1) !important;
  }
  /* 通知の赤ドット */
  .sf-notify-wrap { position: relative; display: inline-flex; }
  .sf-notify-dot {
    position: absolute; top: 4px; right: 4px;
    width: 8px; height: 8px; background: #ea001e;
    border-radius: 50%; border: 1.5px solid white;
  }

  /* ============== App Navigation Bar ============== */
  .sf-context-bar {
    background: white; border-bottom: 1px solid #dddbda;
    padding: 0 1rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .sf-context-bar nav ul {
    display: flex; gap: 0.5rem; list-style: none; padding: 0; margin: 0;
  }
  .sf-context-bar nav ul li {
    display: flex; align-items: center;
    padding: 0 0.25rem; font-size: 0.875rem;
  }
  .sf-context-bar nav ul li.is-active { border-bottom: 3px solid #1589ee; }
  .sf-context-bar nav ul li.is-active a { color: #0070d2; font-weight: 700; }
  .sf-context-bar nav ul li a {
    color: #444; text-decoration: none; padding: 0.5rem 0;
  }
  .sf-app-launcher {
    display: inline-flex; align-items: center; justify-content: center;
    width: 2rem; height: 2rem; cursor: pointer;
  }
  .sf-app-launcher-grid {
    display: grid; grid-template-columns: repeat(3, 4px);
    grid-template-rows: repeat(3, 4px); gap: 3px;
  }
  .sf-app-launcher-grid span {
    width: 4px; height: 4px; background: #54698d; border-radius: 1px;
  }
  .sf-app-name {
    font-size: 1.125rem; font-weight: 700; color: #181818;
    padding: 0.5rem 0; margin-right: 0.75rem;
  }

  /* ============== タイムライン (slds-timeline は使わない) ============== */
  .sf-timeline { list-style: none; padding: 0; margin: 0; }
  .sf-timeline-item {
    display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.5rem 0;
  }
  .sf-timeline-icon {
    flex: 0 0 2rem; height: 2rem; border-radius: 0.25rem;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .sf-timeline-icon-call    { background: #056764; }
  .sf-timeline-icon-email   { background: #b0adab; }
  .sf-timeline-icon-task    { background: #04844b; }
  .sf-timeline-icon-event   { background: #cc6cdd; }
  .sf-timeline-icon img {
    width: 1.25rem; height: 1.25rem;
    filter: brightness(0) invert(1);
  }
  .sf-timeline-body { flex: 1; min-width: 0; line-height: 1.4; }
  .sf-timeline-body a {
    color: #0070d2; text-decoration: none; font-weight: 700;
  }
  .sf-timeline-body a:hover { text-decoration: underline; }
  .sf-timeline-body .meta {
    font-size: 0.8125rem; color: #444; margin-top: 0.25rem;
  }
  .sf-timeline-body .meta-overdue { color: #ba0517; }
</style>
</head>
<body class="slds-scope">
```

## 🧱 必須ヘッダーHTML（Global Header + App Nav）

```html
<!-- Global Header -->
<header class="sf-header">
  <!-- Salesforce 雲ロゴ (公式SVG) -->
  <img class="sf-cloud-logo" src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/images/logo.svg" alt="Salesforce" />

  <!-- 検索バー -->
  <div class="sf-header-search">
    <div class="slds-form-element">
      <div class="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
        <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/search.svg" alt="" class="slds-icon slds-input__icon slds-icon-text-default slds-icon_x-small" />
        <input type="search" placeholder="検索..." class="slds-input">
      </div>
    </div>
  </div>

  <!-- 右側アクション群 -->
  <div class="sf-header-actions">
    <button class="sf-icon-btn" title="チャター/Agentforce">
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/agent_astro.svg" alt="" />
    </button>
    <button class="sf-favorite-btn" title="お気に入り">
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/favorite.svg" alt="" />
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/down.svg" alt="" style="width:10px; height:10px;" />
    </button>
    <button class="sf-icon-btn" title="新規作成">
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/add.svg" alt="" />
    </button>
    <button class="sf-icon-btn" title="セットアップ">
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/setup_assistant_guide.svg" alt="" />
    </button>
    <button class="sf-icon-btn" title="ヘルプ">
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/help.svg" alt="" />
    </button>
    <button class="sf-icon-btn" title="設定">
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/setup.svg" alt="" />
    </button>
    <span class="sf-notify-wrap">
      <button class="sf-icon-btn" title="通知">
        <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/notification.svg" alt="" />
      </button>
      <span class="sf-notify-dot"></span>
    </span>
    <span class="slds-avatar slds-avatar_circle slds-avatar_small" style="margin-left:0.5rem;">
      <img src="https://ui-avatars.com/api/?name=User&background=1B96FF&color=fff" alt="User">
    </span>
  </div>
</header>

<!-- App Nav -->
<div class="sf-context-bar">
  <!-- App Launcher (9点グリッド) -->
  <div class="sf-app-launcher" title="アプリケーションランチャー">
    <div class="sf-app-launcher-grid">
      <span></span><span></span><span></span>
      <span></span><span></span><span></span>
      <span></span><span></span><span></span>
    </div>
  </div>
  <span class="sf-app-name">Sales</span>
  <nav>
    <ul>
      <li><a href="#">ホーム</a></li>
      <li class="is-active"><a href="#">取引先 ▾</a></li>
      <li><a href="#">取引先責任者 ▾</a></li>
      <li><a href="#">リード ▾</a></li>
      <li><a href="#">商談 ▾</a></li>
      <li><a href="#">ダッシュボード ▾</a></li>
      <li><a href="#">レポート ▾</a></li>
    </ul>
  </nav>
  <button class="sf-icon-btn" title="ナビ編集" style="margin-left:auto;">
    <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/edit.svg" alt="" />
  </button>
</div>
```

## 🎯 アイコンの正しい書き方

### オブジェクト系（standard）

色付き背景＋白アイコンで自動表示される:

```html
<span class="slds-icon_container slds-icon-standard-account">
  <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/standard/account.svg" alt="" class="slds-icon slds-icon_medium" />
</span>
```

### 装飾系（utility）→ filter でグレー化

```html
<button class="sf-icon-btn">
  <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/search.svg" alt="" />
</button>
```

### ファイル種別（doctype）

```html
<span class="slds-icon_container slds-icon-doctype-pdf">
  <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/doctype/pdf.svg" alt="" class="slds-icon slds-icon_small" />
</span>
```

### URL構造

`assets/icons/{sprite}/{name}.svg` (sprite = `standard` / `utility` / `doctype` / `action` / `custom`)。`-sprite/svg/symbols.svg#` の形式は使わない。

## 🎨 オブジェクトアイコン早見表

| オブジェクト | クラス | ファイル名 |
| --- | --- | --- |
| Account（取引先） | `slds-icon-standard-account` | `account.svg` |
| Contact（連絡先） | `slds-icon-standard-contact` | `contact.svg` |
| Lead（リード） | `slds-icon-standard-lead` | `lead.svg` |
| Opportunity（商談） | `slds-icon-standard-opportunity` | `opportunity.svg` |
| Case（ケース） | `slds-icon-standard-case` | `case.svg` |
| Task（ToDo） | `slds-icon-standard-task` | `task.svg` |
| Event（行動） | `slds-icon-standard-event` | `event.svg` |
| Document（ファイル） | `slds-icon-standard-document` | `document.svg` |
| Dashboard（ダッシュボード） | `slds-icon-standard-dashboard` | `dashboard.svg` |
| Log a Call（電話記録） | `slds-icon-standard-log-a-call` | `log_a_call.svg` |
| Email（メール） | `slds-icon-standard-email` | `email.svg` |

## 📊 タイムラインの正しい書き方（slds-timeline 禁止）

```html
<ul class="sf-timeline">
  <li class="sf-timeline-item">
    <span class="sf-timeline-icon sf-timeline-icon-call">
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/standard/log_a_call.svg" alt="" />
    </span>
    <div class="sf-timeline-body">
      <a href="#">フォローアップコール</a>
      <div class="meta">期日 6月13日 14:00 · 担当者名</div>
    </div>
  </li>
  <li class="sf-timeline-item">
    <span class="sf-timeline-icon sf-timeline-icon-email">
      <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/standard/email.svg" alt="" />
    </span>
    <div class="sf-timeline-body">
      <a href="#">提案書を送付</a>
      <div class="meta meta-overdue">期日 6月10日 (期限切れ)</div>
    </div>
  </li>
</ul>
```

`sf-timeline-icon-{call|email|task|event}` で色を切り替え。

## 🤖 Agentforce 関連

- アイコン: `utility/agent_astro.svg`
- ラベル: 「Agentforce インサイト」「推奨記事 (Agentforce)」「Agentforce が...」など
- **Einstein は古いブランドなので使わない**

### Agentforce 会話パネル（アニメーション付き）

ヘッダーの Agentforce ボタンを押したら右からスライドインして会話が順番にフェードインするデモ的な演出を入れる場合は、`components/agentforce-panel.html` を使う。本物の Salesforce 画面の Agentforce サイドパネルにそっくりの見た目で、以下を含む:

- ヘッダー（タイトル + 情報/更新/ピン留め/閉じる）
- 会話エリア（ボット↔ユーザーのメッセージが順次フェードイン）
- ボットのタイピングインジケーター（…ドットのアニメーション）
- おすすめ提案リスト
- 入力欄

組み込み手順:

1. `<head>` 内 `<style>` に `agentforce-panel.html` の `<style>` ブロックを追記
2. `<body>` 末尾近く（メイン `</main>` の後）に `<aside class="sf-af-panel">` ブロックを貼り付け
3. ヘッダーの Agentforce アイコンボタンに `onclick="toggleAgentforce()"` を追加
4. `</body>` 直前に同梱の `<script>` を貼り付け
5. 会話内容（ボット応答の長文）はモックアップ対象のレコードに合わせて `{案件名}` `{取引先名}` `{金額}` 等を実値に書き換え

ユーザーから「Agentforce ボタンを押したら会話パネルが出るようにして」「Agentforce との会話を見せたい」等のリクエストがあったらこのコンポーネントを使う。

## 💬 Slack チャンネル埋め込み（Chatter の代わり）

実プロダクトでは、商談ごとに Slack のレコードチャンネルが紐づき、Chatter ではなく **Slack そのものをレコードページのタブに埋め込んで見せる** UX が増えている。これを再現するためのスニペットが `components/slack-channel-embed.html`。

### いつ使うか

- 「Chatter ではなく Slack を表示したい」
- 「商談ページの中央に Slack のメッセージが流れている画面が欲しい」
- 「部門間連携タブに Slack チャンネルを埋め込みたい」
- 「Slack 内で Tableau Next や Agentforce ボットがダッシュボードを返している様子を入れたい」

### 含まれる要素

- Slack ロゴ（Super Tiny Icons CDN）+ 「Slack チャンネル」見出し + メンバー数バッジ
- ルートメッセージ（アバター + 表示名 + 時刻 + 本文 + フロートアクション）。各ルートの末尾に「○件の会話」 replies 行（最終返信時刻 + 参加者ミニアバター付き）
- `@Tableau Next Agentforce in Slack` のような **メンションタグ**（薄青背景 + 青テキスト）
- **添付カード**（Tableau Next ダッシュボードのプレビュー想定。青ボーダー左 + プレビュー帯）
- **インラインスレッド**（「○件の会話」クリックでメッセージ直下にインライン展開。Agentforce返信 + リッチエディタ風入力欄を含む）
- フッターバナー「○エージェント はこのチャンネルに含まれる」

### 組み込み手順（4 ステップ）

1. `<head>` 内 `<style>` に `slack-channel-embed.html` の **「① CSS」** ブロックを貼る
2. レコードページ中央 `<div class="slds-tabs_default">` の `<ul class="slds-tabs_default__nav">` に「会話」タブ（または用途に応じた別名）を追加し、`slds-is-active` を付け替える
3. `<div class="slds-tabs_default__content">` の中身を **「② HTML 本体」** の `<article class="slds-card sf-slack">...</article>` に置き換える（または別タブパネルとして併存）
4. `</body>` 直前に **「③ JavaScript」** ブロックを貼る（`sfSlackToggleThread`）— 「○件の会話」クリックで直下のインラインスレッドが開閉する

### 命名規則・他コンポーネントとの独立性

- すべて `sf-slack-*` プレフィックス。`<body class="slds-scope">` の下にそのまま貼っても SLDS と干渉しない
- `slack-mockup` skill の `.slack-scope` とは **独立**（依存しないし、貼り付けで競合もしない）
- アイコンは既存ルール通り個別 SVG `<img>`、Slack ロゴだけ Super Tiny Icons CDN を使用

### 書き換える固有値

メッセージ本文の `@メンション名`、表示名、時刻、添付カードのタイトル/メタを、モックアップ対象の商談・取引先に合わせて差し替える。社員アバターは `https://ui-avatars.com/api/?name=...&background=2eb67d&color=fff` で生成するか実画像 URL を使う。

## 📤 出力ルール（必須）

新規生成したHTMLは **必ず `output/` フォルダ配下** に、以下のファイル名規則で保存する:

```
output/YYYYMMDD_HHMM_<base-filename>.html
```

- `YYYYMMDD_HHMM` は **生成時点のローカル時刻**（`date +%Y%m%d_%H%M` で取得）。
- `<base-filename>` は内容を表す英小文字 kebab-case（例: `omron-account`, `opportunity-kanban`）。
- 例: `output/20260611_1830_omron-account.html`
- 既存モックアップを **修正** する場合は元のファイル名を維持して上書き。**新規生成のときだけ** プレフィックスを付ける。
- `output/` フォルダが無ければ `mkdir -p output` で作る。

## 🛠️ 作業手順（推奨）

1. **依頼を分析**: ページタイプを判断する。
2. **出力先を決める**: `date +%Y%m%d_%H%M` で日時を取り、`output/<日時>_<内容名>.html` をファイルパスに決める。
3. **テンプレートをコピー**: `templates/` 配下の該当 HTML を新ファイルにコピー。
4. **タイトル・固有値を差し替え**: 取引先名、項目名、所有者名などを依頼内容に合わせて編集。
5. **コンポーネントを足す**: 必要なら `components/` から該当スニペットをコピペ。
6. **アイコンを選ぶ**: オブジェクト種別に応じて上の表からファイル名・クラスを選ぶ。
7. **ローカルブラウザで確認**: `file://` で開く前提なので、外部依存は CDN のみで完結している。
8. **実装コスト評価をコンソール出力**（次のセクション参照）。**HTML 生成完了後に必ず実行する**。

## 💰 実装コスト評価の出力（必須・最終ステップ）

HTML を生成し終わった後、**必ずユーザー向けに「Salesforce / Agentforce で実装する場合のコスト評価」をコンソールに出力する**。
モックアップだけ渡しても、ステークホルダーは「これって本当に作れるの? いくら掛かるの?」が判断できないため。

### 評価ルール

生成したモックアップに含まれるすべての主要要素を分類し、3 段階で評価する:

- **✅ 低コスト** ... Salesforce 標準機能 / 設定（Setup）/ Lightning App Builder のドラッグ&ドロップで実現できるもの
- **⚠️ 中コスト** ... カスタムオブジェクト追加、Apex / Flow / カスタム LWC、SLDS の標準コンポーネントの組み合わせで実現できるもの
- **🔴 高コスト** ... フルカスタム LWC + Apex の本格開発、外部システム連携、ML / Agentforce のチューニング、独自 UX で標準を逸脱するもの

### 出力フォーマット（このまま使う）

```
================================================================
📋 Salesforce / Agentforce 実装コスト評価
================================================================

🎯 対象モックアップ: output/{ファイル名}

✅ 低コスト（標準機能で対応可能）
  - {要素名}: {理由}（例: 取引先レコードページ標準項目 - Lightning App Builder で配置可能）
  - ...

⚠️ 中コスト（設定・開発が必要）
  - {要素名}: {理由}（例: 業種別比率ドーナツチャート - レポート + ダッシュボード設定で対応、または Apex Chart 開発）
  - ...

🔴 高コスト（最も実装コストが高いポイント）
  - {要素名}: {理由}（例: Agentforce による Web 行動分析・メール開封率予測 - Data Cloud + Agentforce Topic / Action のチューニング、外部 MA ツール連携が必要）
  - ...

================================================================
💡 推奨アプローチ:
{プロジェクト全体としての推奨。たとえば「まず ✅ で MVP リリース → ⚠️ を Phase 2 で追加 → 🔴 は ROI 検証後に判断」など}
================================================================
```

### 評価例（参考）

オムロン取引先ページのような Record Page を作った場合:

| 要素 | 評価 | 理由 |
| --- | --- | --- |
| Global Header / App Nav / Utility Bar | ✅ | Salesforce 標準 UI。設定不要 |
| ハイライトパネル（取引先名・キー項目） | ✅ | コンパクトレイアウトの標準機能 |
| 詳細タブの項目（取引先名・電話・業種など） | ✅ | 標準項目。ページレイアウトで配置 |
| カスタム項目（年商・代表取締役・資本金など） | ⚠️ | カスタム項目追加が必要（数分〜数時間） |
| 商談・取引先責任者・ケース・ファイル関連リスト | ✅ | 標準オブジェクト関連リスト |
| 活動タイムライン（電話・メール） | ✅ | 標準のActivity機能 |
| Agentforce インサイト（Web訪問+45%, メール開封率予測） | 🔴 | Data Cloud / MA連携 / Agentforceチューニング必須 |
| ファイル(PDF/Excel/PPT) | ✅ | Files標準機能 |
| カンバンボード | ⚠️ | 標準カンバンビューあり（簡単設定）。複雑なルール追加は LWC |
| 3ペイン Service Console | ⚠️ | Service Console アプリ設定 + ユーティリティバー設定 |
| グラフ（円グラフ・棒グラフ） | ⚠️ | レポート + ダッシュボード設定。複雑なものは Apex Chart / Tableau |
| 独自の業務フロー Path | ⚠️ | Path Settings で設定可能。ガイダンス自動生成は Flow + Prompt Template |
| カスタム独自 UI（提案書差分比較・3D 可視化等） | 🔴 | フル LWC 開発 |
| Agentforce 会話パネル（UI 表示・スライドイン） | ✅ | Agentforce 標準機能（ユーティリティバー / サイドパネル）で表示できる。設定のみで対応可能 |
| Agentforce「このレコードの詳細を教えて」要約応答 | ⚠️ | レコード参照 Action と Prompt Template の設定が必要（Builder で構成可能。深いカスタマイズは追加開発） |
| Agentforce「次のアクション提案」 / 業務特化応答 | ⚠️〜🔴 | Topic / Action / Prompt Template の設計とチューニング、社内データの取り込み（Data Cloud 連携が絡むと 🔴）|
| Salesforce ⇄ Slack 連携（レコードチャンネル / Sales Cloud + Slack） | ⚠️ | Slack 連携アプリの設定で実現可能（標準機能）。ただし **Slack 有料ライセンス + Sales Cloud + Slack アドオン** が必要 |
| Slack 内 Tableau Next / Agentforce ボット応答（@メンション → ダッシュボードカード返信） | 🔴 | Slack App + Agentforce Topic / Tableau Next の連携設計、Slack へのリッチカード送信、Data Cloud 連携が絡むため最も重い |

### 重要な観点

- **Agentforce のサイドパネル UI / 会話表示自体は ✅**（標準機能）。コストの本体は「何を答えさせるか」(Topic / Action / Prompt Template) と「どこのデータを見せるか」
- **Agentforce の標準的なレコード要約・アクション提案は ⚠️**（Builder 設定 + Prompt Template）
- **業務特化の予測・推薦・外部データ前提の応答は 🔴**（Data Cloud 構築・モデル学習・社内データ連携）
- **外部システム連携**（基幹・MA・BI）は必ず 🔴 として明示
- **複雑な権限分岐・承認プロセス・複数取引先共有** は ⚠️〜🔴
- **画面の見た目だけ似せる** のは ✅ だが、**裏のデータパイプライン** が 🔴 になりがち。両方を分けて評価する

## ✏️ 修正時のチェック項目

- [ ] Tailwind が混入していないか (`cdn.tailwindcss.com` 検索)
- [ ] アイコンが `<svg><use>` ではなく `<img>` で書かれているか
- [ ] utility アイコンに `filter` が当たっているか（白アイコン透明化対策）
- [ ] `slds-timeline` ではなく `sf-timeline*` を使っているか
- [ ] タイトル系に `slds-truncate` を付けていないか
- [ ] Einstein → Agentforce に統一されているか
- [ ] `<body class="slds-scope">` か
- [ ] 出力先が `output/YYYYMMDD_HHMM_*.html` か
- [ ] **HTML 生成後に「実装コスト評価」をコンソール出力したか**（💰 セクション参照）
