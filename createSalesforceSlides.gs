/**
 * ClaudeからSalesforceのデモ環境を作る手順スライドを作成
 * Google Apps Script で実行
 */

function createSalesforceSlides() {
  // 新しいプレゼンテーションを作成
  const presentation = SlidesApp.create('ClaudeからSalesforceのデモ環境を作る');
  const presentationId = presentation.getId();

  // スライドを追加していく
  const slides = presentation.getSlides();

  // 最初のスライド（タイトルスライド）を取得
  const titleSlide = slides[0];
  const titleShapes = titleSlide.getShapes();
  titleShapes[0].getText().setText('ClaudeからSalesforceのデモ環境を作る');
  titleShapes[1].getText().setText('Claude Code を使った自動化手順');

  // スライド2: 概要
  addSlide(presentation, '概要', [
    '本手順では、Claude Code を使用してSalesforceのデモ環境を構築します',
    '対象環境: Salesforce Developer Edition',
    '所要時間: 約10-15分',
    '必要なもの: Claude Codeアクセス権、メールアドレス'
  ]);

  // スライド3: 事前準備
  addSlide(presentation, '事前準備', [
    '1. Claude Code のセットアップ',
    '2. 必要なパッケージのインストール',
    '   - Node.js / Python 環境',
    '   - Salesforce CLI (sfdx)',
    '3. 使用するAPIキーの確認'
  ]);

  // スライド4: Step 1 - Salesforce Developer Editionアカウント作成
  addSlide(presentation, 'Step 1: Developer Editionアカウント作成', [
    '1. https://developer.salesforce.com/signup にアクセス',
    '2. 必要情報を入力:',
    '   - 名前、メールアドレス',
    '   - ユーザー名（メールアドレス形式）',
    '   - 会社名、役割',
    '3. 確認メールから認証',
    '4. パスワードを設定'
  ]);

  // スライド5: Step 2 - Salesforce CLI のセットアップ
  addSlide(presentation, 'Step 2: Salesforce CLI のセットアップ', [
    '1. Salesforce CLI をインストール',
    '   npm install -g @salesforce/cli',
    '2. 認証を実行',
    '   sf org login web -a myDevOrg',
    '3. 接続確認',
    '   sf org display -o myDevOrg'
  ]);

  // スライド6: Step 3 - Claude Code でスクリプト作成
  addSlide(presentation, 'Step 3: Claude Code でスクリプト作成', [
    '1. Claude Code を起動',
    '2. プロンプト例:',
    '   "Salesforceのデモ環境にサンプルデータを投入する',
    '    スクリプトを作成してください"',
    '3. 生成されたスクリプトを確認',
    '4. 必要に応じてカスタマイズ'
  ]);

  // スライド7: Step 4 - サンプルデータの投入
  addSlide(presentation, 'Step 4: サンプルデータの投入', [
    '1. Accountオブジェクトにサンプル企業データ',
    '2. Contactオブジェクトに担当者データ',
    '3. Opportunityオブジェクトに商談データ',
    '4. Salesforce UI で確認'
  ]);

  // スライド8: Step 5 - カスタムオブジェクトの作成
  addSlide(presentation, 'Step 5: カスタムオブジェクトの作成（オプション）', [
    '1. metadata API を使用',
    '2. Claude Code でメタデータXML生成',
    '3. sf project deploy でデプロイ',
    '4. カスタム項目、リレーションの設定'
  ]);

  // スライド9: Step 6 - Apex クラスの作成
  addSlide(presentation, 'Step 6: Apex クラスの作成（オプション）', [
    '1. Claude Code でApexクラスを生成',
    '2. ビジネスロジックの実装',
    '3. テストクラスも同時に生成',
    '4. デプロイと動作確認'
  ]);

  // スライド10: トラブルシューティング
  addSlide(presentation, 'トラブルシューティング', [
    '認証エラー: sf org login web を再実行',
    'API制限: Developer Edition の制限を確認',
    'データ投入エラー: 必須項目、バリデーションルールをチェック',
    'Claude Code のエラー: プロンプトを具体的に再指示'
  ]);

  // スライド11: まとめ
  addSlide(presentation, 'まとめ', [
    'Claude Code を活用することで効率的にデモ環境を構築可能',
    'スクリプト生成からデプロイまで自動化できる',
    'カスタマイズも柔軟に対応可能',
    '次のステップ: Lightning Web Component の開発など'
  ]);

  // 完成したプレゼンテーションのURLを返す
  const url = `https://docs.google.com/presentation/d/${presentationId}/edit`;
  Logger.log('プレゼンテーションが作成されました: ' + url);
  return url;
}

/**
 * タイトルと箇条書きのスライドを追加
 */
function addSlide(presentation, title, bulletPoints) {
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  const shapes = slide.getShapes();

  // タイトル設定
  shapes[0].getText().setText(title);

  // 箇条書き設定
  const bodyText = shapes[1].getText();
  bulletPoints.forEach((point, index) => {
    if (index === 0) {
      bodyText.setText(point);
    } else {
      bodyText.appendText('\n' + point);
    }
  });
}

/**
 * スライドにコードブロックを追加する例
 */
function addCodeSlide(presentation, title, code) {
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  const shapes = slide.getShapes();

  shapes[0].getText().setText(title);

  const bodyText = shapes[1].getText();
  bodyText.setText(code);

  // コードブロック風にフォント変更
  const textStyle = bodyText.getTextStyle();
  textStyle.setFontFamily('Courier New');
  textStyle.setFontSize(11);
}
