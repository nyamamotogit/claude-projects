---
source: FlowOrchestrationDemo プロジェクト
author: アインシュタイン
date: 2026-05-01
context: 稟議申請アプリのホームページから「アプリ名ラベル帯」を除去する作業で学んだ Salesforce 標準仕様
---

# HomePage 型 FlexiPage の正しい書式

## 状況

Lightning App の**アプリ内ホームタブ**（アプリを開いた時のランディングページ）から、AppPage タイプ特有の「アプリ名/タブ名ラベル帯」を除去したい場合、HomePage 型 FlexiPage に切り替える必要がある。この過程で、AppPage と HomePage の仕様差・メタデータ書式の違いで 3 回連続でデプロイに失敗した。

## 決定的な注意点

### 1. FlexiPage の `<type>` は変更不可（最重要）

既存の AppPage 型 FlexiPage を HomePage 型に `<type>` だけ書き換えても、デプロイすると以下のエラーが出る:

```
Lightning ページの種別は変更できません。
```

**対処**: 同じ名前で型変更はできない。旧 FlexiPage を destructiveChanges で削除 → 新名（または同名）で HomePage 型を新規作成する手順が必要。

**推奨**: 別名で作る。同名で削除→作成は中間状態リスクがある。例: `Ringi_App_Home`（AppPage）→ `Ringi_Home`（HomePage）。

### 2. HomePage 用テンプレート名は `home:` プレフィックス（`flexipage:` ではない）

AppPage は `flexipage:appHomeTemplateHeaderTwoColumns` 等だが、HomePage は**別のプレフィックス・別の命名体系**。

| 用途 | AppPage 用（誤） | HomePage 用（正） |
|---|---|---|
| シンプル1カラム | - | `home:desktopTemplate` |
| ヘッダ+3カラム | - | `home:desktopTemplateHeaderThreeColumns` |
| ヘッダ+2カラム | `flexipage:appHomeTemplateHeaderTwoColumns` | **存在しない**（`home:desktopTemplateHeaderTwoColumns` も未確認） |

**重要**: `home:desktopTemplateHeaderTwoColumns` は命名規則から存在しそうに見えるが、**組織にデプロイするとテンプレート不在エラー**が出る環境がある。デプロイ前に組織の既存 HomePage を retrieve して実在するテンプレート名を確認すること（下記「確認コマンド」参照）。

### 3. HomePage テンプレートの region 名は `top`（`region1/region2/region3` ではない）

`home:desktopTemplate` の region 名は `<name>top</name>` 固定。AppPage と同じ `region1` にすると以下のエラー:

```
Field integrity exception: flexiPageRegions (region "region1" does not exist for template "home:desktopTemplate")
```

**対処**: retrieve で正解 region 名を確認してから FlexiPage を書く。

### 4. CustomApplication `actionOverrides` でホームを割り当てる書式

アプリ既定ホームを FlexiPage に差し替える `actionOverrides` の正解書式（`SDO_TCRM_Dashboard_Magic` 等の公式サンプルアプリで確認）:

```xml
<actionOverrides>
    <actionName>Tab</actionName>                          <!-- ← View ではなく Tab -->
    <content>Ringi_Home</content>                         <!-- FlexiPage 名 -->
    <formFactor>Large</formFactor>
    <skipRecordTypeSelect>false</skipRecordTypeSelect>
    <type>Flexipage</type>
    <pageOrSobjectType>standard-home</pageOrSobjectType>  <!-- ← 小文字 home -->
</actionOverrides>
```

よくある間違い:
- `<actionName>View</actionName>` → **誤**。`Tab` が正
- `<pageOrSobjectType>standard-Home</pageOrSobjectType>`（大文字H） → **誤**。`standard-home`（小文字h）が正
- `<profileActionOverrides>` を使う必要はない（全プロファイル共通のホーム割当なら `actionOverrides` で十分）

**大文字小文字を間違えた場合のエラー**:
```
no CustomObject named standard-Home found
```
→ `standard-Home` が CustomObject として解釈されようとし、存在しないと言われる。`standard-home` に直すと通る。

### 5. CustomApplication の `<tabs>` 先頭に `standard-home` を追加

HomePage 型 FlexiPage は**カスタムタブ経由では配置できない**。`<tabs>` には標準ホームタブ `standard-home` を置き、その View を actionOverrides で FlexiPage に差し替える形を取る。

```xml
<tabs>standard-home</tabs>    <!-- 追加 -->
<tabs>Ringi__c</tabs>
<tabs>Ringi_Approver__c</tabs>
```

旧 AppPage 時代のカスタムタブ（`<tabs>Ringi_App_Home</tabs>`）は削除。そのカスタムタブ（CustomTab メタデータ + `tabs/Ringi_App_Home.tab-meta.xml` ファイル）も destructiveChanges で併せて削除する。permission set の `<tabSettings>` からも該当 tab 参照を外さないとデプロイ失敗する（存在しないタブへの権限となる）。

## 対処（正しい手順）

### ステップ 0: 組織から既存 HomePage FlexiPage を retrieve して仕様を確認

```bash
sf project retrieve start --metadata "FlexiPage" --target-org <alias> --target-metadata-dir .tmp-retrieve --unzip
grep -l "<type>HomePage</type>" .tmp-retrieve/unpackaged/unpackaged/flexipages/*.flexipage
# 見つかったファイルで <template><name>...</name></template> を確認
```

同様に既存 CustomApplication の actionOverrides 書式も確認:

```bash
sf project retrieve start --metadata "CustomApplication" --target-org <alias> --target-metadata-dir .tmp-retrieve-app --unzip
grep -B2 -A8 "actionName>Tab" .tmp-retrieve-app/unpackaged/unpackaged/applications/*.app | grep -B3 -A7 "Flexipage"
```

### ステップ 1: 新 FlexiPage 作成（HomePage 型・別名）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <flexiPageRegions>
        <name>top</name>                          <!-- region1 ではなく top -->
        <type>Region</type>
        <itemInstances>
            <!-- 配置したいコンポーネント群 -->
        </itemInstances>
    </flexiPageRegions>
    <masterLabel>稟議ホーム</masterLabel>
    <template>
        <name>home:desktopTemplate</name>         <!-- home: プレフィックス -->
    </template>
    <type>HomePage</type>
</FlexiPage>
```

### ステップ 2: CustomApplication 修正

- `<tabs>` 先頭に `<tabs>standard-home</tabs>` を追加
- `<actionOverrides>` ブロックで HomePage を `standard-home` / `actionName=Tab` に差し向ける（上記書式）
- 旧 `<tabs>旧FlexiPage名</tabs>` を削除

### ステップ 3: 旧 FlexiPage + 旧 CustomTab + permission set の参照を整理

- `tabs/<旧名>.tab-meta.xml` を物理削除
- permission set の `<tabSettings>` から該当 `<tab>` ブロックを削除
- destructiveChanges.xml に以下を追加:
  ```xml
  <types><members>旧FlexiPage名</members><name>FlexiPage</name></types>
  <types><members>旧FlexiPage名</members><name>CustomTab</name></types>
  ```

### ステップ 4: 検証 → デプロイ

```bash
# 既存の destructiveChanges.xml を巻き込まないため、一時ディレクトリで分離
mkdir -p .tmp-deploy-home
# .tmp-deploy-home/package.xml と .tmp-deploy-home/destructiveChanges.xml を作成

sf project deploy validate \
  --manifest .tmp-deploy-home/package.xml \
  --post-destructive-changes .tmp-deploy-home/destructiveChanges.xml \
  --target-org <alias> --wait 10

sf project deploy start \
  --manifest .tmp-deploy-home/package.xml \
  --post-destructive-changes .tmp-deploy-home/destructiveChanges.xml \
  --target-org <alias> --wait 10
```

### ステップ 5: 組織側で結果確認

```bash
sf data query -q "SELECT DeveloperName, Type FROM FlexiPage WHERE DeveloperName IN ('旧名','新名')" \
  --target-org <alias> --use-tooling-api
```

期待: 新名のみ Type=HomePage で返る。旧名は消えている。

## home:desktopTemplate の region 構成（2026-05-01 確定）

`home:desktopTemplate` は **4 つの region** を持つ:

- **`top`**: 上部/左大カラム（メインコンテンツ配置用）
- **`sidebar`**: 右サイドバー（補助情報・クイックアクション等）
- **`bottomLeft`**: 左下
- **`bottomRight`**: 右下

### 重要な仕様

- メタデータファイルには**使用している region だけ**が出力される。空 region はファイルに現れない
- 未使用の region を同定したければ、同じテンプレートの他 FlexiPage を retrieve して比較する必要がある
- **2カラム配置は `top`（左大）+ `sidebar`（右小）で実現できる**。`home:desktopTemplateHeaderTwoColumns` のような別テンプレートは不要
- `top` に `flexipage:tabset` を配置すると、左カラム全体がタブコンテナになり、その右に `sidebar` が並ぶレイアウトが得られる

### 配置例（2カラム）

```xml
<FlexiPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <!-- 左カラム（メイン） -->
    <flexiPageRegions>
        <name>top</name>
        <type>Region</type>
        <itemInstances>
            <componentInstance>
                <componentName>flexipage:tabset</componentName>
                <!-- タブ構成など -->
            </componentInstance>
        </itemInstances>
    </flexiPageRegions>
    <!-- 右カラム（サイドバー） -->
    <flexiPageRegions>
        <name>sidebar</name>
        <type>Region</type>
        <itemInstances>
            <!-- クイックアクション、filterListCard 等 -->
        </itemInstances>
    </flexiPageRegions>
    <template><name>home:desktopTemplate</name></template>
    <type>HomePage</type>
</FlexiPage>
```

この構成で、左メイン + 右サイドバーの 2 カラムレイアウトが成立する。

## 横展開の可能性

- **任意の Lightning App** で「アプリ名帯を消したい」要望は高頻度で発生する。AppPage を素朴に作ると必ず帯が出る仕様のため、最初から HomePage 型で組むのが筋
- **レイアウト 2 カラム要望**には注意：`home:desktopTemplateHeaderTwoColumns` がデフォルトで有効でない組織が存在する。確実に存在するテンプレートは `home:desktopTemplate`（1カラム）、`home:desktopTemplateHeaderThreeColumns`（3カラム）。2カラム要件なら**組織の既存 FlexiPage を retrieve してテンプレート実在を確認してから設計**
- **`home:desktopTemplate` だけで 2 カラム構成も可能**（`top` + `sidebar` 構成）。無理にヘッダ付きテンプレートを探す必要はない
- **destructiveChanges.xml を既存で他用途に使っている環境**では、本件デプロイ用に一時ディレクトリで分離した manifest を使うこと。デフォルト destructiveChanges を上書きすると、他タスクの削除予定が巻き込まれる事故になる
- **CustomApplication の actionOverrides 書式**は Salesforce 公式サンプルアプリ（`SDO_TCRM_Dashboard_Magic` 等）を参照するのが最速。推測で書かないこと
