---
name: salesforce-lightning-mockup
description: Salesforce Lightning Experience風の画面モックアップを単一HTMLとして作成・修正する。SLDS公式CSS (slds-* クラス + 個別SVGアイコン) ベース。Recordページ、リストビュー、Home、ダッシュボード、Service Console、カンバン等のページタイプと、Buttons / Modals / Toasts / Path / Data Table / Tabs / Tiles / Forms / Page Header 等のSLDSコンポーネントを完備。Salesforce画面・SLDSコンポーネント・取引先/商談/リード/ケース等のレコードページを作成・編集するときに使用する。
---

# Salesforce Lightning UI Mockup Skill

Salesforce Lightning Experience風の画面モックアップを **単一のHTMLファイル** として組み立てるためのテンプレート集。**SLDS1 公式CSSをベース** (`@salesforce-ux/design-system@2.30.4`) として、Global Header・Global Navigation・Page Header・Tabs・Tile・Progress Bar・Utility Bar 等を SLDS 公式コンポーネント (`slds-*`) で組み上げる。Service Console の 3 ペインや Kanban カラム外枠など SLDS に対応物が無い箇所のみ、最小限の自前クラス (`sf-*`) で補完する。

> **このファイルはインデックス**。詳細リファレンスは `docs/` 配下に分割しています。本 SKILL.md は毎回ロードされる固定コストなので、**詳細セクションを必要なときだけ Read** することで生成スピードを上げる構造になっています。

## ⚠️ 最重要ルール (これを守らないと画面が崩れる)

過去のトライ＆エラーで判明した「絶対やらない」「必ずやる」リスト。**新規生成時は必ずこれをチェック**。

| やる/やらない | 内容 | 理由 |
| --- | --- | --- |
| ❌ 使わない | **Tailwind CSS (`<script src="...cdn.tailwindcss.com">`)** | Tailwind の Preflight が SLDS の `<ul>`/`<button>`/`<table>` 等を全部潰して画面が崩れる。`preflight: false` 設定でも干渉が残る |
| ❌ 使わない | **`<svg><use xlink:href="...symbols.svg#xxx"/></svg>` のスプライト参照** | `file://` で開いた時にCORSで弾かれてアイコンが透明になる |
| ❌ 使わない | **`slds-truncate` をタイトル系に使う** | 切り詰められて「中村役員 四半期…」のように欠ける。**Activity Timeline のタイトル `<h3>` にも付けない** (公式 example は付けているがモックでは省略されてしまうので外す) |
| ❌ 使わない | **`Einstein`** | 古いブランド。**Agentforce** に統一する。アイコンは `utility/agent_astro.svg` |
| ❌ 使わない | **Path (フェーズバー) を `clip-path: polygon(...)` で自作** | SLDS 公式 `slds-path` 一式が含まれているので使う。詳細は **`docs/path.md`** |
| ❌ 使わない | **自前 `sf-timeline*` クラス (旧仕様)** | 真犯人は `slds-truncate` / `slds-truncate_container_75` であり、それらを外せば `slds-timeline` は安全。詳細は **`docs/activity-timeline.md`** |
| ❌ 使わない | **Kanban の現ステージカラムを橙枠で強調 / ビュー切替をテキストボタンで作る / カードに商談名と金額しか入れない** | 詳細は **`docs/kanban.md`** |
| ✅ 必ずやる | アイコンは **`<img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/{sprite}/{name}.svg">`** で個別読み込み | スプライト参照より確実 |
| ✅ 必ずやる | utility アイコンは **CSS `filter` でグレー化** (個別SVGは fill="#fff" のため白背景で透明になる) | 見た目を本物に近づける |
| ✅ 必ずやる | **Global Header / Global Navigation は SLDS 公式コンポーネントを使う**。詳細は **`docs/header-shell.md`** | 自前 `.sf-header` / `.sf-context-bar` で再実装しない |
| ✅ 必ずやる | **グリッドレイアウトは `slds-grid` + `slds-col` + `slds-size_X-of-Y`** を使う | `.sf-row` / `.sf-col-*` の自前グリッドは禁止 |
| ✅ 必ずやる | **横棒グラフは `slds-progress-bar` + `slds-progress-bar__value`** を使う (受注・成功カラーは `slds-progress-bar__value_success`) | 自前 `.sf-bar-*` は禁止 |
| ✅ 必ずやる | **Activity Timeline は SLDS 公式 `slds-timeline`** を使う。詳細は **`docs/activity-timeline.md`** | `slds-timeline__item_expandable` + `slds-timeline__item_{call/email/task/event}` で**左の縦連結線 + 標準アイコン色**が自動で出る |
| ✅ 必ずやる | **Activity Timeline (パターン B) は デフォルトで `slds-is-open` 付きで展開**、switch ボタンに `data-timeline-toggle` を付け、`</body>` 直前に**トグル JS を 1 回だけ**含める | モックを開いた瞬間に詳細が見え、必要なら switch ボタンで畳める。switch アイコンには `<img style="filter: invert(38%)">` + `<button style="position: relative; z-index: 1">` が必須 (これが無いと白背景で透明になり**ボタンが見えない**) |
| ✅ 必ずやる | `<body class="slds-scope">` を必ず付ける | SLDS スタイルがスコープされるため |
| ✅ 必ずやる | `components/` に無いパーツが必要なときは **SLDS1 → SLDS2 → 独自** の順でルックアップ。**MCP 優先 / WebFetch フォールバック**。**SLDS1/SLDS2 から拾ったものだけ** `components/{kebab-name}.html` に保存して再利用可能にする。詳細は「🔎 SLDS ルックアップ手順」セクション | 想像で書くと配色/余白/クラス名が SLDS とズレる |

### 自前 `sf-*` クラスを使ってよい場所 (ホワイトリスト)

SLDS1 に対応物が無い、もしくはモック専用の補助スタイルとして残しておくべきクラス:

| クラス | 役割 | 場所 |
| --- | --- | --- |
| `.sf-main` | 1440px max-width のページラッパ (SLDS の `slds-container_x-large` は 80rem=1280px で互換性なし) | 全テンプレ |
| `.sf-cloud-logo` | Salesforce 雲ロゴ (36px) のサイズ指定 | 全テンプレ |
| `.sf-app-launcher` / `.sf-app-launcher-grid` | 9点グリッドの App Launcher 起動ビジュアル | 全テンプレ |
| `.sf-search-combo` / `.sf-scope-selector` (`-name`/`-chev`) | Global Header 検索バーの Object Switcher + Search Input 統合枠 | 全テンプレ |
| `.sf-action-add` | 「新規作成 (+)」ボタンの円形グレー塗り潰し | 全テンプレ |
| `.sf-app` / `.sf-three-pane` / `.sf-left-pane` / `.sf-center-pane` / `.sf-case-list` / `.sf-case-item` / `.sf-console-header` / `.sf-console-tabs-wrap` | Service Console の 3 ペインレイアウト・ダーク帯ヘッダー・サブタブ高さ補正ラッパ | `console.html` |
| `.sf-kanban-row` / `.sf-kanban-col` (`-won`/`-lost`) / `.sf-kanban-head` / `.sf-kanban-body` / `.sf-kanban-summary` / `.sf-kanban-empty` / `.sf-kanban-card` / `.sf-kc-alert` | カンバンの外枠とカードラッパ・期限警告アイコン (SLDS にカンバンは無い) | `kanban.html` |
| `.sf-af-*` | Agentforce サイドパネル全体 (SLDS1 時代に Agentforce は未対応) | `components/agentforce-panel.html` |
| `.sf-slack-*` | Slack 埋め込み (Salesforce 外の UI) | `components/slack-channel-embed.html` |

**禁止** (新規生成時に**含めてはいけない** 旧仕様クラス):
`sf-header*` / `sf-icon-btn` / `sf-favorite-btn` / `sf-notify-wrap` / `sf-notify-dot` / `sf-context-bar*` / `sf-app-name` / `sf-row` / `sf-col-2-3` / `sf-col-1-3` / `sf-col-1-4` / `sf-col-1-1` / `sf-bar-*` / `sf-console-tabs*` / `sf-console-tab*` / `sf-utility-bar` / `sf-lv-*` / `sf-view-toggle` / `sf-kc-head` / `sf-kc-title` / `sf-kc-menu` / `sf-kc-fields` / `sf-kc-foot` / `sf-pageheader-actions`

## 🚦 使い方の決め手（最初にこれを見る）

ユーザーの依頼を読んで、まず **どのページタイプか** を判断する。

| ユーザーの言葉 | 使うテンプレート |
| --- | --- |
| 「取引先」「商談」「ケース」のレコード詳細 | `templates/record-page.html` |
| 「一覧」「リストビュー」「テーブル」 | `templates/list-view.html` |
| 「ホーム」「ダッシュボードの上のページ」 | `templates/home-page.html` |
| 「カンバン」「ステージ別ボード」 | `templates/kanban.html` (組み立てルールは `docs/kanban.md`) |
| 「Service Console」「ケース管理画面」「3ペイン」 | `templates/console.html` |
| 「ダッシュボード」「KPI」「グラフ」「Sales パイプライン」 | `templates/dashboard.html` |
| 「Service Cloud ダッシュボード」「ケース KPI」「SLA / CSAT」 | `templates/dashboard-service.html` |

## 📁 ディレクトリ構成

```
.claude/skills/salesforce-lightning-mockup/
├── SKILL.md                     ← このファイル（インデックス）
├── style-tokens.html            ← CDN リンク・カスタム CSS・SLDS 早見表
├── docs/                        ← 詳細リファレンス (必要時に Read)
│   ├── header-shell.md          ← Global Header/Nav の必須HTML/CSS・アイコン早見表
│   ├── path.md                  ← Path (フェーズバー) の正しい書き方
│   ├── activity-timeline.md     ← Activity Timeline の正しい書き方
│   ├── kanban.md                ← Kanban (商談ボード) の正しい書き方
│   ├── agentforce-slack.md      ← Agentforce 会話パネル / Slack 埋め込みの組み込み手順
│   └── cost-eval.md             ← 実装コスト評価の出力フォーマット詳細
├── templates/                   ← ページタイプ別フルHTML
│   ├── record-page.html         ← Header/Nav + Highlight Panel + Tabs + Activity Timeline + 関連リスト (Path は無し。商談用には自分で追加)
│   ├── list-view.html           ← Header/Nav + リストビューヘッダ + Datatable
│   ├── home-page.html           ← Header/Nav + KPIカード4つ + 活動カード (関連リストや Timeline は無し)
│   ├── kanban.html              ← Header/Nav + リストビューヘッダ + Kanban (7列・カード構造一式)
│   ├── console.html             ← Header無し3ペイン + サブタブ + Path (ケース) + ハイライトパネル
│   ├── dashboard.html           ← Sales パイプライン版。ヘッダ(パンくず/フィルタ/編集) + 12カラムグリッド + Number×3/Funnel/Donut/担当者横棒/Stacked Bar/Line Chart/Top商談Table。チャートは SVG ベタ書き
│   └── dashboard-service.html   ← Service Cloud 版。オープンケース総数/SLA達成率(Gauge)/平均処理時間 + 優先度別横棒/チャネル別Donut/担当者別オープン/月次優先度Stacked Bar/CSAT Line Chart/SLA違反ケースTable
└── components/                  ← SLDS コンポーネントスニペット集
    ├── global-shell.html        ← Global Header + App Nav + Utility Bar
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
    └── slack-channel-embed.html ← Chatter の代わりに Slack チャンネルを埋め込む
```

## 🧩 コンポーネント早見表

ユーザー依頼に出てきた UI 要素について、**まず以下の早見表でヒットするか確認する**。ヒットしたファイルから該当スニペットをコピペすれば最速。**ここに無いものは「🔎 SLDS ルックアップ手順」**へ進む。

| ユーザーの言葉 | components/ ファイル | 提供する SLDS ブロック |
| --- | --- | --- |
| ボタン / アクションバー | `buttons.html` | Button, Button Group |
| バッジ / ステータスピル | `badges.html` | Badge, Pill |
| モーダル / ダイアログ | `modals.html` | Modal |
| トースト / 通知バナー | `toasts.html` | Toast |
| Path / フェーズバー | `path.html` | Path (詳細: `docs/path.md`) |
| データテーブル / 関連リスト | `data-table.html` | Datatable |
| フォーム / 入力欄 | `forms.html` | Form Element, Input, Combobox |
| 活動タイムライン | `activity-timeline.html` | Activity Timeline (詳細: `docs/activity-timeline.md`) |
| ツリー / タイル | `tiles-tree.html` | Tree, Tile |
| ヘッダー / ナビ | `global-shell.html`, `page-header.html` | Global Header, Page Header (詳細: `docs/header-shell.md`) |
| Agentforce 会話パネル | `agentforce-panel.html` | (独自) (組み込み手順: `docs/agentforce-slack.md`) |
| Slack 埋め込み | `slack-channel-embed.html` | (独自) (組み込み手順: `docs/agentforce-slack.md`) |

## 🔎 SLDS ルックアップ手順

`components/` 早見表に該当が無いパーツは、以下の **段階的フォールバック** で調査する:

1. **SLDS1** ([lightningdesignsystem.com](https://www.lightningdesignsystem.com/)) — 最優先。CDN で読み込んでいる v2.30.4 と一致するため、見つかればそのまま使える
2. **SLDS2** ([lightningdesignsystem.com/2e](https://www.lightningdesignsystem.com/2e/)) — SLDS1 に該当ブロックが無いとき。新ブランド (Cosmos) なので**構造とトークン名のみ参考**にし、HTML/CSS は SLDS1 互換に翻訳
3. **独自実装** — 上記いずれにも無いとき。既存の `sf-*` クラスに合わせた命名で書く

### ルックアップ手段は MCP 優先 / WebFetch フォールバック

**[手段 1] Salesforce DX MCP (利用可能なら最優先)**

サーバ側でキャッシュ済みなので速い:

- `mcp__Salesforce_DX__explore_slds_blueprints` … blueprint の構造/HTML を引く
- `mcp__Salesforce_DX__guide_slds_blueprints` … 使い方ガイダンス
- `mcp__Salesforce_DX__explore_slds_styling` … 設計トークン/CSS 変数を引く
- `mcp__Salesforce_DX__guide_slds_styling` … スタイリング指針

ツール定義が会話に出ていない (deferred) 場合は `ToolSearch` で先にロード。これらのツールが**そもそも存在しない環境**(例: Salesforce DX MCP が設定されていないユーザー)では [手段 2] にフォールバック。

**[手段 2] WebFetch (MCP 利用不可時)**

```
SLDS1: https://www.lightningdesignsystem.com/components/{kebab-name}/
       例: progress-ring, file-selector, datepicker, expandable-section, vertical-tabs
SLDS2: https://www.lightningdesignsystem.com/2e/components/{kebab-name}/
```

### 日本語語彙 → 英語 kebab-name のヒント

進捗リング → `progress-ring` / プログレスバー → `progress-bar` / 検索コンボ → `combobox` / 日付ピッカー → `datepicker` / アコーディオン → `expandable-section` / タブ → `tabs` / 画像ギャラリー → `carousel` / メニュー → `menus` / ツールチップ → `tooltips` / ファイル選択 → `file-selector` / トグル → `checkbox-toggle` / スライダー → `slider`

### 既存のモック規約に合わせる(取得後の整形)

- ❌ `<svg><use xlink:href="...symbols.svg#...">` はそのまま使わない → **必ず `<img src="...{sprite}/{name}.svg">` に置換**(file:// CORS 対策)
- ❌ タイトル系に `slds-truncate` を付けない (既存ルール)
- ✅ クラスは `slds-*` をそのまま採用 (CDN v2.30.4 に含まれている)
- ✅ アイコンは `utility/{name}.svg` / `standard/{name}.svg` を `<img>` で参照
- ✅ SLDS2 から拾うときは設計トークン (`--slds-c-*`) を SLDS1 のハードコード値に変換

### 成果物の保存ルール

★ **SLDS1 / SLDS2 から拾ったパーツのみ保存**。独自実装は保存しない(ユーザーが「これを components/ に保存して」と**明示指示**した場合のみ保存)。

保存先: `components/{kebab-name}.html`。コメント先頭で出典を明記:

```html
<!-- Source: SLDS1 progress-ring (取得手段: MCP explore_slds_blueprints) -->
<!-- 改変点: <svg><use> → <img> に置換 -->
```

または:

```html
<!-- Source: SLDS1 progress-ring (https://www.lightningdesignsystem.com/components/progress-ring/) -->
<!-- 改変点: <svg><use> → <img> に置換 -->
```

保存後は **必ず** `SKILL.md` の以下 2 箇所に 1 行追加:
- 「📁 ディレクトリ構成」のツリー
- 「🧩 コンポーネント早見表」の表

これで次回以降は早見表でヒットして再ルックアップが不要になる(永続キャッシュ)。

## 🎨 ヘッダ / ナビ / アイコン

詳細リファレンスは **`docs/header-shell.md`** に分離。以下が含まれる:

- 必須ヘッダ HTML（DOCTYPE / SLDS CDN / 全テンプレ共通CSS）
- 必須ヘッダーHTML（Global Header + Global Navigation, SLDS 公式）
- グリッドレイアウト (2/3 + 1/3 等)
- アイコンの正しい書き方（standard / utility / doctype の URL構造）
- オブジェクトアイコン早見表（Account / Contact / Lead / Opportunity / Case / Task / Event / Document / Dashboard / Log a Call / Email）

新規生成時は基本的に `templates/{page-type}.html` をコピペすれば既にこれらが組み込まれているので、`docs/header-shell.md` を直接 Read する必要はほぼ無い。**自前でヘッダだけ組みたい / 組み込み済みヘッダを修正したい場合のみ参照**。

## 📐 Path / 📊 Activity Timeline / 🗂 Kanban / 🤖 Agentforce / 💬 Slack

これらは **本物っぽさ** が出るかどうかの分かれ目になる重要 UI なので、専用ドキュメントに詳細を分離した。**新規生成や修正で対象 UI が含まれるときは必ず該当 docs を Read** すること。

| UI | 詳細ドキュメント | いつ Read するか |
| --- | --- | --- |
| Path (フェーズバー) | `docs/path.md` | 商談ステージ・ケースステータス・カスタムフェーズなどシェブロン状のバーを描くとき |
| Activity Timeline | `docs/activity-timeline.md` | 「活動」タブ・通話/メール/タスク/イベントの履歴を描くとき |
| Kanban (商談ボード) | `docs/kanban.md` | カンバンビュー・ステージ別ボードを描くとき |
| Agentforce 会話パネル / Slack 埋め込み | `docs/agentforce-slack.md` | Agentforce サイドパネル / Chatter 代替の Slack チャンネルを描くとき |

`components/{path,activity-timeline,agentforce-panel,slack-channel-embed}.html` も併用する。

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
3. **テンプレートを `cp` でコピー (★スピード優先)**:
   ```bash
   cp .claude/skills/salesforce-lightning-mockup/templates/<page-type>.html output/<日時>_<内容名>.html
   ```
   - **デフォルトは `Bash cp` を使う**。`Read templates/...` → `Write output/...` のフルコピーは**やらない** (テンプレ全体を出力トークンで書き直すと遅くなる)
   - cp 後はテンプレを Read せずに、直接 `Edit` で差分だけ書き換える。各テンプレの含有要素は「📁 ディレクトリ構成」のサマリで把握する
   - **例外: テンプレを 80% 以上書き換える大改造のとき**(レイアウトを丸ごと変える / 違うページタイプに作り変える) は `Read` + `Write` の方が速い。判断基準は「Edit を 30 回以上叩きそうか」
   - **修正依頼**(既存 output ファイルを変えたい)の場合は cp せず、対象ファイルを直接 `Edit`
4. **タイトル・固有値を差し替え**: 取引先名、項目名、所有者名などを `Edit` で差分修正。同じ語が複数あるときは `replace_all: true` を活用、1 箇所だけ変えたいときは前後コンテキストを足して `old_string` を一意化する。
5. **コンポーネントを足す** — 段階的フォールバック:
   - **5-1.** 依頼に出てくる UI 要素を列挙(例: 「カラフルなプログレスリング」「カレンダーピッカー」「カンバン」)
   - **5-2.** 「🧩 コンポーネント早見表」でヒットするか確認:
     - **ヒット** → そのファイルから該当スニペットをコピペ。**Path / Activity Timeline / Kanban / Agentforce / Slack** が含まれる場合は対応する `docs/*.md` を必ず Read してから組み立て
     - **ヒットしない** → 5-3 へ
   - **5-3.** 「🔎 SLDS ルックアップ手順」に従って **SLDS1 → SLDS2 → 独自** の順で調査:
     - **SLDS1 ヒット**: 取得 (MCP 優先 / WebFetch フォールバック) → モック規約に整形 → `components/{kebab-name}.html` に保存 → 「📁 ディレクトリ構成」と「🧩 コンポーネント早見表」を更新
     - **SLDS2 ヒット**: 取得 → SLDS1 互換 CSS に翻訳 → 同様に保存 + 更新
     - **両方ヒットせず**: `sf-*` プレフィックスでインライン実装(**保存はしない**。ユーザーが明示指示したときのみ保存)
   - **5-4.** テンプレートに組み込む
6. **アイコンを選ぶ**: オブジェクト種別に応じて `docs/header-shell.md` のオブジェクトアイコン早見表からファイル名・クラスを選ぶ。
7. **ローカルブラウザで確認**: `file://` で開く前提なので、外部依存は CDN のみで完結している。
8. **実装コスト評価をコンソール出力**（次のセクション参照）。**HTML 生成完了後に必ず実行する**。

## 💰 実装コスト評価の出力（必須・最終ステップ）

HTML を生成し終わった後、**必ずユーザー向けに「Salesforce / Agentforce で実装する場合のコスト評価」をコンソールに出力する**。

評価ルール (3 段階) と出力フォーマット・参考評価例は **`docs/cost-eval.md`** にまとめてあるので参照する。

要点:
- **✅ 低コスト**: 標準機能 / 設定 / Lightning App Builder
- **⚠️ 中コスト**: カスタム項目・Apex / Flow / カスタム LWC・SLDS の組合せ
- **🔴 高コスト**: フルカスタム LWC + Apex・外部連携・ML / Agentforce チューニング・独自 UX
- 出力フォーマットは `docs/cost-eval.md` の「出力フォーマット」をそのまま使う

## ✏️ 修正時のチェック項目

- [ ] Tailwind が混入していないか (`cdn.tailwindcss.com` 検索)
- [ ] アイコンが `<svg><use>` ではなく `<img>` で書かれているか
- [ ] utility アイコンに `filter` が当たっているか（白アイコン透明化対策）
- [ ] **Global Header が `slds-global-header_container` + `slds-global-header` + `slds-global-actions` で書かれているか** (自前 `.sf-header` / `.sf-icon-btn` / `.sf-favorite-btn` / `.sf-notify-*` を残していないか)
- [ ] **Global Navigation が `slds-context-bar` + `slds-context-bar__primary` + `slds-context-bar__secondary` で書かれているか** (自前 `.sf-context-bar` / `.sf-app-name` を残していないか)
- [ ] **アクティブタブが `<li class="slds-context-bar__item slds-is-active">` か** (`<li class="is-active">` の旧パターンを残していないか)
- [ ] **お気に入りボタンに `slds-global-actions__favorites` が付いているか** (青背景は SLDS 標準で出る)
- [ ] **通知バッジが `slds-notification-badge` か** (自前 `.sf-notify-dot` を残していないか)
- [ ] **グリッドが `slds-grid` + `slds-col` + `slds-size_X-of-Y` で書かれているか** (`.sf-row` / `.sf-col-*` を残していないか)
- [ ] **横棒グラフが `slds-progress-bar` + `slds-progress-bar__value` で書かれているか** (`.sf-bar-*` を残していないか)
- [ ] **Console のサブタブが `slds-tabs_default__nav` + `slds-tabs_default__item` で書かれているか** (`.sf-console-tab*` を残していないか)
- [ ] **Console の Utility Bar が `slds-utility-bar_container` + `slds-utility-bar` で書かれているか** (`.sf-utility-bar` を残していないか)
- [ ] **Kanban カードの内側が `slds-tile__title` + `slds-list_horizontal` + `slds-item_label` / `slds-item_detail` で書かれているか** (`.sf-kc-head` / `.sf-kc-title` / `.sf-kc-fields` 等を残していないか) — 詳細 `docs/kanban.md`
- [ ] Activity Timeline は **`slds-timeline` (SLDS 公式)** を使っているか / `__item_expandable` を `<li>` 内の `<div>` に付けているか / タイトル `<h3>` に `slds-truncate` を **付けていない** か / 自前 `sf-timeline*` を残していないか — 詳細 `docs/activity-timeline.md`
- [ ] Activity Timeline パターン B を使うとき、**switch ボタンに `data-timeline-toggle`、`<img>` に `style="filter: invert(38%)"`、`<button>` に `style="position: relative; z-index: 1"`** が付いているか / **`</body>` 直前にトグル JS スニペット (`document.addEventListener('click', ...)` で `data-timeline-toggle` を拾うブロック) が 1 つだけ存在するか** — 詳細 `docs/activity-timeline.md`
- [ ] **Path (フェーズバー) を `clip-path: polygon` で自作していないか / `slds-path` を使っているか** — 詳細 `docs/path.md`
- [ ] **Kanban のカラムを橙枠で強調していないか (Won/Lost のみ色付け) / ビュー切替が `slds-button-group` + `slds-button_icon-border-filled` の 3 アイコン (active は `slds-is-selected`) か / カードに「商談名/金額/完了予定日/取引先/アバター/⋮」の 6 要素が入っているか** — 詳細 `docs/kanban.md`
- [ ] **`components/` に無いパーツを使うとき、SLDS1 → SLDS2 → 独自 の順でルックアップしたか**(Salesforce DX MCP `explore_slds_blueprints` 等が使える環境なら **MCP 優先**、不可なら WebFetch) / **SLDS1・SLDS2 から拾ったものだけ** `components/<kebab-name>.html` に保存したか / 保存した場合は **「📁 ディレクトリ構成」と「🧩 コンポーネント早見表」の両方を更新したか**
- [ ] タイトル系に `slds-truncate` を付けていないか
- [ ] Einstein → Agentforce に統一されているか
- [ ] `<body class="slds-scope">` か
- [ ] 出力先が `output/YYYYMMDD_HHMM_*.html` か
- [ ] **HTML 生成後に「実装コスト評価」をコンソール出力したか**（💰 セクション・`docs/cost-eval.md` 参照）
