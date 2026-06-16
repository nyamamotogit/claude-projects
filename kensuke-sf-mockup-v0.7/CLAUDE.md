# Salesforce Lightning UI Mockup プロジェクト

このプロジェクトでは、Salesforce Lightning Experience風の画面モックアップを単一HTMLファイルとして作成・修正します。

## モックアップ作成・修正時のルール
処理実行中に、　API Error: The operation timed out.　になるIssueを確認済みです。発生しないように処理を小分けにしたり、リトライしながら行います。

Salesforce画面（取引先・商談・リード・ケース・ホーム・ダッシュボード・カンバン・コンソール等）のモックアップを新規作成・修正する場合は、必ず **`salesforce-lightning-mockup` Skill** を使用してください。

このSkillには以下が含まれます:
- ページ別テンプレート: `templates/record-page.html`, `list-view.html`, `home-page.html`, `kanban.html`, `console.html`, `dashboard.html`
- コンポーネントスニペット集: Buttons / Badges / Modals / Toasts / Path / Data Table / Forms / Activity Timeline / Tiles / Tree など
- 共通スタイル: `style-tokens.html`（SLDS風のカラーパレット・カスタムクラス定義）

Skillの場所: `.claude/skills/salesforce-lightning-mockup/`

## 出力先のルール（厳守）

新規生成したHTMLは必ず以下のパスに保存します:

```
output/YYYYMMDD_HHMM_<内容名>.html
```

例: `output/20260611_1830_account-detail.html`

- `YYYYMMDD_HHMM` は生成時点のローカル時刻（`date +%Y%m%d_%H%M`）
- `<内容名>` は英小文字 kebab-case（`account-detail`, `opportunity-kanban` 等）
- `output/` が無ければ `mkdir -p output` で作成
- **既存ファイルの修正時は元のファイル名を維持**して上書き。新規生成のときだけプレフィックスを付ける

## 既存ファイル

- `omron-account.html`, `opportunity-cross-dept.html`, `agentforce_e401.html` - 過去に作成したモックアップ。新規作成時は参考可。
- `CLAUDE.md.org.md` - 旧仕様（参照のみ）。
