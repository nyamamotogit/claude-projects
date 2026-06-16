# Kanban (商談ボード) の正しい書き方

商談リストビューの「カンバン」表示や、ケース・リードのステージ別ボードを作るときは、`templates/kanban.html` をベースに **以下の構造を必ず守る**。雛形をそのまま使うと「本物っぽい」見た目になるが、自己流に簡略化すると「単なる色分けタブ」「ホワイトボード風スタンプ」のような偽物に見えるので注意。

## 絶対やらないこと

- ❌ **現ステージのカラムを橙枠で強調** する → 本物 Kanban は通常ステージのカラム背景を変えない。色が付くのは **Closed Won (薄緑) と Closed Lost (薄赤)** だけ
- ❌ **ビュー切替をテキストボタン**(`[テーブル][カンバン][新規商談]`)で作る → 本物は **アイコン 3 つの toggle group**(table / kanban / side_list)で、現ビューだけ青背景になる
- ❌ **カードに商談名と金額だけ**入れる → 本物は最低でも「商談名 / 金額 / 完了予定日 / 取引先 / 所有者アバター / ⋮メニュー」の 6 要素が入る。ここを削るとボードが「付箋ベタ貼り」感になる
- ❌ **カラムヘッダーを 1 行**で済ませる → 本物は「ステージ名 (件数)」+「商品合計金額(大)」の 2 行構成で、合計金額が**主役の文字サイズ**

## 必ずやること

1. **リストビュー風ヘッダー** を `slds-page-header_object-home` で組む。タイトル「最近参照したデータ ▾ ☆」、下に「N 件 ・ 並び替え順 ・ N 分前に更新 ・ フィルタリング条件」のメタ行
2. **アクション群はすべて右上** に集める: `[新規][インポート][変更所有者]` テキストボタン + `[chart][filterList][refresh][edit][down]` アイコンボタン + **アイコン 3 つの toggle group**(`table.svg` / `kanban.svg` / `side_list.svg`)。toggle の現ビューに `is-active` を付け薄青背景にする
3. **カラムヘッダーは 2 行**: 上 `0.8125rem 太字` で「ステージ名 (件数)」、下 `1.125rem 太字` で「¥XX,XXX,XXX」
4. **カード DOM**:
   ```html
   <article class="sf-kanban-card">
     <header class="sf-kc-head">
       <a href="#" class="sf-kc-title">商談名</a>
       <button class="sf-kc-menu"><img src=".../utility/threedots_vertical.svg" alt=""></button>
     </header>
     <dl class="sf-kc-fields">
       <dt>金額</dt><dd class="amount">¥12,000,000</dd>
       <dt>完了予定日</dt><dd>2026/06/30</dd>
       <dt>取引先</dt><dd><a href="#">株式会社 テスト商事</a></dd>
     </dl>
     <footer class="sf-kc-foot">
       <span class="slds-avatar slds-avatar_circle slds-avatar_x-small"><img src="..." alt=""></span>
       <span class="sf-kc-alert"><img src=".../utility/warning.svg" alt=""></span>
     </footer>
   </article>
   ```
   - タイトルは青リンク (`#0070d2`) + 太字、`slds-truncate` は付けない
   - フィールドは `<dl>` の 2 列グリッド (`grid-template-columns: 5rem 1fr`)、`<dt>` 灰色 / `<dd>` 黒
   - `.sf-kc-alert` は **完了予定日が近い等の警告マーク**(黄色)。該当カードのみ
5. **空カラムは破線プレースホルダ** (`.sf-kanban-empty`) で「このステージに商談はありません」を中央寄せ
6. **各カラム下部にサマリ** (`.sf-kanban-summary`): 「N 件 · 合計 ¥X,XXX,XXX」を小さく
7. **Won/Lost カラムだけ色付け**: `sf-kanban-col-won` (薄緑 `#defbe9` + 緑 3px トップボーダー) / `sf-kanban-col-lost` (薄赤 `#feded2` + 赤 3px トップボーダー)。ステージ名と件数も対応色 (`#04844b` / `#ba0517`)
8. **商談標準ステージは 7 列** が目安: 資格確認 / ニーズ分析 / 価値提案 / 意思決定者特定 / 提案/見積 / 交渉/レビュー / 受注。横スクロール (`overflow-x: auto`) を許容して **無理に圧縮しない**

## 余白・寸法の目安（本物に近い値）

| 項目 | 値 |
| --- | --- |
| カラム幅 | `flex: 0 0 16rem` |
| カラム間 gap | `0.5rem` |
| カラム背景 (通常) | `#f3f3f3` |
| カードの影 | `box-shadow: 0 1px 0 rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)` |
| カード padding | `0.625rem 0.75rem` |
| カード間 gap | `0.5rem` |
