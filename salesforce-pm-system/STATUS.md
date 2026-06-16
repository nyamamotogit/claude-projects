# デプロイ状況

## ✅ 作成完了

### オブジェクト定義
- Project__c（プロジェクト）: 9項目
- Task__c（タスク）: 11項目
- Milestone__c（マイルストーン）: 4項目
- Project_Member__c（プロジェクトメンバー）: 3項目

### Apexクラス
- GanttChartController.cls
- ProjectProgressCalculator.cls
- TaskTrigger

### LWC
- ganttChart（D3.jsガントチャート）

### スクリプト
- scripts/insertDemoData.js（デモデータ投入）

## ⚠️ デプロイ前の準備作業

### 1. D3.js Static Resource のアップロード（手動）

```bash
# D3.js をダウンロード
curl -o d3.v7.min.js https://d3js.org/d3.v7.min.js
```

Salesforce Setup:
1. Setup → Static Resources → New
2. Name: `d3`
3. File: d3.v7.min.js をアップロード
4. Cache Control: Public

### 2. メタデータデプロイ

```bash
cd /Users/nyamamoto/claude-projects/salesforce-pm-system
sf project deploy start -d force-app -o myDevOrg
```

### 3. デモデータ投入

```bash
# .env ファイル作成
cp .env.template .env
# .env を編集してパスワード・トークンを設定

npm install
npm run insert:data
```

## 📊 デモ内容

### プロジェクト3件
1. 顧客ポータル開発（High、進行中）
2. モバイルアプリリニューアル（Medium、進行中）
3. 社内管理システム改修（Low、計画中）

### タスク31件
- 完了: 12タスク
- 進行中: 10タスク  
- 未着手: 7タスク
- ブロック: 2タスク

### マイルストーン5件

## 🎨 ガントチャート配置

Setup → Object Manager → Project__c → Lightning Record Pages:
1. Edit default page
2. Add Component → ganttChart
3. Save & Activate

## 📝 完成イメージ

- タイムライン形式でタスクを可視化
- ステータス別に色分け（Not Started/In Progress/Completed/Blocked）
- 進捗率をバー内で表示
- マイルストーンをダイヤモンドマーカーで表示
- 「今日」のラインを赤い点線で表示

## 🔧 次の改善案

1. タスク依存関係の矢印表示
2. ドラッグ&ドロップでタスク期間変更
3. クリティカルパス自動計算
4. レポート・ダッシュボードの自動生成
5. Einstein Analytics 連携
