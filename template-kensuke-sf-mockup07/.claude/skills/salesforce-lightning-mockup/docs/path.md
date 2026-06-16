# Path (フェーズバー) の正しい書き方

商談ステージ・ケースステータス・カスタムフェーズなど、**右向き矢印が連結したシェブロン状のバー**は SLDS 公式 `slds-path` を **そのまま** 使う。CDN の `salesforce-lightning-design-system.min.css` にスタイル一式 (`::before/::after + transform: skew(±28〜30deg)` で生成されるシェブロン形状) が含まれているので、追加 import やオーバーライドは不要。

## 絶対やらないこと

- ❌ **`clip-path: polygon(...)` で自前のシェブロン**を作る → 矢印先端の角度が浅すぎたり、隣り合うステップが重なって縦中央が欠けたりして「本物に見えない」状態になる
- ❌ 自前 `<div class="step done">` 等のフラットな箱で並べる → 単なる色分けタブにしか見えない

## 必ずやること

`components/path.html` をベースに以下の構造で書く (これがほぼ最小の正規構造):

```html
<div class="slds-card">
  <article class="slds-path">
    <div class="slds-grid slds-path__track">
      <div class="slds-grid slds-path__scroller-container">
        <div class="slds-path__scroller" role="application">
          <div class="slds-path__scroller_inner">
            <ul class="slds-path__nav" role="listbox">

              <!-- 完了済み: チェックマーク + 緑塗り -->
              <li class="slds-path__item slds-is-complete" role="presentation">
                <a aria-selected="false" class="slds-path__link" href="#" role="option" tabindex="-1">
                  <span class="slds-path__stage">
                    <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/check.svg" alt="" class="slds-icon slds-icon_x-small" />
                  </span>
                  <span class="slds-path__title">P1 受注戦略</span>
                </a>
              </li>

              <!-- 現在ステージ: 青塗り + 白文字 (両方クラス必須) -->
              <li class="slds-path__item slds-is-current slds-is-active" role="presentation">
                <a aria-selected="true" class="slds-path__link" href="#" role="option" tabindex="0">
                  <span class="slds-path__stage">
                    <span class="slds-assistive-text">現在のステージ:</span>
                  </span>
                  <span class="slds-path__title">P5 提案見積</span>
                </a>
              </li>

              <!-- 未完了: グレー塗り (チェックなし) -->
              <li class="slds-path__item slds-is-incomplete" role="presentation">
                <a aria-selected="false" class="slds-path__link" href="#" role="option" tabindex="-1">
                  <span class="slds-path__stage"></span>
                  <span class="slds-path__title">P6 試作</span>
                </a>
              </li>

            </ul>
          </div>
        </div>
      </div>

      <!-- 右側 action パネル: 現ステージ名 + 「現ステージとしてマーク」ボタン -->
      <div class="slds-grid slds-path__action">
        <span class="slds-path__stage-name">ステージ: P5 提案見積</span>
        <button class="slds-button slds-button_brand slds-path__mark-complete">
          <img src="https://cdn.jsdelivr.net/npm/@salesforce-ux/design-system@2.30.4/assets/icons/utility/check.svg" alt="" class="slds-button__icon slds-button__icon_left" />
          現ステージとしてマーク
        </button>
      </div>
    </div>
  </article>
</div>
```

## 状態クラス早見表

| 状態 | クラス | 見た目 | チェックマーク |
| --- | --- | --- | --- |
| 完了済み | `slds-is-complete` | 緑塗り + 白文字 | あり (`utility/check.svg`) |
| 現在ステージ | `slds-is-current slds-is-active` (**両方** 必須) | 青塗り + 白文字 + 太字 | なし (本物の SLDS は現ステージにチェックを出さない) |
| 未完了 | `slds-is-incomplete` | グレー塗り + 黒文字 | なし |
| 受注 (Closed Won) | `slds-is-won` | 緑塗り | あり |
| 失注 (Closed Lost) | `slds-is-lost` | 赤塗り | あり |

## 「現ステージ補足」を出したい場合

「P5 提案見積 / ✓ Agentforce 伴走」のようにステージ名の下に補足を出したい場合、**シェブロン内に 2 行入れず**、右側 `slds-path__action` の `slds-path__stage-name` で

```html
<span class="slds-path__stage-name">ステージ: P5 提案見積 (✓ Agentforce 伴走)</span>
```

と表示する。シェブロン内に複数行を詰めるとレイアウトが崩れる。

## 注意点

- SLDS Path は本来 JS 駆動 (`aria-selected` 切替) だが、**静的モックでは `slds-is-current slds-is-active` を li に両方付けるだけ**で見た目は OK
- 7 ステージ程度までは横スクロール無しで収まる。8 以上は `slds-path__scroller` の `overflow-x: auto` で横スクロールするので無理に詰めない
- ガイダンス領域 (`slds-path__content`) も標準で用意されている (`components/path.html` 後半参照)
