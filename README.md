# Google Slides 作成スクリプト

ClaudeからSalesforceのデモ環境を作る手順をGoogle Slidesで作成するApps Scriptです。

## 使い方

### 方法1: Google Apps Script エディタで直接実行

1. **Google Apps Script を開く**
   - https://script.google.com/ にアクセス
   - 「新しいプロジェクト」をクリック

2. **スクリプトをコピー＆ペースト**
   - `createSalesforceSlides.gs` の内容をコピー
   - エディタに貼り付け

3. **実行**
   - 関数選択で `createSalesforceSlides` を選択
   - 「実行」ボタンをクリック
   - 初回実行時は権限の承認が必要です

4. **スライドを確認**
   - 実行ログ（表示 > ログ）にURLが表示されます
   - URLをクリックして作成されたスライドを確認

### 方法2: clasp を使ってローカルから実行

```bash
# clasp をインストール
npm install -g @google/clasp

# Google アカウントでログイン
clasp login

# 新しいプロジェクトを作成
clasp create --type standalone --title "Salesforce Demo Slides Creator"

# スクリプトをプッシュ
clasp push

# ブラウザでエディタを開く
clasp open

# エディタで createSalesforceSlides 関数を実行
```

## スクリプトの機能

- Google Slides プレゼンテーションを自動作成
- タイトルスライド + 11枚のスライドを生成
- 以下の内容を含む：
  - 概要
  - 事前準備
  - Salesforce Developer Edition アカウント作成
  - Salesforce CLI のセットアップ
  - Claude Code でのスクリプト作成
  - サンプルデータの投入
  - カスタムオブジェクトの作成
  - Apex クラスの作成
  - トラブルシューティング
  - まとめ

## カスタマイズ

スクリプト内の `addSlide()` 関数を使って、簡単にスライドを追加できます：

```javascript
addSlide(presentation, 'スライドタイトル', [
  '箇条書き1',
  '箇条書き2',
  '箇条書き3'
]);
```

コードブロックを含むスライドを追加する場合：

```javascript
addCodeSlide(presentation, 'コード例', `
const demo = () => {
  console.log('Hello Salesforce!');
};
`);
```

## 必要な権限

このスクリプトは以下の権限を要求します：

- **Google Slides**: プレゼンテーションの作成と編集

## トラブルシューティング

### エラー: "Exception: Service invoked too many times in a short time"

Apps Script には実行時間の制限があります。スライド数が多すぎる場合は、分割して実行してください。

### エラー: "Authorization required"

初回実行時は、Googleアカウントへのアクセス許可が必要です。プロンプトに従って承認してください。

## 参考リンク

- [Google Apps Script 公式ドキュメント](https://developers.google.com/apps-script)
- [Slides Service リファレンス](https://developers.google.com/apps-script/reference/slides)
- [Salesforce CLI ガイド](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/)
