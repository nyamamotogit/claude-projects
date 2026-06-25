# Agentforce / Slack 埋め込み

## Agentforce 関連

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

## Slack チャンネル埋め込み（Chatter の代わり）

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
