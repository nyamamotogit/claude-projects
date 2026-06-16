# Salesforce プロジェクト管理システム

D3.jsガントチャート付きのプロジェクト管理デモ環境

## 📦 含まれるもの

- **カスタムオブジェクト**: Project__c, Task__c, Milestone__c, Project_Member__c
- **Apexクラス**: GanttChartController, ProjectProgressCalculator
- **トリガー**: TaskTrigger（進捗自動計算）
- **LWC**: ganttChart（D3.jsガントチャート）
- **デモデータスクリプト**: 3プロジェクト、40タスク

## 🚀 デプロイ手順

### 1. リポジトリ準備

```bash
cd salesforce-pm-system
npm install
```

### 2. Salesforce認証（完了済み）

すでに認証済みです（myDevOrg）

### 3. D3.jsをStatic Resourceにアップロード

```bash
# D3.js v7 をダウンロード
curl -o d3.v7.min.js https://d3js.org/d3.v7.min.js

# Salesforce にアップロード（手動またはメタデータで）
```

### 4. メタデータをデプロイ

```bash
cd /Users/nyamamoto/claude-projects/salesforce-pm-system
sf project deploy start -d force-app -o myDevOrg
```

### 5. デモデータ投入

```bash
# .env ファイル作成
cat > .env << EOF
SF_USERNAME=trailsignup.307f57e6fd52bd@salesforce.com
SF_PASSWORD=your_password
SF_SECURITY_TOKEN=your_token
SF_LOGIN_URL=https://login.salesforce.com
EOF

# データ投入
npm run insert:data
```

### 6. ガントチャートを配置

Salesforce Setup:
1. Object Manager → Project__c
2. Lightning Record Pages → Edit Page
3. Add Component → ganttChart
4. Save & Activate

## 📊 デモデータ内容

### プロジェクト

1. **顧客ポータル開発**（進行中、優先度:High）
   - 15タスク（完了6、進行中5、未着手3、ブロック1）
   
2. **モバイルアプリリニューアル**（進行中、優先度:Medium）
   - 11タスク（完了5、進行中3、未着手3）
   
3. **社内管理システム改修**（計画中、優先度:Low）
   - 5タスク（完了1、進行中2、ブロック1、未着手1）

### タスク統計
- 完了: 12タスク
- 進行中: 10タスク
- 未着手: 7タスク
- ブロック: 2タスク

## 🎨 ガントチャート機能

- タイムライン表示（週単位）
- ステータス別色分け
  - Not Started: グレー
  - In Progress: 青
  - Completed: 緑
  - Blocked: 赤
- 進捗率の可視化（バー内の濃淡）
- 今日のライン（赤い点線）
- マイルストーンマーカー（ダイヤ型、オレンジ）
- ホバーで詳細表示

## 🔧 カスタマイズ

### タスクの依存関係を追加

Dependencies__c フィールドに他のタスクIDをカンマ区切りで設定

### レポート・ダッシュボード

Setup → Reports & Dashboards で以下を作成:
- プロジェクト進捗サマリー
- タスク完了トレンド
- リソース稼働状況

## 📝 次のステップ

1. D3.jsにドラッグ&ドロップ機能追加
2. タスク依存関係の矢印表示
3. クリティカルパス計算
4. リソース負荷分析
5. Einstein Analytics 連携
