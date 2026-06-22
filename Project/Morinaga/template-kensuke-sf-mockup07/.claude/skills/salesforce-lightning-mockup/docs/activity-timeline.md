# Activity Timeline の正しい書き方

商談・取引先・ケースの「活動」タブで使う Activity Timeline は **SLDS 公式 `slds-timeline`** を使う (公式: https://v1.lightningdesignsystem.com/components/activity-timeline/)。CDN の SLDS CSS にスタイル一式が含まれているため、追加 import やオーバーライドは不要。

## 構造の核

| 要素 | 役割 |
| --- | --- |
| `<ul class="slds-timeline">` | ルート (ul 自体には CSS は無く、子の修飾子で形が決まる) |
| `<li>` > `<div class="slds-timeline__item_expandable slds-timeline__item_{call\|email\|task\|event}">` | 各イベント。**`__item_expandable` が必須** (これが無いとスタイルが付かない)。`{call/email/task/event}` で **左の縦連結線の色** が決まる |
| `<div class="slds-icon_container slds-icon-standard-{log-a-call\|email\|task\|event} slds-timeline__icon">` | アイコン領域。**色は `slds-icon-standard-*` が自動付与** (call=緑 / email=青 / task=緑 / event=紫)。自前で背景色を上書きしない |
| `slds-timeline__trigger` | タイトル行 (左 = h3 タイトル, 右 = `slds-timeline__date` + アクションボタン) |
| `slds-is-open` + `<article class="slds-box slds-timeline__item_details slds-theme_shade ...">` | 詳細パネル (常時展開したい場合は li に `slds-is-open` を付け、article から `hidden` を外す) |

## NG パターン

- ❌ `<ul class="slds-timeline">` だけで `__item_expandable` を省略 → スタイルが付かない (見た目が崩れる)
- ❌ `<h3 class="slds-truncate">` でタイトルを省略 → 公式 example は付けているがモックでは情報が消えるので **付けない**
- ❌ `slds-timeline__icon` の背景色を CSS で上書き → `slds-icon-standard-*` が決める標準色を壊す
- ❌ 自前 `sf-timeline*` クラス (旧仕様) を新規に書く
- ❌ パターン B の switch ボタンの `<img>` に `style="filter: invert(38%)"` を付け忘れる → `utility/switch.svg` は白塗り SVG なのでボタンが**白背景で透明化して見えなくなる**
- ❌ パターン B の switch ボタン本体に `style="position: relative; z-index: 1"` を付け忘れる → 隣の `slds-timeline__icon` (標準アイコンの円) に潜って見えなくなる
- ❌ JS スニペットを忘れて `slds-is-open` だけ静的に付ける → 「展開はされるがクリックしても畳めない」状態になりインタラクティブ性が失われる

## パターン A: シンプル (タイトルのみ・トグル無し)

最も典型。一覧で件数が多い場合や、詳細パネルが不要な場合に使う:

```html
<ul class="slds-timeline">
  <li>
    <div class="slds-timeline__item_expandable slds-timeline__item_call">
      <span class="slds-assistive-text">call</span>
      <div class="slds-media">
        <div class="slds-media__figure">
          <div class="slds-icon_container slds-icon-standard-log-a-call slds-timeline__icon" title="call">
            <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/standard/log_a_call.svg" alt="" class="slds-icon slds-icon_small" />
          </div>
        </div>
        <div class="slds-media__body">
          <div class="slds-grid slds-grid_align-spread slds-timeline__trigger">
            <h3><a href="#"><strong>フォローアップコール</strong></a></h3>
            <p class="slds-timeline__date">期日 6月15日</p>
          </div>
          <p class="slds-m-horizontal_xx-small slds-text-body_small">担当: 青島 哲也</p>
        </div>
      </div>
    </div>
  </li>
  <li>
    <div class="slds-timeline__item_expandable slds-timeline__item_email">
      <span class="slds-assistive-text">email</span>
      <div class="slds-media">
        <div class="slds-media__figure">
          <div class="slds-icon_container slds-icon-standard-email slds-timeline__icon" title="email">
            <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/standard/email.svg" alt="" class="slds-icon slds-icon_small" />
          </div>
        </div>
        <div class="slds-media__body">
          <div class="slds-grid slds-grid_align-spread slds-timeline__trigger">
            <h3><a href="#"><strong>提案書を送付</strong></a></h3>
            <p class="slds-timeline__date slds-text-color_destructive">期日 6月10日 (期限切れ)</p>
          </div>
        </div>
      </div>
    </div>
  </li>
</ul>
```

## パターン B: Expandable (詳細パネル付き・デフォルト展開 / switch で畳める)

「電話の議事メモ」「メール本文」など、詳細を一緒に見せたい場合。**初期表示は `slds-is-open` を付けて展開**、**switch ボタンクリックで畳める**:

```html
<li>
  <div class="slds-timeline__item_expandable slds-timeline__item_call slds-is-open">
    <span class="slds-assistive-text">call</span>
    <div class="slds-media">
      <div class="slds-media__figure">
        <button class="slds-button slds-button_icon" aria-expanded="true" title="詳細を切り替え"
                data-timeline-toggle
                style="position: relative; z-index: 1;">
          <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/switch.svg"
               alt="" class="slds-button__icon slds-timeline__details-action-icon"
               style="filter: invert(38%);" />
          <span class="slds-assistive-text">詳細を切り替え</span>
        </button>
        <div class="slds-icon_container slds-icon-standard-log-a-call slds-timeline__icon" title="call">
          <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/standard/log_a_call.svg" alt="" class="slds-icon slds-icon_small" />
        </div>
      </div>
      <div class="slds-media__body">
        <div class="slds-grid slds-grid_align-spread slds-timeline__trigger">
          <h3><a href="#"><strong>キックオフ電話会議</strong></a></h3>
          <div class="slds-timeline__actions slds-timeline__actions_inline">
            <p class="slds-timeline__date">10:00 | 6/12</p>
          </div>
        </div>
        <p class="slds-m-horizontal_xx-small">あなた が <a href="#">山田 太郎</a> と通話しました</p>
        <article class="slds-box slds-timeline__item_details slds-theme_shade slds-m-top_x-small slds-m-horizontal_xx-small slds-p-around_medium">
          <ul class="slds-list_horizontal slds-wrap">
            <li class="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
              <span class="slds-text-title slds-p-bottom_x-small">担当者</span>
              <span class="slds-text-body_medium"><a href="#">山田 太郎</a></span>
            </li>
            <li class="slds-grid slds-grid_vertical slds-size_1-of-2 slds-p-bottom_small">
              <span class="slds-text-title slds-p-bottom_x-small">関連先</span>
              <span class="slds-text-body_medium"><a href="#">A 社 — 提案 v3.3</a></span>
            </li>
          </ul>
          <div>
            <span class="slds-text-title">概要</span>
            <p class="slds-p-top_x-small">先方は提案内容に前向き。来週中に正式回答の見込み。</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</li>
```

### switch ボタンに必要なインライン style (省略禁止)

| 場所 | style | 役割 |
| --- | --- | --- |
| `<button>` | `position: relative; z-index: 1;` | 隣接する `slds-timeline__icon` (標準アイコンの円) の下に潜らせない |
| `<img>` | `filter: invert(38%);` | `utility/switch.svg` は白塗り SVG なので、これが無いと**白背景で透明化してボタンが見えない** |

### 折りたたみ初期状態にしたい場合

`slds-is-open` を外し、`aria-expanded="false"` にする。HTML 構造はそのまま (詳細 article は DOM に残しておく):

```html
<div class="slds-timeline__item_expandable slds-timeline__item_email">
  ...
  <button ... aria-expanded="false" data-timeline-toggle ...>
  ...
</div>
```

### トグル JS (1 ページに 1 回だけ)

`</body>` 直前に以下を 1 回だけ含める。複数のタイムラインがあっても 1 回でよい (イベント委譲):

```html
<script>
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-timeline-toggle]');
    if (!btn) return;
    var item = btn.closest('.slds-timeline__item_expandable');
    if (!item) return;
    var open = item.classList.toggle('slds-is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
</script>
```

- パターン A のアイテム (`data-timeline-toggle` 付きボタンが無い) は一切影響を受けない
- `slds-is-open` の有無で詳細 article の表示/非表示が切り替わる (SLDS の標準 CSS が制御)

## グルーピングヘッダー (「今後 & 期限切れ (2)」「6月 (5)」)

タイムラインの途中に時期見出しを挟みたい場合:

```html
<h3 class="slds-timeline__title slds-text-align_center slds-m-vertical_medium">
  <span class="slds-timeline__title-content slds-text-heading_label">今後 &amp; 期限切れ (2)</span>
</h3>
<ul class="slds-timeline">
  <!-- li を並べる -->
</ul>
```

`__title:after` が下端に点線を引き、`__title-content` が白背景で点線を割る (公式 SCSS で実装済み)。

## タイプ別差分 (call / email / task / event)

差分は **2 か所だけ**:

| タイプ | 修飾子クラス | アイコンコンテナ | アイコン svg ファイル |
| --- | --- | --- | --- |
| 電話 | `slds-timeline__item_call` | `slds-icon-standard-log-a-call` | `standard/log_a_call.svg` |
| メール | `slds-timeline__item_email` | `slds-icon-standard-email` | `standard/email.svg` |
| ToDo | `slds-timeline__item_task` | `slds-icon-standard-task` | `standard/task.svg` |
| 行動 | `slds-timeline__item_event` | `slds-icon-standard-event` | `standard/event.svg` |

**注意**: `__item_*` は **左の縦連結線の色** (call=緑/email=グレー/event=紫/task=緑) を決め、`slds-icon-standard-*` は **アイコンの背景色** (call=緑/email=青/task=緑/event=紫) を決める。両者は **別物** で、特に email では連結線がグレー・アイコンが青になる。これが本物の SLDS の挙動なので尊重する。
