# Global Header / Navigation 必須HTML & CSS

> このファイルはレコードページ・リストビュー・ホーム・カンバン・コンソール・ダッシュボードの**全テンプレ共通の上部シェル**を組むための「コピペ素材」です。SKILL.md の本文ではなく、必要なときだけ参照する詳細リファレンス。

## 必須ヘッダ（コピペで使う）

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

  /* ============== Global Header (SLDS 公式 + 高さ・sticky の最小調整) ============== */
  .slds-global-header_container { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #c9c9c9; }
  .slds-global-header { height: 3rem; padding: 0 1rem; }
  .slds-global-header__item_search { width: 56%; max-width: 48rem; }

  /* utility アイコン (fill="#fff") を Header / Context Bar 内だけ灰色化 */
  .slds-global-header .slds-button .slds-button__icon,
  .slds-context-bar .slds-button_icon .slds-button__icon,
  .slds-input__icon {
    filter: brightness(0) saturate(100%) invert(43%) sepia(13%) saturate(295%) hue-rotate(180deg) brightness(95%) contrast(85%);
    width: 14px; height: 14px;
  }
  .slds-context-bar .slds-button_icon .slds-button__icon_small { width: 14px; height: 14px; }

  /* Object Switcher + Search Input 統合枠 (公式 v1 docs に準拠: 白背景・薄い枠) */
  .sf-search-combo { display: flex; height: 2rem; border: 1px solid #dddbda; border-radius: 0.25rem; background: white; overflow: hidden; }
  .sf-search-combo .slds-form-element { flex: 1; }
  .sf-search-combo .slds-input { border: none; height: 100%; box-shadow: none; background: white; }
  .sf-search-combo .slds-input:focus { box-shadow: none; outline: none; }
  .sf-scope-selector { flex: 0 0 8rem; border: none; border-right: 1px solid #dddbda; background: white; height: 2rem; padding: 0 0.5rem 0 0.75rem; display: inline-flex; align-items: center; justify-content: space-between; cursor: pointer; }
  .sf-scope-selector .sf-scope-name { font-size: 0.8125rem; color: #181818; }
  .sf-scope-selector .sf-scope-chev { width: 12px; height: 12px; filter: brightness(0) saturate(100%) invert(43%) sepia(13%) saturate(295%) hue-rotate(180deg) brightness(95%) contrast(85%); }

  /* お気に入り (★ + ▼) を border 付きで連結。SLDS デフォルトの margin-right と隣接 button margin を打ち消す */
  .slds-global-header .slds-global-actions__favorites { margin-right: 0; }
  .slds-global-header .slds-global-actions__favorites,
  .slds-global-header .slds-global-actions__favorites-more { background: white; border: 1px solid #dddbda; height: 2rem; padding: 0; display: inline-flex; align-items: center; justify-content: center; }
  .slds-global-header .slds-global-actions__favorites { border-right: none; border-radius: 0.25rem 0 0 0.25rem; width: 2rem; }
  .slds-global-header .slds-global-actions__favorites-more { border-radius: 0 0.25rem 0.25rem 0; width: 1.5rem; margin-left: 0; }
  .slds-global-header .slds-global-actions__favorites-more .slds-button__icon { width: 10px; height: 10px; }
  /* 「新規作成 (+)」だけ円形のグレー塗り潰し (公式仕様)。
     Agentforce / ヘルプ / 設定 / ベルはすべて枠なしフラット (slds-button_icon のみ) */
  .sf-action-add { width: 1.75rem; height: 1.75rem; border-radius: 50%; background: #747474; display: inline-flex; align-items: center; justify-content: center; border: none; cursor: pointer; padding: 0; }
  .sf-action-add img { filter: brightness(0) invert(1); width: 12px; height: 12px; }

  /* 9点 App Launcher (SLDS にビジュアル無し) */
  .sf-app-launcher { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; cursor: pointer; }
  .sf-app-launcher-grid { display: grid; grid-template-columns: repeat(3, 4px); grid-template-rows: repeat(3, 4px); gap: 3px; }
  .sf-app-launcher-grid span { width: 4px; height: 4px; background: #54698d; border-radius: 1px; }

  /* Salesforce 雲ロゴサイズ */
  .sf-cloud-logo { width: 36px; height: auto; }

  /* Activity Timeline / Path / Tabs / Tile / Progress Bar / Utility Bar は SLDS 公式をそのまま使うため自前 CSS 不要 */
</style>
</head>
<body class="slds-scope">
```

## 必須ヘッダーHTML（Global Header + Global Navigation, SLDS 公式）

```html
<!-- Global Header (SLDS 公式) -->
<header class="slds-global-header_container slds-no-print">
  <div class="slds-global-header slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
    <!-- Salesforce Cloud ロゴ -->
    <div class="slds-global-header__item">
      <img class="sf-cloud-logo" src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/images/logo.svg" alt="Salesforce" />
    </div>

    <!-- 検索バー (Object Switcher + Search Input) -->
    <div class="slds-global-header__item slds-global-header__item_search">
      <div class="sf-search-combo">
        <button class="sf-scope-selector" title="検索対象オブジェクトを選択">
          <span class="sf-scope-name">取引先</span>
          <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/down.svg" alt="" class="sf-scope-chev" />
        </button>
        <div class="slds-form-element">
          <div class="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
            <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/search.svg" alt="" class="slds-icon slds-input__icon slds-icon-text-default slds-icon_x-small" />
            <input type="search" placeholder="Salesforce を検索..." class="slds-input">
          </div>
        </div>
      </div>
    </div>

    <!-- 右側アクション群 (slds-global-actions) -->
    <ul class="slds-global-actions slds-grid slds-grid_vertical-align-center" style="gap:0.25rem;">
      <li class="slds-global-actions__item"><button class="slds-button slds-button_icon" title="Agentforce"><img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/agent_astro.svg" alt="" class="slds-button__icon" /><span class="slds-assistive-text">Agentforce</span></button></li>
      <!-- お気に入り: 星トグル + chevron の 2 ボタン構造 (公式仕様) -->
      <li class="slds-global-actions__item">
        <div class="slds-grid">
          <button class="slds-button slds-button_icon slds-global-actions__favorites slds-global-actions__favorites_unselected" aria-pressed="false" title="お気に入りに追加"><img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/favorite.svg" alt="" class="slds-button__icon" /><span class="slds-assistive-text">お気に入りに追加</span></button>
          <button class="slds-button slds-button_icon slds-global-actions__favorites-more" aria-haspopup="true" title="お気に入り一覧"><img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/down.svg" alt="" class="slds-button__icon" /><span class="slds-assistive-text">お気に入り一覧</span></button>
        </div>
      </li>
      <li class="slds-global-actions__item"><button class="sf-action-add" title="新規作成"><img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/add.svg" alt="" /><span class="slds-assistive-text">新規作成</span></button></li>
      <li class="slds-global-actions__item"><button class="slds-button slds-button_icon" title="ヘルプ"><img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/help.svg" alt="" class="slds-button__icon" /><span class="slds-assistive-text">ヘルプ</span></button></li>
      <li class="slds-global-actions__item"><button class="slds-button slds-button_icon" title="設定"><img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/setup.svg" alt="" class="slds-button__icon" /><span class="slds-assistive-text">設定</span></button></li>
      <li class="slds-global-actions__item"><button class="slds-button slds-button_icon" title="通知"><img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/notification.svg" alt="" class="slds-button__icon" /><span class="slds-notification-badge slds-incoming-notification slds-show-notification">3</span><span class="slds-assistive-text">通知</span></button></li>
      <li class="slds-global-actions__item slds-m-left_x-small"><span class="slds-avatar slds-avatar_circle slds-avatar_small"><img src="https://i.pravatar.cc/64?img=12" alt="User"></span></li>
    </ul>
  </div>
</header>

<!-- Global Navigation (SLDS 公式 Context Bar) -->
<div class="slds-context-bar">
  <div class="slds-context-bar__primary slds-context-bar__item_app">
    <!-- App Launcher (9点グリッド: SLDS にビジュアル無いので自前) -->
    <div class="sf-app-launcher" title="アプリケーションランチャー">
      <div class="sf-app-launcher-grid">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
        <span></span><span></span><span></span>
      </div>
    </div>
    <span class="slds-context-bar__label-action slds-context-bar__app-name">
      <span>Sales</span>
    </span>
  </div>

  <nav class="slds-context-bar__secondary" role="navigation">
    <ul class="slds-grid">
      <li class="slds-context-bar__item"><a href="#" class="slds-context-bar__label-action">ホーム</a></li>
      <li class="slds-context-bar__item slds-is-active">
        <a href="#" class="slds-context-bar__label-action" aria-haspopup="true">取引先</a>
        <div class="slds-context-bar__icon-action slds-p-left_none">
          <button class="slds-button slds-button_icon" aria-haspopup="true" title="メニューを開く">
            <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/chevrondown.svg" alt="" class="slds-button__icon slds-button__icon_small" />
            <span class="slds-assistive-text">メニューを開く</span>
          </button>
        </div>
      </li>
      <li class="slds-context-bar__item"><a href="#" class="slds-context-bar__label-action" aria-haspopup="true">取引先責任者</a></li>
      <li class="slds-context-bar__item"><a href="#" class="slds-context-bar__label-action" aria-haspopup="true">リード</a></li>
      <li class="slds-context-bar__item"><a href="#" class="slds-context-bar__label-action" aria-haspopup="true">商談</a></li>
      <li class="slds-context-bar__item"><a href="#" class="slds-context-bar__label-action" aria-haspopup="true">ダッシュボード</a></li>
      <li class="slds-context-bar__item"><a href="#" class="slds-context-bar__label-action" aria-haspopup="true">レポート</a></li>
    </ul>
  </nav>
</div>
```

### 構造のポイント

- **`slds-global-header_container` > `slds-global-header`** でヘッダー全体を包む。`slds-grid_align-spread` で左 (ロゴ) / 中央 (検索) / 右 (アクション) の 3 ブロックを左右に引き離す
- **検索バー左には Object Switcher (`Accounts ▼` / `取引先 ▼` 等)** を `.sf-scope-selector` で入れる。これは公式 v1 docs の「Search with Scope」パターン (https://v1.lightningdesignsystem.com/components/global-header/) に合わせたもの
- **`slds-global-actions`** は `<ul>`、各アクションは `<li class="slds-global-actions__item">`
- **アクションアイコンは枠なしフラット** (`slds-button slds-button_icon`)。公式 v1 docs screenshot に合わせて、Agentforce / 新規 / ヘルプ / 設定 / 通知のアイコンには枠を付けない (`slds-button_icon-container` を**付けない**)
- **お気に入りボタンだけ「星トグル + chevron」の 2 ボタン連結枠** (`slds-global-actions__favorites` + `slds-global-actions__favorites-more`) を `<div class="slds-grid">` で包む。SLDS のデフォルト青塗り潰しは CSS で抑制し、公式仕様の「白背景 + 薄い枠 + 灰アイコン」に揃える
- **通知バッジは `slds-notification-badge`** で赤丸 + 数字 (空でも可)
- **Context Bar の active タブは `slds-is-active`** クラスで青下線 (`#0176d3` 3px) が自動で付く
- **App Launcher の 9 点ビジュアルは SLDS に無い**ので自前 (`.sf-app-launcher` + `.sf-app-launcher-grid`) で維持

### グリッドレイアウト (2/3 + 1/3 等)

メインコンテンツの 2 カラム・3 カラム・4 カラム分割は **`slds-grid` + `slds-col` + `slds-size_X-of-Y`** で書く:

```html
<div class="slds-grid slds-gutters_small slds-wrap">
  <div class="slds-col slds-size_2-of-3"><!-- 左 2/3 --></div>
  <div class="slds-col slds-size_1-of-3"><!-- 右 1/3 --></div>
</div>

<!-- 4 カラム KPI -->
<div class="slds-grid slds-gutters_small slds-wrap">
  <div class="slds-col slds-size_1-of-4"><!-- KPI 1 --></div>
  <div class="slds-col slds-size_1-of-4"><!-- KPI 2 --></div>
  <div class="slds-col slds-size_1-of-4"><!-- KPI 3 --></div>
  <div class="slds-col slds-size_1-of-4"><!-- KPI 4 --></div>
</div>
```

`slds-gutters_small` は gap 0.5rem 相当。広めにしたい時は `slds-gutters` (1.5rem)、狭めにしたい時は `slds-gutters_xx-small` (0.25rem)。

## アイコンの正しい書き方

### オブジェクト系（standard）

色付き背景＋白アイコンで自動表示される:

```html
<span class="slds-icon_container slds-icon-standard-account">
  <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/standard/account.svg" alt="" class="slds-icon slds-icon_medium" />
</span>
```

### 装飾系（utility）→ filter でグレー化

SLDS 公式 `slds-button slds-button_icon` で書く。CSS 側で Header / Context Bar 配下の `.slds-button__icon` に灰色化フィルタを当てるルールを必ず入れる:

```html
<button class="slds-button slds-button_icon" title="検索">
  <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/search.svg" alt="" class="slds-button__icon" />
  <span class="slds-assistive-text">検索</span>
</button>
```

```css
/* Header / Context Bar 配下の utility アイコンを灰色化 */
.slds-global-header .slds-button_icon .slds-button__icon,
.slds-context-bar .slds-button_icon .slds-button__icon {
  filter: brightness(0) saturate(100%) invert(43%) sepia(13%) saturate(295%) hue-rotate(180deg) brightness(95%) contrast(85%);
  width: 18px; height: 18px;
}
```

### ファイル種別（doctype）

```html
<span class="slds-icon_container slds-icon-doctype-pdf">
  <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/doctype/pdf.svg" alt="" class="slds-icon slds-icon_small" />
</span>
```

### URL構造

`assets/icons/{sprite}/{name}.svg` (sprite = `standard` / `utility` / `doctype` / `action` / `custom`)。`-sprite/svg/symbols.svg#` の形式は使わない。

## オブジェクトアイコン早見表

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
