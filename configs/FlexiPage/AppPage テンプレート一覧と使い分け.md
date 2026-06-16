# AppPage テンプレート一覧と使い分け

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-04-30  
**Salesforce API**: 63  
**構成**: 状況 → 一覧 → 使い分け → 検証方法

---

## 状況

AppPage（Lightning App のホーム）を XML で再設計するとき、`<template><name>...</name></template>` に指定できる値が公式ドキュメント上も明示されておらず、推測で書くと「テンプレート XXX は存在しません」エラーで弾かれる。
過去に「1種類のみ」と記録していた知見を 2026-04-30 に再検証した結果、**合計 3 種類が使用可能**であることが判明した。

---

## 使用可能なテンプレート一覧（API 63 時点）

| テンプレート API 名 | 比率 | region1 | region2 | region3 | 用途 |
|---|---|---|---|---|---|
| `flexipage:appHomeTemplateHeaderTwoColumns` | **約 2:1** | header (全幅) | 左 main（広） | 右 sidebar（狭） | **ホーム画面の推奨デフォルト**。メインコンテンツ＋右サイドバー |
| `flexipage:appHomeTemplateHeaderTwoColumnsEqualWidth` | 1:1 | header (全幅) | 左（等幅） | 右（等幅） | 左右対比が意味を持つ画面。ダッシュボード2本の比較等 |
| `flexipage:appHomeTemplateHeaderTwoColumnsLeftSidebar` | **約 1:2** | header (全幅) | 左 sidebar（狭） | 右 main（広） | 左サイドバー + 右メイン（Right 反転パターン） |

---

## 存在しないテンプレート名（命名規則の推測は通用しない）

以下は 2026-04-30 に Dry-run で試したが全て「存在しません」エラー:

- `flexipage:appHomeTemplateDesktop`
- `flexipage:appHomeTemplateHeaderOneColumn`
- `flexipage:appHomeTemplateHeaderTwoEqualColumns`（`Equal` の位置が違うだけで NG）
- `flexipage:appHomeTemplateHeaderSidebarLeft` / `HeaderSidebarRight`
- `flexipage:appHomeTemplateThreeColumn`
- `flexipage:appHomeTemplateMainRightSidebar` / `MainLeftSidebar`
- `flexipage:appHomeTemplatePinnedHeaderTwoColumns` / `PinnedHeaderThreeColumns`
- `flexipage:appHomeTemplateHeaderLeftColumn` / `HeaderRightColumn`
- `flexipage:appHomeTemplateDashboardCentric` / `DashboardDesktop`
- `flexipage:appHomeTemplate`（接尾辞なし）

**結論**: AppPage は「ヘッダー + 2カラム」の 3 パターンしか標準提供されていない。3 カラム・1 カラム・ピン留めヘッダーなどは存在しない。

---

## 使い分けガイド

### 迷ったら `flexipage:appHomeTemplateHeaderTwoColumns`（2:1）

- メインコンテンツ（ダッシュボード群・リスト群）を左に、クイックアクション・サイド情報を右に置く構成
- 業務ワークフロー系アプリのホーム（稟議・申請・契約・保守依頼）のデフォルト推奨
- 右サイドバーが狭いので、Dashboard は置かず `flexipage:richText`（クイックアクションリンク集） + `flexipage:filterListCard`（ListView）程度に留める

### 1:1 の `HeaderTwoColumnsEqualWidth` が向くケース

- 左右で対比させたい情報がある（例: 「自部門」ダッシュボード vs 「他部門」ダッシュボード）
- 左右で情報量が同程度

### 1:2 の `HeaderTwoColumnsLeftSidebar` が向くケース

- 左に固定メニュー・ナビゲーション・フィルタ等を置き、右メインに詳細を見せたい画面
- 通常はこの配置は少ない。`HeaderTwoColumns` で右メインが必要なら画面設計を反転する選択もある

---

## region 名と配置ルール

全テンプレート共通:

- **`region1`**: ヘッダー扱い。全幅。空にしても OK（デプロイエラーにならない）
- **`region2`** と **`region3`**: 横並び固定。位置は変えられない
- 各 region 内の複数 `itemInstances` は**縦スタック**される。横並びは不可
- `region4` 以降は存在しない

ヘッダー名・サイドバー名（`header` / `leftcol` / `rightcol`）は **Record Page 用の別概念**。AppPage では通用しない（存在しない範囲エラーになる）。

---

## 2:1 以外のレイアウトが必要なとき

- **3 カラム・1 カラム・不等比 3 段等は AppPage では実現不可**
- 実現するなら **カスタムテンプレート（LWC 開発）** しかない。Lightning App Builder の「Custom」タブから .html/.js/.js-meta.xml のテンプレートコンポーネントを作成してデプロイ
- デモ構築範囲では労力に見合わないため、**標準 3 テンプレから選ぶ**のが現実解

---

## 検証方法（再現可能）

1. 最小構成の AppPage FlexiPage を作成（`region1`/`region2`/`region3` の 3 リージョンのみ、`<template><name>xxx</name></template>` を検証値に）
2. `sf project deploy start -d <path> --dry-run --concise` を検証値を変えて反復
3. `Status: Succeeded` のものが有効、`テンプレート XXX は存在しません` で Failed のものは無効
4. 本番環境・Sandbox・Scratch のいずれでも同じ結果（組織設定で増える余地はない）

---

## 関連項目

- [AppPage では Work Guide が使えない](./AppPage%20では%20Work%20Guide%20が使えない.md)
- [Record Page の Template と主要コンポーネント API 名](./Record%20Page%20の%20Template%20と主要コンポーネント%20API%20名.md)
- FlowOrchestrationDemo / `Context/Salesforce 技術情報/デモ環境構築時/UI 仕上げのパターン集.md` §17「ダッシュボードのタブ切替は原則使わない、縦並び表示が正解」
- FlowOrchestrationDemo / `Context/Salesforce 技術情報/デモ環境構築時/UI 仕上げのパターン集.md` §18「AppPage で利用可能なテンプレート一覧」

---

## 改訂履歴

- 2026-04-30: 初版作成（コーディ）。Dry-run 実測で 3 テンプレ検出。過去の「1種類のみ」という記録を訂正
