---
title: List Editor (AppExchange版) 利用ガイド
audience: AI (Claude Sonnet等) / デモ作成者
purpose: カスタムLWCを新規開発せず、既存のListEditorコンポーネントでデモを組み立てられるようにする
last_updated: 2026-04-24 (日本語化手順を追記)
---

## 🚨 AIが最優先で守ること（作業フロー）

**AppExchangeのListEditorをFlexiPageに追加する時は、XMLを直接書いてはならない。**

UIのプロパティラベル（`Object Api Name` / `Display Fields` 等）と、FlexiPage XML上のプロパティ名（`objectName` / `fields` 等）は**別名**。推測で直接XML編集するとデプロイエラー or 誤設定になる。

### 正しい手順

1. **ユーザにUIで配置してもらう**（Lightning App Builder でコンポーネントをドラッグ＆ドロップし、保存＆有効化）
2. `sf project retrieve start --metadata FlexiPage:<ページ名>` でXML構造を取得
3. retrieveしたXMLを見て、プロパティ名とデフォルト値を確認
4. 必要に応じて値だけローカルで修正し、デプロイ

**UIを経由せずAIが単独でXMLに追加してはいけない。** プロパティ名とネームスペース表記を正確に記述する手段が他にない。

---

# List Editor 利用ガイド（AI向け）

## 最初に読むこと（判断基準）

**このコンポーネントを使うべきケース**
- Salesforceの特定オブジェクトのレコード一覧を表示・インライン編集したい
- 一覧からFlowを一括実行したい
- レコードを任意の順序で並び替えて保持したい
- **LWCを新規開発する前に、まずListEditorで要件を満たせないか確認する**

**このコンポーネントを使うべきでないケース**
- 本番運用で長期保守が必要（ノンサポート・動作無保証のため）
- 連動選択リスト・マルチ通貨・ロングテキスト・暗号化テキストを編集したい
- レコードタイプによる選択リスト表示制御が必須
- リレーション項目（親オブジェクトの項目）を一覧に表示したい

> **重要**: デモ用途であればListEditorで十分対応可能。新規LWC開発は最終手段とすること。

---

## 前提条件

| 項目 | 内容 |
|---|---|
| Edition | Enterprise Edition 以上 |
| 入手方法 | AppExchange から無償インストール |
| サポート | **ノンサポート**（Salesforce公式製品ではない） |
| 設置可能ページ | Lightning App ビルダー / コミュニティビルダー |

**AppExchangeリスティング**
`https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3u00000PFXi6EAH&tab=e`

---

## インストール手順

1. 上記AppExchangeリスティングから「Get It Now」
2. インストール先組織を選択（**Sandbox または Developer Edition で先に検証すること**）
3. 権限は「すべてのユーザーのインストール」を選択
4. インストール完了後、Lightningページビルダーから配置可能になる

---

## コンポーネント配置手順

1. 設定対象ページを Lightning App ビルダー で開く
2. 左ペインから「List Editor」コンポーネントをドラッグ&ドロップ
3. 右ペインで設定項目を入力（下記リファレンス参照）
4. 保存 & 有効化

---

## 設定項目リファレンス

### 必須項目

| UI上のプロパティ名 | FlexiPage XML上の name | 説明 | 例 |
|---|---|---|---|
| `Object Api Name` | `objectName` | 表示対象オブジェクトのAPI名（単一のみ） | `Opportunity` / `OpptyAlloc__c` |
| `Display Fields` | `fields` | 表示する項目のAPI名（カンマ区切り、**リレーション不可**） | `Name,Amount,CloseDate,StageName` |

> ⚠️ **API名は1文字でも違うとエラー**。コピー&ペーストで入力すること。

### 並び替え・絞り込み

| UI上のプロパティ名 | FlexiPage XML上の name | 説明 | 例 |
|---|---|---|---|
| `Default order field` | `orderField` | デフォルトソート項目 | `LastModifiedDate` / `LE_Order__c` |
| `Descending order` | `isOrderDESC` | 降順ソートか | `true` / `false` |
| `Number of lines to display` | `viewRowsToLoad` | 1回の表示行数（「さらに読み込む」の単位） | `20` |
| `Parent reference field name (optional)` | `parentField` | 同一オブジェクトへの参照項目（ツリー表示用） | `ParentId` |
| `List filter (SOQL filter)` | `conditionsFilterList` | SOQLのWHERE句形式でフィルタ。**レコードページでは未設定で親レコードに自動絞り込みされる**（主従/参照で親子関係がある場合） | `StageName != 'Closed Lost'` |
| `Default value for each field (json format)` | `defaultValueAddList` | 新規行作成時のデフォルト値（JSON） | `{"LastName":"ABC","Country__c":"Vietnam"}` |

### 表示・ラベル

| UI上のプロパティ名 | FlexiPage XML上の name | 説明 |
|---|---|---|
| `List Label Name` | `defaultLabel` | コンポーネントタイトル |
| `Flow Name` | `flowName` | 実行可能Salesforce FlowのAPI名（カンマ区切りで複数可） |

### UI制御（非表示切替）

| UI上のプロパティ名 | FlexiPage XML上の name | 効果 |
|---|---|---|
| `Do not allow editing` | `enableEditMode` | `true`で編集ボタン非表示（※名前に反して、`true`=非表示の挙動） |
| `Do not allow new creation` | `enableAddMode` | `true`で新規ボタン非表示 |
| `Do not allow reload` | `enableRefresh` | `true`でリロードボタン非表示 |
| `Do not allow text search` | `enableSearchArea` | `true`で検索エリア非表示 |
| `Do not allow record actions` | `enableRecordAction` | `true`でレコードアクション項目非表示 |
| `Do not allow deletion on the edit` | `enableDltBtnInEdit` | `true`で編集画面の削除ボタン非表示 |

> ⚠️ `enable*`系プロパティは「無効化フラグ」として機能する。UI上のラベル「Do not allow …」に対応するため、`true`で機能OFF。直感と逆なので注意。

### スタイリング

| UI上のプロパティ名 | FlexiPage XML上の name | 説明 |
|---|---|---|
| `Heading Background color` | `brandBgColor` | ヘッダー背景色 |
| `Heading text color` | `brandTxtColor` | タイトルテキスト色 |
| `Even row background color` | `brandRowColor` | 偶数行背景色 |
| `Icon color` | `iconFillColor` | アイコン色 |
| `Icon background color` | `iconBgColor` | アイコン背景色 |
| `Image max height` | `imageMaxHeight` | 数式内画像の最大高さ（例: `100px` / `100%`） |
| `Image max width` | `imageMaxWidth` | 数式内画像の最大幅 |
| `Image min height` | `imageMinHeight` | 数式内画像の最小高さ |
| `Image min width` | `imageMinWidth` | 数式内画像の最小幅 |

### FlexiPage XML 参照情報

| 項目 | 値 |
|---|---|
| `componentName` | `listedit:CommList_ListEditorCmp` |
| ネームスペースプレフィックス | `listedit` |

### FlexiPage XML サンプル（商談レコードページのチームタブ内に商談按分を配置した例）

```xml
<itemInstances>
    <componentInstance>
        <componentInstanceProperties>
            <name>defaultLabel</name>
            <value>商談按分 (ListEditor)</value>
        </componentInstanceProperties>
        <componentInstanceProperties>
            <name>defaultValueAddList</name>
            <value>{}</value>
        </componentInstanceProperties>
        <componentInstanceProperties>
            <name>fields</name>
            <value>Name,User__c,Percent__c,SplitAmount__c,WeightedSplitAmount__c,IsPrimary__c</value>
        </componentInstanceProperties>
        <componentInstanceProperties>
            <name>isOrderDESC</name>
            <value>true</value>
        </componentInstanceProperties>
        <componentInstanceProperties>
            <name>objectName</name>
            <value>OpptyAlloc__c</value>
        </componentInstanceProperties>
        <componentInstanceProperties>
            <name>orderField</name>
            <value>Name</value>
        </componentInstanceProperties>
        <componentInstanceProperties>
            <name>viewRowsToLoad</name>
            <value>10</value>
        </componentInstanceProperties>
        <!-- 他の未設定プロパティは <name>のみで値なし -->
        <componentName>listedit:CommList_ListEditorCmp</componentName>
        <identifier>listedit_CommList_ListEditorCmp</identifier>
    </componentInstance>
</itemInstances>
```

> 💡 **レコードページで親レコード絞り込み**: 対象オブジェクトに主従関係/参照関係で親オブジェクトへの項目がある場合、`conditionsFilterList`（List filter）は未設定でOK。ListEditorが自動的に現レコードに紐づく子レコードのみ表示する。

---

## 典型的な使用パターン

### パターン1: 商談一覧をインライン編集

```
Object Api Name: Opportunity
Display Fields: Name,Amount,CloseDate,StageName
Default order field: CloseDate
Descending order: false
Number of lines to display: 20
List filter (SOQL filter): StageName != 'Closed Lost' AND StageName != 'Closed Won'
List Label Name: 進行中の商談
```

### パターン2: 取引先責任者の新規登録デフォルト付き

```
Object Api Name: Contact
Display Fields: LastName,FirstName,Email,Phone
Default value for each field: {"MailingCountry":"Japan","LeadSource":"Web"}
List Label Name: 取引先責任者
```

### パターン3: Flow連携で一括処理

```
Object Api Name: Case
Display Fields: CaseNumber,Subject,Status,Priority
Flow Name: Bulk_Close_Cases,Escalate_Cases
List Label Name: ケース管理
```

→ 各行にチェックボックスが追加され、選択行をFlowに一括渡しできる。

### パターン4: 任意順の並び替え

**事前準備**: 対象オブジェクトに `LE_Order__c`（数値型）項目を作成

```
Object Api Name: Custom_Task__c
Display Fields: Name,Status__c,Assignee__c
Default order field: LE_Order__c
Descending order: false
List Label Name: タスク順序
```

→ Edit画面の左アイコンをドラッグ&ドロップで並び替え、保存時に `LE_Order__c` が自動更新される。

---

## Flow連携の設定（詳細）

### Flow側の準備

1. 画面フロー または 自動起動フロー を作成
2. マネージャーセクションで**変数**を作成：
   - **API名**: `Objects`（固定）
   - **データタイプ**: レコード（複数の値を許可）
   - **オブジェクト**: ListEditorの `Object Api Name` と同じものを指定
   - **入力を許可**: ✅ チェック

3. Flow内で `Objects` コレクションをLoop等で処理

### コンポーネント側の設定

- `Flow Name` にFlowのAPI名をカンマ区切りで入力
- 設定後、コンポーネント各行にチェックボックスが出現
- フロー実行アイコンクリック → 選択レコードがFlowに渡される

---

## 多言語対応（日本語化）

ListEditorはインストール時点では全ラベルが英語（`Bulk Edit` / `Save` / `Cancel` 等）。Salesforceの**カスタム表示ラベル（CustomLabel）** のローカル翻訳機能を使って日本語に差し替える。

### 前提

- 設定 > ユーザーインターフェース > **翻訳設定（Translation Workbench）** を有効化
- 対象言語（日本語）が翻訳言語として追加されていること

### UI手順（少量の場合）

1. 設定 > **カスタム表示ラベル** を開く
2. カテゴリ（ネームスペース）で `listedit` を絞り込み
3. 対象ラベル（例: `CommList_BulkEdit`）の「ローカル翻訳／上書き」→ 新規 → 言語=日本語 → 翻訳テキストに「一括編集」を入力 → 保存
4. UIでListEditorを開き直して反映確認

### SFDX手順（推奨／一括）

2026-04-24時点の本組織（af-trial）で実施済み。`force-app/main/default/translations/ja.translation-meta.xml` に `<customLabels>` ブロックとして翻訳を記述してデプロイする。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Translations xmlns="http://soap.sforce.com/2006/04/metadata">
    <customLabels>
        <label>一括編集</label>
        <name>listedit__CommList_BulkEdit</name>
    </customLabels>
    <customLabels>
        <label>保存</label>
        <name>listedit__CommList_SaveButton</name>
    </customLabels>
    <!-- ... 以下同様 ... -->
</Translations>
```

デプロイ:

```bash
sf project deploy start --source-dir force-app/main/default/translations --target-org <alias>
```

> ℹ️ `<name>` は **ネームスペース付きフルネーム**（`listedit__CommList_XXX`）。プレフィックスなしだとデプロイは通るが紐づかない。

### ListEditorの翻訳可能ラベル一覧（listeditネームスペース / 34件）

| ラベルAPI名 | 英語原文 | 推奨日本語訳 |
|---|---|---|
| `CommList_BulkEdit` | Bulk Edit | 一括編集 |
| `CommList_SaveButton` | Save | 保存 |
| `CommList_CancelButton` | Cancel | キャンセル |
| `CommList_CloseButton` | Close | 閉じる |
| `CommList_NewButton` / `CommList_New` | New | 新規 |
| `CommList_NextButton` | Next | 次へ |
| `CommList_DeleteButton` | Delete | 削除 |
| `CommList_Delete` | Delete {0} | {0} を削除 |
| `CommList_DeleteConfirm` | Do you want to delete {0}? | {0} を削除しますか？ |
| `CommList_DeleteRow` | Delete this row | この行を削除 |
| `CommList_CopyRow` | Copy this row | この行をコピー |
| `CommList_SortButton` | Sort | 並び替え |
| `CommList_LoadMore` | Load More | さらに読み込む |
| `CommList_TextMode` | Text Mode | テキストモード |
| `CommList_YesLabel` | Yes | はい |
| `CommList_NoLabel` | No | いいえ |
| `CommList_NoRecordFound` | There is no record to display | 表示するレコードがありません |
| `CommList_ToDetailPage` | Go to detail page | 詳細ページへ |
| `CommList_SelectRecordType` | Select record type | レコードタイプを選択 |
| `CommList_ParentRelationshipName` | parent reference field name | 親参照項目名 |
| `CommList_ConfirmClose` | Is it OK to close the edited data without saving? | 保存せずに編集中のデータを閉じてもよろしいですか？ |
| `CommList_ConfirmLoad` | Is it OK that new records have not been saved will be deleted? | 保存されていない新規レコードは削除されます。よろしいですか？ |
| `CommList_ConfirmSort` | Sorting will clear the changed data. Is it OK? | 並び替えを行うと変更内容が破棄されます。よろしいですか？ |
| `CommList_SaveSuccess` | {0} has been saved. | {0} を保存しました。 |
| `CommList_SaveError` | Some data could not be saved... | エラーのため一部データを保存できませんでした。各行の右側のエラー内容をご確認ください。 |
| `CommList_SearchHelp` | Please enter at least two characters. | 2文字以上入力してください。 |
| `CommList_InputEmailHelp` | Please enter it in the form of an email address. | メールアドレス形式で入力してください。 |
| `CommList_InputPhoneHelp` | Please enter in the form of a phone number. | 電話番号形式で入力してください。 |
| `CommList_InputUrlHelp` | Please enter in URL format. | URL形式で入力してください。 |
| `CommList_ExceptionGetRecord` | An exception occurred while retrieving a record... | レコード取得中に例外が発生しました。アプリケーションビルダーで表示項目設定やフィルター設定が正しいかご確認ください。 |
| `CommList_RelatedListEditorCCCreateError` | You do not have permission to create... | このオブジェクトのレコードを作成する権限がありません。 |
| `CommList_RelatedListEditorCCUpdateError` | You do not have permission to update... | このレコードを更新する権限がありません。 |
| `CommList_RelatedListEditorCCDeleteError` | Unable to delete this record. | このレコードを削除できません。 |

### 対象ラベル一覧の取得方法（他組織で流用する場合）

```bash
# ラベルAPI名の一覧
sf org list metadata --metadata-type CustomLabel --target-org <alias> --json \
  | jq -r '.result[] | select(.namespacePrefix=="listedit") | .fullName' | sort

# 英語原文（マスター値）の確認 ※ Tooling API
sf data query --use-tooling-api --target-org <alias> \
  --query "SELECT Name, Value FROM ExternalString WHERE NamespacePrefix = 'listedit'"
```

> 📝 **Tooling APIの ExternalString.Value はマスター値のみ**。ローカル翻訳は別オブジェクト（CustomLabel Translation）に保存されるため、CLIで反映確認したい場合はUIか翻訳メタデータのretrieveで見る。

### 翻訳対象外

- Lightning App ビルダーで入力した設定値（`List Label Name`、`defaultLabel` 等）は翻訳対象外 → 日本語で直接入力する
- コンポーネント内部のハードコード文字列があれば翻訳不可（ListEditorは全て CustomLabel 経由なので現状は問題なし）

### トラブルシュート

| 症状 | 原因 | 対処 |
|---|---|---|
| デプロイは成功したが画面が英語のまま | ユーザーの言語設定が日本語でない | ユーザー設定 > 言語を「日本語」に |
| デプロイ時に `Translation Workbench is not enabled` | 翻訳設定未有効化 | 設定 > 翻訳設定 で有効化 |
| `<name>` がプレフィックスなしだと無視される | 管理パッケージ由来ラベルは fullName が必要 | `listedit__CommList_XXX` 形式で記述 |
| 画面の一部だけ英語のまま | 未翻訳ラベルが残っている | `ExternalString` を全件取得して網羅確認 |

---

## 動作確認済み / 未対応まとめ

### 動作確認済みデータ型
主従関係, 参照関係, URL, チェックボックス, テキスト, テキストエリア, パーセント, メール, 時間, 数値, 選択リスト, 選択リスト(複数選択), 通貨, 電話, 日付, 日付/時間

### 制限あり / 未対応
| データ型 | 状態 |
|---|---|
| 連動選択リスト | 表示のみ・編集不可 |
| マルチ通貨 | 未対応（主通貨と数値が一致しない事象あり） |
| ロングテキスト / リッチテキスト / 暗号化テキスト | 未検証 |
| 積み上げ集計 / 自動採番 | 未検証 |
| レコードタイプ | 表示は可能だが編集はReadOnly（新規時はプロファイルデフォルト） |

### 動作確認済みオブジェクト
取引先, 取引先責任者, 商談, キャンペーン, ケース, リード, カスタムオブジェクト

### 動作しない特殊項目（例）
- キャンペーンメンバーの `LeadOrContactId`
- 活動の多態的リレーション `WhoId` / `WhatId`

---

## その他の制限・注意事項

- Mobileサイズではテーブル見出しクリックによるソート不可
- Mobileサイズでは偶数行背景色が適用されない
- アクセス権限はユーザー権限に従うが、**レコードタイプによるアクセス制御は未対応**（全選択値が表示される）
- レコードタイプによる選択リストの表示制御はできない
- 行コピーは「表示項目に指定した項目のみ」コピー（レコード全体のコピーではない）

---

## AIが実装判断する際のチェックリスト

ユーザーから「オブジェクトの一覧編集UIを作りたい」と依頼された場合の判断フロー：

1. ✅ **Enterprise Edition以上か** → No なら別手段
2. ✅ **対象オブジェクトは動作確認済みか** → カスタムオブジェクトでもOK、ただし特殊標準項目は回避
3. ✅ **必要な項目のデータ型は対応しているか** → 連動選択リスト編集やマルチ通貨が必須なら不可
4. ✅ **レコードタイプ制御が必須でないか** → 必須なら不可
5. ✅ **本番運用でなくデモ/検証用途か** → Yes ならListEditor推奨
6. ✅ **リレーション項目表示が必須でないか** → 必須なら標準Related Listやカスタム検討

**上記をすべてクリアすればListEditorで実装可能。新規LWC開発より優先すること。**

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| コンポーネントがエラーになる | API名の誤記（1文字でも違うとNG） | オブジェクトマネージャからコピー&ペースト |
| 項目が表示されない | ユーザー権限不足 / リレーション項目指定 | FLSを確認、リレーションは直接指定不可 |
| 選択リストに想定外の値が出る | レコードタイプ制御は非対応 | 仕様、回避策なし |
| 並び替えが保存されない | `LE_Order__c` 未作成 / API名ミス | 数値型の `LE_Order__c` を作成 |
| Flowに値が渡らない | 変数API名が `Objects` でない / オブジェクト不一致 | Flow変数を仕様通りに作成 |
| マルチ通貨で金額がずれる | 未対応 | 標準機能で対応 |
| FlexiPageデプロイでListEditorが反映されない / 既存UI変更が消えた | ローカルXMLが古い状態で上書きデプロイした | **デプロイ前に必ず `sf project retrieve start --metadata FlexiPage:<名前>` で最新化してからデプロイ** |

---

## ⚠️ 運用上の重大な注意

### FlexiPageデプロイ時の事故防止

UIで編集可能なメタデータ（FlexiPage、Layout等）は、**UIで変更 → ローカルのXMLが古い状態のままデプロイ → UI変更が完全に消える** という事故が発生しやすい。

**必須手順**:

1. ListEditor（や他コンポーネント）をFlexiPageに追加/変更する前に必ず:
   ```bash
   sf project retrieve start --metadata FlexiPage:<FlexiPage名>
   ```
2. retrieveで最新化してから、ローカルで編集 → デプロイ
3. デプロイ後、Lightning App Builder側で意図した状態になっているか目視確認

**事故発生時の復旧**:
- Salesforce Setup → デプロイステータス → 該当Deploy IDで**クイックロールバック**（ただし組織設定次第で使えない）
- Lightning App Builderの**ページバージョン履歴**（存在すれば）
- 上記が使えない場合、UIで再作業するしかない（最悪のケース）

過去の事故例: 2026-04-24 に古いローカルXMLでデプロイ → UIで作成していたタブ構成が消失 → 手作業で再構築

---

## 参考リンク

- AppExchange: https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3u00000PFXi6EAH&tab=e
- Qiita紹介記事: https://qiita.com/Takaa/items/675bbd8317dcecb74c70
- 原文ドキュメント: `Salesforce 技術情報/List Editor 設定方法`
