# Google Slides 自動作成ガイド（日本語）

ClaudeからSalesforceのデモ環境を作る手順を、Google Slidesで自動生成するスクリプトです。

## 📁 ファイル構成

- `createSalesforceSlides.gs` - 基本版スクリプト（シンプルな12枚のスライド）
- `createSalesforceSlides_advanced.gs` - 高度版スクリプト（デザイン・レイアウトのカスタマイズ）
- `README.md` - 英語版説明書
- `USAGE_ja.md` - このファイル（日本語版説明書）

## 🚀 クイックスタート

### 方法1: Google Apps Script で直接実行（推奨）

1. **Google Apps Script を開く**
   ```
   https://script.google.com/
   ```
   「新しいプロジェクト」をクリック

2. **スクリプトをコピー**
   - 基本版: `createSalesforceSlides.gs` の内容をコピー
   - 高度版: `createSalesforceSlides_advanced.gs` の内容をコピー
   - エディタの `Code.gs` に貼り付け

3. **関数を実行**
   - 基本版の場合: `createSalesforceSlides` を選択
   - 高度版の場合: `createAdvancedSalesforceSlides` を選択
   - 「実行」ボタンをクリック

4. **初回実行時の承認**
   - 「承認が必要です」というダイアログが表示されます
   - 「権限を確認」→ Googleアカウントを選択
   - 「詳細」→「（プロジェクト名）に移動」
   - 「許可」をクリック

5. **スライドを確認**
   - 実行ログ（画面下部または「表示」→「ログ」）にURLが表示
   - URLをクリックして作成されたGoogle Slidesを開く

### 方法2: clasp でローカル開発（上級者向け）

```bash
# clasp をグローバルインストール
npm install -g @google/clasp

# Google アカウントでログイン
clasp login

# 新しいプロジェクトを作成
clasp create --type standalone --title "Salesforce Slides Creator"

# このディレクトリのスクリプトをプッシュ
clasp push

# Apps Script エディタをブラウザで開く
clasp open
```

その後、エディタで関数を実行します。

## 📊 生成されるスライドの内容

### 基本版（createSalesforceSlides.gs）

1. **タイトル**: ClaudeからSalesforceのデモ環境を作る
2. **概要**: 手順の概要と所要時間
3. **事前準備**: 必要なツールとセットアップ
4. **Step 1**: Salesforce Developer Edition アカウント作成
5. **Step 2**: Salesforce CLI のセットアップ
6. **Step 3**: Claude Code でスクリプト作成
7. **Step 4**: サンプルデータの投入
8. **Step 5**: カスタムオブジェクトの作成（オプション）
9. **Step 6**: Apex クラスの作成（オプション）
10. **トラブルシューティング**: よくある問題と解決方法
11. **まとめ**: 振り返りと次のステップ

### 高度版（createSalesforceSlides_advanced.gs）

基本版に加えて以下の機能があります：
- Salesforce ブランドカラー（#1589EE）の適用
- ステップ番号バッジ
- 2カラムレイアウト
- 背景色のカスタマイズ
- コードブロック専用スタイル
- より詳細な内容

## 🎨 カスタマイズ方法

### スライドを追加する

```javascript
// シンプルな箇条書きスライド
addSlide(presentation, 'タイトル', [
  '箇条書き1',
  '箇条書き2',
  '箇条書き3'
]);

// コードスライド
addCodeSlide(presentation, 'コード例', `
const example = () => {
  console.log('Hello!');
};
`);
```

### 色を変更する

```javascript
// テキスト色
text.getTextStyle().setForegroundColor('#FF0000'); // 赤

// 背景色
slide.getBackground().setSolidFill('#F0F0F0'); // グレー

// 図形の塗りつぶし
shape.getFill().setSolidFill('#00FF00'); // 緑
```

### フォントを変更する

```javascript
text.getTextStyle()
  .setFontFamily('Arial') // フォント名
  .setFontSize(18)         // サイズ
  .setBold(true)           // 太字
  .setItalic(true);        // イタリック
```

## ❓ トラブルシューティング

### エラー: "Exception: Service invoked too many times"

Apps Script には6分間の実行時間制限があります。スライド数が多すぎる場合は：
- スライドを分割して作成
- 不要なスライドをコメントアウト

### エラー: "Authorization required"

初回実行時に必要な承認です：
1. 「権限を確認」をクリック
2. Googleアカウントを選択
3. 警告画面で「詳細」→「プロジェクト名に移動」
4. 「許可」をクリック

### スライドが見つからない

実行ログにURLが表示されます：
1. Apps Script エディタで「表示」→「ログ」
2. または画面下部の「実行ログ」タブ
3. URLをコピーしてブラウザで開く

### 自分の Google Drive に保存されない

Apps Script で作成したスライドは自動的に「マイドライブ」に保存されます。
見つからない場合：
1. Google Drive で「最近使用したアイテム」を確認
2. または実行ログのURLから直接アクセス

## 🔗 参考リンク

### Google Apps Script 関連
- [Google Apps Script 公式ドキュメント](https://developers.google.com/apps-script)
- [Slides Service リファレンス](https://developers.google.com/apps-script/reference/slides)
- [clasp (CLI tool)](https://github.com/google/clasp)

### Salesforce 関連
- [Salesforce Developer Edition サインアップ](https://developer.salesforce.com/signup)
- [Salesforce CLI ガイド](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/)
- [jsforce (Node.js ライブラリ)](https://jsforce.github.io/)

### Claude Code 関連
- [Claude Code 公式サイト](https://claude.ai/code)
- [Claude Code ドキュメント](https://docs.anthropic.com/claude/docs/claude-code)

## 💡 Tips

1. **実行時間を短縮**: 不要なスライドはコメントアウト
2. **テンプレート化**: よく使う構成はテンプレート関数に
3. **画像追加**: `slide.insertImage(url, x, y, width, height)` で画像挿入可能
4. **表の追加**: `slide.insertTable(rows, columns)` で表を挿入
5. **動画埋め込み**: YouTube動画も `slide.insertVideo()` で埋め込み可能

## 📝 ライセンス

このスクリプトは自由に使用・改変できます。

## 🤝 サポート

問題や質問がある場合は、このプロジェクトのIssueを作成してください。
