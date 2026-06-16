/**
 * より高度なスライド作成スクリプト
 * 画像、色、レイアウトのカスタマイズ例
 */

function createAdvancedSalesforceSlides() {
  const presentation = SlidesApp.create('Claude × Salesforce デモ環境構築ガイド');
  const presentationId = presentation.getId();
  const slides = presentation.getSlides();

  // タイトルスライドのカスタマイズ
  const titleSlide = slides[0];
  customizeTitleSlide(titleSlide);

  // 各スライドを追加
  addAgendaSlide(presentation);
  addOverviewSlide(presentation);
  addPrerequisitesSlide(presentation);
  addStepSlides(presentation);
  addTroubleshootingSlide(presentation);
  addSummarySlide(presentation);

  const url = `https://docs.google.com/presentation/d/${presentationId}/edit`;
  Logger.log('プレゼンテーションが作成されました: ' + url);
  Logger.log('このURLをブラウザで開いてください');

  return url;
}

/**
 * タイトルスライドのカスタマイズ
 */
function customizeTitleSlide(slide) {
  const shapes = slide.getShapes();

  // メインタイトル
  const title = shapes[0].getText();
  title.setText('Claude Code で作る\nSalesforce デモ環境');
  title.getTextStyle()
    .setFontSize(44)
    .setBold(true)
    .setForegroundColor('#1589EE'); // Salesforce Blue

  // サブタイトル
  const subtitle = shapes[1].getText();
  subtitle.setText('自動化による効率的な環境構築\n\n作成日: ' + new Date().toLocaleDateString('ja-JP'));
  subtitle.getTextStyle()
    .setFontSize(18)
    .setForegroundColor('#666666');

  // 背景色を設定
  slide.getBackground()
    .setSolidFill('#F4F6F9');
}

/**
 * アジェンダスライド
 */
function addAgendaSlide(presentation) {
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  const shapes = slide.getShapes();

  shapes[0].getText().setText('アジェンダ');

  const agenda = [
    '1. 概要と目的',
    '2. 事前準備',
    '3. Salesforce Developer Edition アカウント作成',
    '4. Salesforce CLI のセットアップ',
    '5. Claude Code によるスクリプト生成',
    '6. デモデータの投入',
    '7. トラブルシューティング',
    '8. まとめ'
  ];

  const bodyText = shapes[1].getText();
  bodyText.setText(agenda.join('\n'));
  bodyText.getTextStyle().setFontSize(18);
}

/**
 * 概要スライド（2カラムレイアウト）
 */
function addOverviewSlide(presentation) {
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_ONLY);
  const pageElements = slide.getPageElements();

  // タイトル取得
  let titleShape = null;
  for (let i = 0; i < pageElements.length; i++) {
    if (pageElements[i].getPageElementType() === SlidesApp.PageElementType.SHAPE) {
      titleShape = pageElements[i].asShape();
      break;
    }
  }

  if (titleShape) {
    titleShape.getText().setText('概要');
  }

  // 左カラム：テキストボックス
  const leftBox = slide.insertTextBox('本ガイドの目的\n\n' +
    '• Claude Code を活用した効率化\n' +
    '• Salesforce デモ環境の迅速な構築\n' +
    '• スクリプトによる自動化\n' +
    '• 再現可能な手順の確立',
    50, 100, 300, 300);

  leftBox.getText().getTextStyle().setFontSize(14);

  // 右カラム：テキストボックス
  const rightBox = slide.insertTextBox('想定時間\n\n' +
    '• 環境準備: 5分\n' +
    '• アカウント作成: 3分\n' +
    '• スクリプト実行: 2分\n' +
    '• データ投入: 5分\n\n' +
    '合計: 約15分',
    400, 100, 300, 300);

  rightBox.getText().getTextStyle().setFontSize(14);
}

/**
 * 事前準備スライド
 */
function addPrerequisitesSlide(presentation) {
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  const shapes = slide.getShapes();

  shapes[0].getText().setText('事前準備');

  const prerequisites = [
    '✓ Claude Code へのアクセス権',
    '  - Claude Code CLI または Web版',
    '',
    '✓ Node.js 環境（推奨: v18以上）',
    '  - npm または yarn が使用可能',
    '',
    '✓ メールアドレス',
    '  - Salesforce アカウント登録用',
    '',
    '✓ インターネット接続',
    '  - 安定した接続環境'
  ];

  const bodyText = shapes[1].getText();
  bodyText.setText(prerequisites.join('\n'));
  bodyText.getTextStyle().setFontSize(16);
}

/**
 * ステップバイステップのスライドを追加
 */
function addStepSlides(presentation) {
  // Step 1
  addStepSlide(presentation, 'Step 1: Developer Edition アカウント作成', 1, [
    '1. https://developer.salesforce.com/signup にアクセス',
    '',
    '2. 必要情報を入力',
    '   • 名前、メールアドレス',
    '   • ユーザー名（ユニークなメールアドレス形式）',
    '   • 会社名、役割を選択',
    '',
    '3. 「Sign me up」をクリック',
    '',
    '4. 確認メールから認証を完了',
    '',
    '⚠️ ユーザー名は既存のものと重複不可'
  ]);

  // Step 2
  addStepSlide(presentation, 'Step 2: Salesforce CLI インストール', 2, [
    '# Node.js 経由でインストール',
    'npm install -g @salesforce/cli',
    '',
    '# インストール確認',
    'sf --version',
    '',
    '# 認証',
    'sf org login web -a myDevOrg',
    '',
    '# 接続確認',
    'sf org display -o myDevOrg'
  ], true);

  // Step 3
  addStepSlide(presentation, 'Step 3: Claude Code でスクリプト生成', 3, [
    'プロンプト例：',
    '',
    '"Salesforce の Developer Edition 環境に',
    ' サンプルの Account, Contact, Opportunity',
    ' データを投入する Node.js スクリプトを',
    ' 作成してください。jsforce を使用し、',
    ' 各オブジェクトに10件ずつデータを作成"',
    '',
    'Claude Code が以下を生成：',
    '• データ投入スクリプト',
    '• 必要な依存関係（package.json）',
    '• 実行手順'
  ]);

  // Step 4
  addStepSlide(presentation, 'Step 4: スクリプト実行とデータ投入', 4, [
    '# 依存関係インストール',
    'npm install jsforce',
    '',
    '# 環境変数設定（.env ファイル）',
    'SF_USERNAME=your-username@example.com',
    'SF_PASSWORD=yourpassword',
    'SF_SECURITY_TOKEN=yoursecuritytoken',
    '',
    '# スクリプト実行',
    'node insertDemoData.js',
    '',
    '✅ Salesforce UI でデータを確認'
  ], true);
}

/**
 * ステップスライドを追加（ヘルパー関数）
 */
function addStepSlide(presentation, title, stepNumber, content, isCode = false) {
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  const shapes = slide.getShapes();

  // タイトル設定
  const titleText = shapes[0].getText();
  titleText.setText(title);
  titleText.getTextStyle()
    .setFontSize(28)
    .setBold(true)
    .setForegroundColor('#1589EE');

  // 本文設定
  const bodyText = shapes[1].getText();
  bodyText.setText(content.join('\n'));

  if (isCode) {
    // コードブロックスタイル
    bodyText.getTextStyle()
      .setFontFamily('Courier New')
      .setFontSize(12);
  } else {
    bodyText.getTextStyle().setFontSize(14);
  }

  // ステップ番号バッジを追加
  const badge = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, 600, 50, 60, 60);
  badge.getFill().setSolidFill('#1589EE');
  badge.getBorder().setTransparent();

  const badgeText = badge.getText();
  badgeText.setText(stepNumber.toString());
  badgeText.getTextStyle()
    .setFontSize(32)
    .setBold(true)
    .setForegroundColor('#FFFFFF');
  badgeText.getParagraphStyle()
    .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
}

/**
 * トラブルシューティングスライド
 */
function addTroubleshootingSlide(presentation) {
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  const shapes = slide.getShapes();

  shapes[0].getText().setText('トラブルシューティング');

  const troubleshooting = [
    '❌ 認証エラー',
    '   → sf org login web を再実行',
    '   → セキュリティトークンを確認',
    '',
    '❌ API制限エラー',
    '   → Developer Edition の日次制限を確認',
    '   → データ投入を分割実行',
    '',
    '❌ データ投入エラー',
    '   → 必須項目が埋まっているか確認',
    '   → バリデーションルールをチェック',
    '',
    '❌ Claude Code のエラー',
    '   → プロンプトをより具体的に',
    '   → エラーメッセージを共有して再質問'
  ];

  const bodyText = shapes[1].getText();
  bodyText.setText(troubleshooting.join('\n'));
  bodyText.getTextStyle().setFontSize(13);
}

/**
 * まとめスライド
 */
function addSummarySlide(presentation) {
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  const shapes = slide.getShapes();

  shapes[0].getText().setText('まとめ');

  const summary = [
    '✅ Claude Code による効率的な自動化',
    '   • スクリプト生成が迅速',
    '   • エラー処理も含めて実装可能',
    '',
    '✅ 再現可能な手順の確立',
    '   • 同じ環境を何度でも構築可能',
    '   • チームでの共有が容易',
    '',
    '🚀 次のステップ',
    '   • Lightning Web Component の開発',
    '   • Apex クラスのテスト自動化',
    '   • CI/CD パイプラインの構築',
    '   • カスタムメタデータの管理'
  ];

  const bodyText = shapes[1].getText();
  bodyText.setText(summary.join('\n'));
  bodyText.getTextStyle().setFontSize(15);

  // 背景色を設定
  slide.getBackground().setSolidFill('#F4F6F9');
}
