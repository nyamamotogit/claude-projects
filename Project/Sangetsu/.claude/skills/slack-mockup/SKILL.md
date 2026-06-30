---
name: slack-mockup
description: Slack風の画面モックアップを単一HTMLとして作成・修正する。公式ブランドカラー(Aubergine #4A154B)＋Lato＋Lucide IconsをCDNで読み込み、サイドバー(ワークスペース/チャンネル/DM)・メッセージタイムライン・スレッドパネル・Huddle通話画面・Canvasドキュメントといった主要ページタイプを完備。Slackチャンネル・DM・スレッド・Huddle・Canvas・ワークフローの画面モックを作成・編集するときに使用する。
---

# Slack UI Mockup Skill

Slack風の画面モックアップを **単一のHTMLファイル** として組み立てるためのテンプレート集。Slackは公式CSSを公開していないため、**公式ブランドカラー（Aubergine + アクセント4色）と Lato フォント、Lucide Icons CDN** を組み合わせて見た目を再現する。

## ⚠️ 最重要ルール（これを守らないと画面が崩れる）

| やる/やらない | 内容 | 理由 |
| --- | --- | --- |
| ❌ 使わない | **Tailwind CSS** | このプロジェクト全体の方針。Preflight が SLDS と干渉するため禁止 |
| ❌ 使わない | **`<svg><use xlink:href="...">` のスプライト参照** | `file://` で開いた時に CORS で透明化する |
| ❌ 使わない | **古いSlackカラー（緑#3F0E40）や Brewery 紫** | 2019年以降の公式色は Aubergine `#4A154B` |
| ❌ 使わない | **イニシャル + 色付き四角だけのアバター** | 説得力に欠ける。**人物は randomuser.me の顔写真**、ボットは Agentforce アイコンを使う。色付き四角は絵文字アバター等のフォールバック扱い |
| ✅ 必ずやる | アイコンは **Lucide CDN** (`<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js">`) で読み込み、`<i data-lucide="hash"></i>` を使う | スプライトより確実、SLDSアイコンと違って Slack 風 |
| ✅ 必ずやる | フォントは **Lato (Google Fonts)** | Slack の本物に最も近い |
| ✅ 必ずやる | サイドバー背景は `--slack-aubergine: #4A154B` 変数経由で | 全テンプレートで統一 |
| ✅ 必ずやる | ページ末尾で `lucide.createIcons();` を呼ぶ | これを忘れるとアイコンが描画されない |
| ✅ 必ずやる | `<body>` に `class="slack-scope"` を付け、CSS は `.slack-scope` 配下に書く | 他のモックと同居しても干渉しない |

## 🚦 使い方の決め手（最初にこれを見る）

| ユーザーの言葉 | 使うテンプレート |
| --- | --- |
| 「Slackチャンネル」「#general」「メッセージ画面」 | `templates/channel.html` |
| 「DM」「スレッド」「リプライ」 | `templates/dm-thread.html` |
| 「Huddle」「通話」「画面共有」「ハドル」 | `templates/huddle.html` |
| 「Canvas」「ドキュメント」「議事録ページ」 | `templates/canvas.html` |

## 📁 ディレクトリ構成

```
.claude/skills/slack-mockup/
├── SKILL.md                  ← このファイル
├── style-tokens.html         ← 色・フォント・主要パーツ早見表
└── templates/                ← ページタイプ別フルHTML
    ├── channel.html
    ├── dm-thread.html
    ├── huddle.html
    └── canvas.html
```

## 🎨 必須ヘッダ（コピペで使う）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{タイトル} | Slack</title>

<!-- Lato フォント -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">

<style>
  /* ============== トークン ============== */
  :root {
    /* Slack ブランドカラー（公式） */
    --slack-aubergine: #4A154B;
    --slack-aubergine-dark: #350D36;       /* hover/active */
    --slack-aubergine-darker: #1A0E1A;     /* workspace switcher */
    --slack-aubergine-text: #FFFFFF;
    --slack-aubergine-text-dim: rgba(255,255,255,0.7);

    /* アクセント4色 */
    --slack-yellow: #ECB22E;
    --slack-blue:   #36C5F0;
    --slack-green:  #2EB67D;
    --slack-red:    #E01E5A;

    /* メッセージエリア */
    --slack-bg:        #FFFFFF;
    --slack-bg-hover:  #F8F8F8;
    --slack-text:      #1D1C1D;
    --slack-text-dim:  #616061;
    --slack-border:    #E1E1E1;
    --slack-link:      #1264A3;

    /* 通知 */
    --slack-unread-dot: #1264A3;
    --slack-mention-bg: #E01E5A;

    /* レイアウト */
    --slack-sidebar-w: 260px;
    --slack-thread-w:  380px;
    --slack-header-h:  44px;
  }

  /* ============== ベース ============== */
  body.slack-scope {
    margin: 0;
    font-family: "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    font-size: 15px;
    line-height: 1.46;
    color: var(--slack-text);
    background: var(--slack-bg);
  }
  .slack-scope * { box-sizing: border-box; }
  .slack-scope a { color: var(--slack-link); text-decoration: none; }
  .slack-scope a:hover { text-decoration: underline; }
  .slack-scope button { font-family: inherit; }

  /* ============== アプリ全体グリッド ============== */
  .slack-app {
    display: grid;
    grid-template-columns: var(--slack-sidebar-w) 1fr;
    grid-template-rows: var(--slack-header-h) 1fr;
    height: 100vh;
  }
  .slack-app.with-thread {
    grid-template-columns: var(--slack-sidebar-w) 1fr var(--slack-thread-w);
  }

  /* ============== Workspace Header (紫帯) ============== */
  .slack-topbar {
    grid-column: 1 / -1;
    background: var(--slack-aubergine-dark);
    color: var(--slack-aubergine-text);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 12px;
    height: var(--slack-header-h);
    -webkit-app-region: drag;
  }
  .slack-topbar-left, .slack-topbar-right {
    display: flex; align-items: center; gap: 8px;
    flex: 1; -webkit-app-region: no-drag;
  }
  .slack-topbar-right { justify-content: flex-end; }
  .slack-topbar-search {
    flex: 0 1 720px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 6px;
    height: 28px;
    display: flex; align-items: center; gap: 6px;
    padding: 0 10px;
    color: var(--slack-aubergine-text-dim);
    font-size: 13px;
  }
  .slack-topbar-search:hover {
    background: rgba(255,255,255,0.18);
    cursor: text;
  }
  .slack-topbar-icon-btn {
    background: transparent; border: none; color: var(--slack-aubergine-text);
    width: 28px; height: 28px; border-radius: 4px; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .slack-topbar-icon-btn:hover { background: rgba(255,255,255,0.15); }
  .slack-topbar-icon-btn i[data-lucide] { width: 16px; height: 16px; }

  /* ============== Sidebar (チャンネル一覧) ============== */
  .slack-sidebar {
    background: var(--slack-aubergine);
    color: var(--slack-aubergine-text);
    overflow-y: auto;
    padding: 8px 0;
  }
  .slack-sidebar-workspace {
    padding: 8px 16px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 8px;
  }
  .slack-sidebar-workspace .name {
    font-weight: 900; font-size: 18px; letter-spacing: -0.2px;
  }
  .slack-sidebar-section {
    margin-top: 12px;
  }
  .slack-sidebar-section-header {
    padding: 4px 16px;
    color: var(--slack-aubergine-text-dim);
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; gap: 6px;
    cursor: pointer;
  }
  .slack-sidebar-section-header:hover { color: white; }
  .slack-sidebar-section-header i[data-lucide] { width: 12px; height: 12px; }
  .slack-sidebar-item {
    padding: 4px 16px 4px 22px;
    display: flex; align-items: center; gap: 8px;
    color: var(--slack-aubergine-text-dim);
    font-size: 15px; cursor: pointer;
    text-decoration: none;
  }
  .slack-sidebar-item:hover {
    background: var(--slack-aubergine-dark);
    color: white;
    text-decoration: none;
  }
  .slack-sidebar-item.is-active {
    background: #1164A3;
    color: white;
    font-weight: 700;
  }
  .slack-sidebar-item.is-unread { color: white; font-weight: 700; }
  .slack-sidebar-item i[data-lucide] { width: 14px; height: 14px; flex-shrink: 0; }
  .slack-sidebar-item .badge {
    margin-left: auto;
    background: var(--slack-mention-bg);
    color: white; font-weight: 700;
    font-size: 11px; min-width: 18px; height: 18px;
    border-radius: 9px; padding: 0 6px;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .slack-sidebar-item .presence {
    width: 8px; height: 8px; border-radius: 50%;
    background: transparent; border: 1.5px solid var(--slack-aubergine-text-dim);
  }
  .slack-sidebar-item .presence.online { background: var(--slack-green); border-color: var(--slack-green); }

  /* ============== Channel Header ============== */
  .slack-channel-header {
    border-bottom: 1px solid var(--slack-border);
    padding: 10px 20px;
    display: flex; align-items: center; justify-content: space-between;
    background: white;
  }
  .slack-channel-header-title {
    display: flex; align-items: center; gap: 8px;
    font-weight: 900; font-size: 18px;
  }
  .slack-channel-header-title i[data-lucide] { width: 18px; height: 18px; color: var(--slack-text); }
  .slack-channel-header-meta {
    font-size: 13px; color: var(--slack-text-dim);
    margin-top: 2px;
  }
  .slack-channel-header-actions {
    display: flex; gap: 4px; align-items: center;
  }
  .slack-channel-header-actions button {
    background: transparent; border: 1px solid transparent;
    padding: 4px 8px; border-radius: 4px; cursor: pointer;
    color: var(--slack-text); font-size: 13px;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .slack-channel-header-actions button:hover { background: #F0F0F0; }
  .slack-channel-header-actions button i[data-lucide] { width: 14px; height: 14px; }

  /* ============== Messages ============== */
  .slack-messages {
    overflow-y: auto;
    padding: 12px 0;
  }
  .slack-day-divider {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 20px; position: sticky; top: 0;
    background: linear-gradient(to bottom, white 60%, transparent);
  }
  .slack-day-divider .line { flex: 1; height: 1px; background: var(--slack-border); }
  .slack-day-divider .label {
    font-weight: 700; font-size: 13px; color: var(--slack-text);
    border: 1px solid var(--slack-border); border-radius: 16px;
    padding: 4px 14px; background: white;
  }
  .slack-message {
    display: flex; gap: 10px;
    padding: 6px 20px;
    position: relative;
  }
  .slack-message:hover { background: var(--slack-bg-hover); }
  .slack-message-avatar {
    width: 36px; height: 36px; border-radius: 4px;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 14px;
    overflow: hidden;
  }
  .slack-message-body { flex: 1; min-width: 0; }
  .slack-message-head {
    display: flex; align-items: baseline; gap: 8px;
  }
  .slack-message-head .name {
    font-weight: 900; color: var(--slack-text);
  }
  .slack-message-head .time {
    font-size: 12px; color: var(--slack-text-dim);
  }
  .slack-message-text {
    color: var(--slack-text); word-break: break-word;
  }
  .slack-mention {
    background: #FDEAF1;
    color: var(--slack-link);
    padding: 0 2px; border-radius: 3px;
    font-weight: 700;
  }
  .slack-channel-link {
    color: var(--slack-link); font-weight: 700;
  }
  .slack-codeblock {
    background: #F8F8F8;
    border: 1px solid var(--slack-border);
    border-radius: 4px;
    padding: 8px 10px;
    font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
    font-size: 13px;
    margin: 4px 0;
    white-space: pre-wrap;
  }
  .slack-quote {
    border-left: 4px solid #DDDDDD;
    padding: 2px 0 2px 10px;
    margin: 4px 0;
    color: var(--slack-text-dim);
  }

  /* リアクション */
  .slack-reactions {
    display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;
  }
  .slack-reaction {
    background: #EFF4F8;
    border: 1px solid #B8C7D6;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 13px;
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .slack-reaction:hover { border-color: var(--slack-link); }
  .slack-reaction.is-mine {
    background: #E8F4FA;
    border-color: var(--slack-link);
    color: var(--slack-link);
    font-weight: 700;
  }
  .slack-reaction-add {
    background: transparent; color: var(--slack-text-dim);
    padding: 2px 6px;
  }

  /* スレッド返信リンク */
  .slack-thread-replies {
    margin-top: 4px;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 8px; border: 1px solid transparent; border-radius: 6px;
    cursor: pointer; font-size: 13px;
  }
  .slack-thread-replies:hover {
    background: white; border-color: var(--slack-border);
    box-shadow: 0 1px 0 rgba(0,0,0,0.05);
  }
  .slack-thread-replies .avatars { display: flex; gap: -4px; }
  .slack-thread-replies .avatars > * {
    width: 20px; height: 20px; border-radius: 3px;
    margin-right: -4px; border: 1.5px solid white;
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 10px;
  }
  .slack-thread-replies .count {
    color: var(--slack-link); font-weight: 700;
  }
  .slack-thread-replies .last { color: var(--slack-text-dim); }

  /* ピン留め・お知らせ */
  .slack-pin-banner {
    background: #FFFCEB;
    border-bottom: 1px solid #F0E6B8;
    padding: 6px 20px;
    font-size: 13px;
    display: flex; align-items: center; gap: 6px;
    color: var(--slack-text);
  }
  .slack-pin-banner i[data-lucide] { width: 14px; height: 14px; }

  /* ============== Composer (入力欄) ============== */
  .slack-composer {
    padding: 0 20px 20px;
  }
  .slack-composer-box {
    border: 1px solid #B8B8B8;
    border-radius: 8px;
    background: white;
    box-shadow: 0 0 0 1px transparent;
  }
  .slack-composer-box:focus-within {
    border-color: #1264A3;
    box-shadow: 0 0 0 1px #1264A3;
  }
  .slack-composer-toolbar {
    display: flex; align-items: center; gap: 2px;
    padding: 4px 8px;
    border-bottom: 1px solid var(--slack-border);
    color: var(--slack-text-dim);
  }
  .slack-composer-toolbar button {
    background: transparent; border: none; padding: 4px 6px;
    border-radius: 4px; cursor: pointer; color: var(--slack-text-dim);
    display: inline-flex; align-items: center;
  }
  .slack-composer-toolbar button:hover { background: #F0F0F0; color: var(--slack-text); }
  .slack-composer-toolbar button i[data-lucide] { width: 14px; height: 14px; }
  .slack-composer-toolbar .sep { width: 1px; height: 14px; background: var(--slack-border); margin: 0 4px; }
  .slack-composer-input {
    padding: 10px 12px;
    min-height: 44px;
    color: var(--slack-text-dim);
    font-size: 15px;
  }
  .slack-composer-actions {
    display: flex; align-items: center; gap: 4px;
    padding: 4px 6px 6px;
    border-top: 1px solid transparent;
  }
  .slack-composer-actions .left { display: flex; gap: 2px; flex: 1; }
  .slack-composer-actions button {
    background: transparent; border: none; padding: 6px;
    border-radius: 4px; cursor: pointer; color: var(--slack-text-dim);
    display: inline-flex; align-items: center;
  }
  .slack-composer-actions button:hover { background: #F0F0F0; color: var(--slack-text); }
  .slack-composer-actions button i[data-lucide] { width: 16px; height: 16px; }
  .slack-composer-send {
    background: var(--slack-green) !important;
    color: white !important;
    border-radius: 4px !important;
  }
  .slack-composer-send:hover { background: #258F60 !important; }

  /* ============== Avatar カラーバリアント ============== */
  .slack-avatar-blue   { background: #1264A3; }
  .slack-avatar-green  { background: #2EB67D; }
  .slack-avatar-yellow { background: #ECB22E; color: #1D1C1D !important; }
  .slack-avatar-red    { background: #E01E5A; }
  .slack-avatar-purple { background: #7C3085; }
  .slack-avatar-teal   { background: #0F8E91; }
</style>
</head>
<body class="slack-scope">
```

## 🧱 Workspace Header HTML（コピペ用）

```html
<header class="slack-topbar">
  <div class="slack-topbar-left">
    <button class="slack-topbar-icon-btn" title="戻る"><i data-lucide="chevron-left"></i></button>
    <button class="slack-topbar-icon-btn" title="進む"><i data-lucide="chevron-right"></i></button>
    <button class="slack-topbar-icon-btn" title="履歴"><i data-lucide="clock"></i></button>
  </div>
  <div class="slack-topbar-search">
    <i data-lucide="search" style="width:14px;height:14px;"></i>
    <span>Acme Corp を検索</span>
  </div>
  <div class="slack-topbar-right">
    <button class="slack-topbar-icon-btn" title="ヘルプ"><i data-lucide="help-circle"></i></button>
    <button class="slack-topbar-icon-btn" title="アカウント">
      <span class="slack-message-avatar slack-avatar-blue" style="width:24px;height:24px;font-size:11px;">YK</span>
    </button>
  </div>
</header>
```

## 🎯 Lucide アイコン早見表

| 用途 | アイコン名 |
| --- | --- |
| パブリックチャンネル | `hash` |
| プライベートチャンネル | `lock` |
| DM (個人) | `at-sign` |
| グループDM | `users` |
| 検索 | `search` |
| 通知 | `bell` |
| ヘルプ | `help-circle` |
| メンション一覧 | `at-sign` |
| スレッド | `message-square` |
| ブックマーク | `bookmark` |
| ピン留め | `pin` |
| 添付 | `paperclip` |
| 絵文字 | `smile` |
| @メンション | `at-sign` |
| 送信 | `send` |
| 書式設定 (太字) | `bold` |
| Huddle 開始 | `headphones` |
| ビデオ通話 | `video` |
| 画面共有 | `monitor-up` |
| マイクオン | `mic` |
| マイクオフ | `mic-off` |
| カメラオフ | `video-off` |
| 退出 | `phone-off` |
| 設定 | `settings` |
| もっと見る | `more-horizontal` |
| アプリ | `grid-3x3` |
| ファイル | `file-text` |
| Canvas | `file-pen-line` |
| ToDo | `square-check` |
| 矢印（折りたたみ） | `chevron-down` / `chevron-right` |

## 📝 メッセージの正しい書き方

```html
<div class="slack-message">
  <div class="slack-message-avatar"><img src="https://randomuser.me/api/portraits/men/67.jpg" alt="" /></div>
  <div class="slack-message-body">
    <div class="slack-message-head">
      <span class="name">山本 健介</span>
      <span class="time">14:30</span>
    </div>
    <div class="slack-message-text">
      <span class="slack-mention">@鈴木</span> リリース判定MTGの議事録、
      <span class="slack-channel-link">#release-notes</span> に貼っておきました
    </div>
    <!-- リアクション -->
    <div class="slack-reactions">
      <button class="slack-reaction is-mine">👀 <span>3</span></button>
      <button class="slack-reaction">✅ <span>2</span></button>
      <button class="slack-reaction slack-reaction-add"><i data-lucide="smile" style="width:14px;height:14px;"></i></button>
    </div>
    <!-- スレッド返信 (クリックで直下にインライン展開) -->
    <a class="slack-thread-replies" onclick="slkToggleThread(this)">
      <div class="avatars">
        <span class="slack-message-avatar" style="width:20px;height:20px;"><img src="https://randomuser.me/api/portraits/women/5.jpg" alt="" /></span>
        <span class="slack-message-avatar" style="width:20px;height:20px;"><img src="https://randomuser.me/api/portraits/men/90.jpg" alt="" /></span>
      </div>
      <span class="count">5件の返信</span>
      <span class="last">最終返信 30分前</span>
    </a>
  </div>
</div>

<!-- 直下のインラインスレッド -->
<div class="slack-thread-inline">
  <div class="slack-thread-divider"><span>5 件の返信</span></div>
  <div class="slack-message" style="padding-left:0; padding-right:0;">
    <div class="slack-message-avatar"><img src="https://randomuser.me/api/portraits/women/5.jpg" alt="" /></div>
    <div class="slack-message-body">...</div>
  </div>
  <!-- ... さらに返信 ... -->
  <div class="slack-thread-mini-composer">
    <span>スレッドに返信...</span>
    <button class="send-btn"><i data-lucide="send"></i></button>
  </div>
</div>
```

### ボットの場合 (Slackbot / Agentforce)

```html
<div class="slack-message-avatar is-bot">
  <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/agent_astro.svg" alt="" />
</div>
```

## 👥 人物 → アバター URL マッピング（既定）

skill 全体で登場人物のアバター URL を統一する:

| 名前 / イニシャル | URL（`size` パラメータは不要、`men/{id}.jpg` 形式） |
| --- | --- |
| 山本 健介 (YK) | `https://randomuser.me/api/portraits/men/67.jpg` |
| 田中 拓也 (TT) | `https://randomuser.me/api/portraits/men/90.jpg` |
| 青山 昇 (AS) | `https://randomuser.me/api/portraits/men/4.jpg` |
| 鈴木 さくら (SK) | `https://randomuser.me/api/portraits/women/5.jpg` |
| 中村 玲奈 (MN) | `https://randomuser.me/api/portraits/women/12.jpg` |
| Slackbot / 自動投稿 | `<img>` 内に `utility/agent_astro.svg`、コンテナに `is-bot` クラス |
| Salesforce アプリ | 既存の `#00A1E0` 背景 + `cloud` Lucide アイコン |

新規キャラクターを足す場合は `randomuser.me/api/portraits/men/{id}.jpg` の id を 1〜99 で試し、アジア系の顔のみを採用する（参考: `men/4`, `men/40`, `men/67`, `men/90`, `women/5`, `women/12` がアジア系で確認済み）。

## 💬 インラインスレッド展開

「○件の返信」（`.slack-thread-replies`）をクリックすると、直下の `.slack-thread-inline` を開閉する。HTML 側は `<a class="slack-thread-replies" onclick="slkToggleThread(this)">` を付け、メッセージの直後に `<div class="slack-thread-inline">...</div>` を置く。CSS は templates 側に定義済み（`.slack-thread-inline` は `display:none` ↔ `is-open` で `display:block`）。

dm-thread.html では右ペインのスレッドパネルが既存なので、インライン展開と併用しなくてよい。

## ✅ ページ末尾の必須コード

`</body>` の直前に **必ず** 以下を入れる:

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<script>
  lucide.createIcons();
  function slkToggleThread(el) {
    const msg = el.closest('.slack-message');
    if (!msg) return;
    const inline = msg.nextElementSibling;
    if (inline && inline.classList.contains('slack-thread-inline')) {
      inline.classList.toggle('is-open');
    }
  }
</script>
```

`lucide.createIcons()` を忘れるとアイコンが全部空になる。`slkToggleThread` を忘れると「○件の返信」をクリックしても何も展開されない。

## 📤 出力ルール（必須）

新規生成したHTMLは **必ず `output/` フォルダ配下** に、以下のファイル名規則で保存する:

```
output/YYYYMMDD_HHMM_<base-filename>.html
```

- `YYYYMMDD_HHMM` は **生成時点のローカル時刻**（`date +%Y%m%d_%H%M` で取得）
- `<base-filename>` は内容を表す英小文字 kebab-case（例: `slack-sales-channel`, `slack-dm-suzuki`）
- 例: `output/20260611_2310_slack-sales-channel.html`
- 既存モックアップを **修正** する場合は元のファイル名を維持して上書き
- `output/` フォルダが無ければ `mkdir -p output` で作る

## 🛠️ 作業手順（推奨）

1. **依頼を分析**: ページタイプを判断する（チャンネル / DM+スレッド / Huddle / Canvas）
2. **出力先を決める**: `date +%Y%m%d_%H%M` を取得し、ファイルパスを決める
3. **テンプレートをコピー**: `templates/` 配下の該当 HTML を新ファイルにコピー
4. **固有値を差し替え**: ワークスペース名・チャンネル名・ユーザー名・メッセージ本文を依頼に合わせて編集
5. **アイコン・色を選ぶ**: 上の早見表からアイコン名と Avatar カラー（`slack-avatar-blue` 等）を選ぶ
6. **`lucide.createIcons()` 呼び出しが残っているかチェック**
7. **ブラウザ確認**: `file://` で開ける構成（CDNのみ依存）
8. **実装コスト評価をコンソール出力**（次のセクション・必須）

## 💰 実装コスト評価の出力（必須・最終ステップ）

HTML 生成後、**必ずユーザー向けに「Slack で実装する場合のコスト評価」をコンソールに出力する**。

### 評価軸

- **✅ 低コスト** ... Slack 標準機能 / 設定だけで実現できる（チャンネル作成、ピン留め、Canvas作成、Huddle、絵文字リアクション等）
- **⚠️ 中コスト** ... Block Kit でメッセージレイアウトを組む / Workflow Builder でフォーム化 / Incoming Webhook + Block Kit / Slack App の単機能版
- **🔴 高コスト** ... フル Slack App（OAuth + Events API + Modal + Home Tab）、外部システム双方向連携、AI/Agent統合、Enterprise Grid 横断機能、独自 UX

### 出力フォーマット

```
================================================================
📋 Slack 実装コスト評価
================================================================

🎯 対象モックアップ: output/{ファイル名}

✅ 低コスト（標準機能で対応可能）
  - {要素名}: {理由}（例: チャンネル + ピン留め + リアクション → 標準UIで設定なし）
  - ...

⚠️ 中コスト（Block Kit / Workflow Builder で対応）
  - {要素名}: {理由}（例: 承認ボタン付きカード → Block Kit Actions block + Webhook）
  - ...

🔴 高コスト（Slack App 開発・外部連携）
  - {要素名}: {理由}（例: 社内システムからリアルタイム通知＋双方向応答 → Events API + 外部バックエンド + OAuth）
  - ...

================================================================
💡 推奨アプローチ:
{プロジェクト全体としての推奨。例: 「まず ✅ で運用開始 → 定型業務は Workflow Builder で自動化 → 双方向連携はROI次第」など}
================================================================
```

### 評価例（参考）

| 要素 | 評価 | 理由 |
| --- | --- | --- |
| 紫サイドバー / チャンネル一覧 / DMセクション | ✅ | 標準UI |
| `#general` メッセージ + リアクション + スレッド返信 | ✅ | すべて標準機能 |
| ピン留めバナー | ✅ | 標準のピン留め機能 |
| @メンションのハイライト | ✅ | 標準 |
| Canvas（ToDo・コードブロック・H1見出し付き） | ✅ | 標準のCanvas機能 |
| Huddle（音声・画面共有） | ✅ | 標準のHuddle機能 |
| 「承認/却下」ボタン付きメッセージ | ⚠️ | Block Kit `actions` block + Webhook or Slack App |
| 営業案件サマリーを毎朝自動投稿 | ⚠️ | Workflow Builder スケジュール + Webhook or Slack App |
| 社内システムから案件更新を自動メンション | ⚠️〜🔴 | Incoming Webhook なら⚠️、双方向（応答→システム反映）なら🔴 |
| AI が会話要約を自動生成 | ⚠️ | Slack AI（Enterprise+ 上位プラン）または独自 Slack App + LLM |
| カスタム Home Tab で社内ダッシュボード | 🔴 | Slack App の Home Tab + Block Kit + 外部API |
| Salesforce レコードと双方向同期 | 🔴 | Slack-Salesforce 連携 or 自前 OAuth + Events API |

### 重要な観点

- **見た目の再現はほぼ ✅**（標準UIで実現可能）
- **コストの本体は「ボタンを押した後」「メッセージの送信元」**
- **Webhook 単方向は ⚠️**、**Events API 双方向は 🔴**
- **Slack AI 系（要約・検索）は Enterprise+ プランの追加コスト**

## ✏️ 修正時のチェック項目

- [ ] Tailwind が混入していないか
- [ ] アイコンが `<i data-lucide="...">` で書かれているか（`<svg><use>` ではなく）
- [ ] `</body>` 直前で `lucide.createIcons()` が呼ばれているか
- [ ] サイドバー紫が `--slack-aubergine` 変数経由か
- [ ] フォントに Lato が指定されているか
- [ ] `<body class="slack-scope">` か
- [ ] 出力先が `output/YYYYMMDD_HHMM_*.html` か
- [ ] **HTML 生成後に「実装コスト評価」をコンソール出力したか**

## 📚 参考リンク

- Slack Brand Center: https://brand.slackhq.com/ （※工事中、確定情報のみ採用）
- Block Kit Docs: https://docs.slack.dev/block-kit/
- Block Kit Builder: https://app.slack.com/block-kit-builder/
- Sirneij/slack-clone-ui (HTML/CSS): https://github.com/Sirneij/slack-clone-ui
- dev.to "Building Slack UI": https://dev.to/sirneij/building-slack-ui-with-pure-html5-css3-and-javascript-the-power-of-css-grids-and-flexbox-4ban
- Lucide Icons: https://lucide.dev/
