# Custom Project Management System

## オブジェクト構成

### CustomProject__c
- Name (プロジェクト名)
- Project_Code__c (プロジェクトコード)
- Start_Date__c (開始日)
- End_Date__c (終了日)
- Status__c (ステータス)
- Priority__c (優先度)
- Budget__c (予算)
- Description__c (説明)

### CustomTask__c
- Name (タスク名)
- CustomProject__c (カスタムプロジェクト)
- Status__c (ステータス)
- Priority__c (優先度)
- Due_Date__c (期限)
- Assigned_To__c (担当者)
- Description__c (説明)

## デプロイ手順

### 1. メタデータデプロイ

```bash
cd /Users/nyamamoto/claude-projects/salesforce-pm-custom
sf project deploy start -d force-app -o myDevOrg
```

### 2. デモデータ投入

```bash
# .env ファイル作成
cp .env.template .env
# .env を編集してパスワード・セキュリティトークンを設定

# 依存パッケージインストール
npm install

# デモデータ投入
npm run insert:data
```

## デモデータ内容

### プロジェクト3件
1. **顧客ポータル開発プロジェクト** (High, In Progress)
2. **モバイルアプリ刷新** (Medium, In Progress)
3. **社内業務システム改修** (Low, Planning)

### タスク35件
- Completed: 9タスク
- In Progress: 10タスク
- Not Started: 15タスク
- Blocked: 1タスク

## システム管理者権限

`Admin.profile-meta.xml` により、システム管理者プロファイルに以下の権限が付与されます：

- CustomProject__c: CRUD + Modify All + View All
- CustomTask__c: CRUD + Modify All + View All
- 全フィールド: 読み取り・編集可能
- タブ表示: デフォルトオン

## Salesforce UIでの確認

1. デプロイ後、Salesforce にログイン
2. App Launcher → Custom Projects タブ
3. プロジェクト一覧から詳細を確認
4. 関連タスクを「Custom Tasks」関連リストで表示
