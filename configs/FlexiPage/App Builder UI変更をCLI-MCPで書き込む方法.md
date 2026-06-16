# App Builder UI 変更を CLI/MCP で書き込む方法

**取得元プロジェクト**: FlowOrchestrationDemo / 2026-05-11  
**Salesforce API**: 63  
**構成**: 状況 → 注意点 → 対処

---

## 状況

Lightning App Builder (FlexiPage) でコンポーネントのプロパティを UI で設定した後、
同じ設定を XML で再現・管理したい。
特に `lst:dynamicRelatedList` の `adminFilters` プロパティ設定でこの手順を活用した。

---

## 注意点

- FlexiPage XML の `<properties>` 構造は推測で組むとデプロイエラーになりやすい
- `adminFilters` は**静的な値のみ**サポート。`$User.Id` や `{!$User.Id}` 等の動的ユーザー参照は**機能しない**（リテラル文字列として評価される）
- `filterCriterias` プロパティは存在しない（deploy 時に「Invalid property」エラーになる）
- deploy は組織の `git reset --hard` と同じ。最終コミット/デプロイから 2 時間以上経過したファイルは必ず組織最新を取得してから編集・deploy する

---

## 対処

**UI で設定 → retrieve で取得 → XML 確認・編集 → deploy が最短確実。**

---

## 基本ワークフロー

```
1. Lightning App Builder でコンポーネントを設定・保存
2. sf project retrieve start --metadata FlexiPage:ページ名  でローカルに取得
3. 取得した XML の <componentInstance> 内の <properties> 構造を確認
4. 必要に応じて XML を直接編集
5. sf project deploy start --metadata FlexiPage:ページ名  で組織に反映
```

---

## retrieve / deploy コマンド

```bash
# 取得（組織エイリアス指定）
sf project retrieve start --metadata FlexiPage:ページ名 -o floworc-demo

# デプロイ
sf project deploy start --metadata FlexiPage:ページ名 -o floworc-demo

# ページ名が不明な場合はリスト取得
sf project retrieve start --metadata FlexiPage -o floworc-demo
```

**ページ名** = FlexiPage XML ファイルのベース名（拡張子 `.flexipage-meta.xml` を除いた部分）  
例: `Ringi__c-稟議レコードページ.flexipage-meta.xml` → `Ringi__c-稟議レコードページ`

---

## lst:dynamicRelatedList の adminFilters

### プロパティ構造（XML）

```xml
<componentInstances>
    <componentName>lst:dynamicRelatedList</componentName>
    <identifier>dynamicRelatedList_1</identifier>
    <componentInstanceProperties>
        <name>relatedListId</name>
        <value>Ringi_Approver__c</value>
    </componentInstanceProperties>
    <componentInstanceProperties>
        <name>adminFilters</name>
        <value>User__c|EQUALS|005Ic000000LKN5IAO</value>
    </componentInstanceProperties>
</componentInstances>
```

### adminFilters の値フォーマット

```
フィールドApiName|オペレータ|値
```

- **区切り文字**: パイプ `|`
- **複数条件**: 改行区切り（条件を複数行で記述）

### オペレータ一覧

| オペレータ | 説明 |
|---|---|
| `EQUALS` | 等しい |
| `NOT_EQUAL` | 等しくない |
| `GREATER_THAN` | より大きい |
| `LESS_THAN` | より小さい |
| `CONTAINS` | 含む |
| `STARTS_WITH` | から始まる |

### 設定例

```
# 特定ユーザーでフィルタ（静的）
User__c|EQUALS|005Ic000000LKN5IAO

# 特定ステータスでフィルタ
Status__c|EQUALS|Pending

# テキスト部分一致
Subject__c|CONTAINS|承認
```

---

## 動的ユーザーフィルタが必要な場合

`adminFilters` は静的値のみのため、**ログインユーザー自身のレコードだけ表示**したい場合はカスタム LWC が必要。

```
代替アプローチ:
- カスタム LWC で getRelatedListRecords (LDS) または SOQL を使い
  $User.Id を Apex/Wire で取得してフィルタリング
- FlexiPage には動的フィルタを持つカスタムコンポーネントを配置する
```

---

## UI 設定値を XML で確認する手順

1. App Builder でコンポーネントを設定・**保存**（Activate は不要）
2. retrieve でローカルに取得
3. `.flexipage-meta.xml` を開き、対象コンポーネントの `<componentInstanceProperties>` を確認
4. プロパティ名・値フォーマットを把握してから他 FlexiPage に横展開

---

## 関連項目

- [Record Page の Template と主要コンポーネント API 名](./Record%20Page%20の%20Template%20と主要コンポーネント%20API%20名.md)
- [FlexiPage を Default Record Page に割当てる XML](./FlexiPage%20を%20Default%20Record%20Page%20に割当てる%20XML.md)

---

## 数式チェックボックス項目を使った動的ユーザーフィルター（2026-05-11 確認）

### 問題
`lst:dynamicRelatedList` の `adminFilters` は **静的な値のみ** サポート。
`$User.Id` や `{!$User.Id}` を直接指定しても動作しない（リテラル文字列として評価される）。

### 解決策
対象オブジェクトに **数式チェックボックス項目** を追加し、その項目でフィルターする。

**1. 数式項目を作成（例: Ringi_Approver__c に Is_Mine__c）**

```xml
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>Is_Mine__c</fullName>
    <formula>User__c = $User.Id</formula>
    <formulaTreatBlanksAs>BlankAsZero</formulaTreatBlanksAs>
    <label>自分のレコード</label>
    <trackHistory>false</trackHistory>
    <type>Checkbox</type>
</CustomField>
```

- `$User.Id` は **数式内では動作する**（ランタイムにログインユーザーIDで評価される）
- 数式チェックボックスなので FLS は `editable=false / readable=true`

**2. adminFilters に静的値として指定**

```xml
<componentInstanceProperties>
    <name>adminFilters</name>
    <valueList>
        <valueListItems>
            <value>Is_Mine__c|EQUALS|true</value>
        </valueListItems>
    </valueList>
</componentInstanceProperties>
```

- `true` は小文字（Salesforceメタデータのブール値は小文字）
- この項目は `relatedListFieldAliases`（表示列）には含めない（フィルター専用）

### 適用パターン
- ログインユーザーの子レコードだけを動的関連リストで絞り込みたい場合
- `lst:dynamicRelatedList` の adminFilters 動的参照制約の回避策として汎用的に使える
- 同様の手法で「自分が作成したレコード」`CreatedById = $User.Id` 等にも応用可能

---

## lst:dynamicRelatedList の表示タイトル（relatedListLabel）変更方法（2026-05-12 確認）

### 問題
`lst:dynamicRelatedList` コンポーネントの表示タイトルを XML から変更しようとしたが、変更が反映されなかった。

### 原因
`relatedListLabel` という `componentInstanceProperty` が実際には `componentInstanceProperties` ブロックとして記述される必要があるが、構造の推測誤りでプロパティ名が合っていなかった。

### 解決策
**UI で設定 → retrieve で確認 → XML を直接編集 → deploy**が確実。

```xml
<!-- FlexiPage XML 内の対象コンポーネントブロック -->
<componentInstanceProperties>
    <name>relatedListLabel</name>
    <value>私の承認フェーズ</value>
</componentInstanceProperties>
```

- `<name>relatedListLabel</name>` → プロパティ名（固定）
- `<value>任意のタイトル</value>` → 表示したい文字列

### 手順
1. App Builder でタイトルを設定・保存
2. `sf project retrieve start --metadata FlexiPage:ページ名 -o floworc-demo` で取得
3. `.flexipage-meta.xml` を開いて `relatedListLabel` の `<value>` を確認
4. 以降は XML を直接編集 → deploy で OK

### 重要ルール
- **変更したら必ず retrieve してローカルと組織を同期すること**
- App Builder で UI 変更した後に retrieve せずにデプロイすると、UI での変更が上書きされる
- `relatedListLabel` は `adminFilters` 同様、`componentInstanceProperties` ブロックとして記述する

---

## LWC デプロイ後にブラウザへ最新版が反映されないとき（2026-05-12 確認）

### 現象
`sf project deploy start` が Succeeded になっても、ブラウザで確認すると古いバンドルが表示され続けることがある。

### 原因
Salesforce サーバー側の LWC コンパイル済みバンドルキャッシュが残っているため。ブラウザのキャッシュではなくサーバー側の問題。

### 解決策
**Lightning App Builder でページを開き、何も変えずに「保存」をクリックする**（または保存と同時にページを編集）。これで Salesforce がページのコンポーネントバンドルを再コンパイルし、最新版が配信されるようになることがある。

### 手順
1. Setup → Lightning App Builder → 対象ページを開く
2. キャンバス上で任意のコンポーネントを軽く移動するなど微小変更し「保存」
3. ブラウザを再読み込みして確認

### 注意
- この現象は常に起きるわけではない（「最新化されることがある」程度）
- Playwright を使った自動テストでも同様にキャッシュが残るため、App Builder 保存後に再度スクリーンショットを取る
- retrieve で組織の最新状態を取得してもローカルが古いバージョンに上書きされる場合があるため注意
