# Salesforce プロジェクト管理システム設計書

## オブジェクト構成

### 1. Project__c（プロジェクト）
**主要項目**:
- Name (テキスト) - プロジェクト名
- Project_Code__c (テキスト, ユニーク) - プロジェクトコード
- Start_Date__c (日付) - 開始日
- End_Date__c (日付) - 終了日
- Planned_Budget__c (通貨) - 予定予算
- Actual_Cost__c (通貨) - 実績コスト
- Status__c (選択リスト) - New/Planning/In Progress/On Hold/Completed/Cancelled
- Priority__c (選択リスト) - High/Medium/Low
- Progress_Percentage__c (パーセント, 数式) - タスクから自動計算
- Project_Manager__c (参照: User) - プロジェクトマネージャー
- Description__c (ロングテキスト) - 説明

### 2. Task__c（タスク）
**主要項目**:
- Name (テキスト) - タスク名
- Project__c (主従: Project__c) - プロジェクト
- Assigned_To__c (参照: User) - 担当者
- Status__c (選択リスト) - Not Started/In Progress/Completed/Blocked
- Priority__c (選択リスト) - High/Medium/Low
- Start_Date__c (日付) - 開始日
- Due_Date__c (日付) - 期限
- Actual_Start_Date__c (日付) - 実績開始日
- Actual_End_Date__c (日付) - 実績終了日
- Estimated_Hours__c (数値) - 見積時間
- Actual_Hours__c (数値) - 実績時間
- Progress__c (パーセント) - 進捗率
- Dependencies__c (テキスト) - 依存タスクID（カンマ区切り）
- Description__c (ロングテキスト) - 説明
- Milestone__c (参照: Milestone__c) - マイルストーン

### 3. Milestone__c（マイルストーン）
**主要項目**:
- Name (テキスト) - マイルストーン名
- Project__c (主従: Project__c) - プロジェクト
- Due_Date__c (日付) - 期限
- Status__c (選択リスト) - Planned/In Progress/Completed/Missed
- Completion_Percentage__c (パーセント, 数式) - 完了率
- Description__c (ロングテキスト) - 説明

### 4. Project_Member__c（プロジェクトメンバー）
**主要項目**:
- Project__c (主従: Project__c) - プロジェクト
- User__c (参照: User) - ユーザー
- Role__c (選択リスト) - Project Manager/Developer/Designer/QA/Business Analyst
- Allocation_Percentage__c (パーセント) - アサイン率
- Start_Date__c (日付) - 参画開始日
- End_Date__c (日付) - 参画終了日

## デモデータ構成

### プロジェクト3件
1. **顧客ポータル開発** (進行中、優先度:High)
2. **モバイルアプリリニューアル** (進行中、優先度:Medium、一部遅延)
3. **社内管理システム改修** (計画中、優先度:Low)

### タスク構成（合計40タスク）
- 完了済み: 15タスク
- 進行中: 12タスク
- 未着手: 10タスク
- ブロック中: 3タスク

### マイルストーン（各プロジェクト2-3個）

## D3.js ガントチャート仕様

### 機能要件
1. タイムライン表示（月単位/週単位切り替え）
2. タスクバー（開始日-終了日）
3. 進捗率の可視化（バー内の色分け）
4. 依存関係の矢印表示
5. マイルストーンのマーカー
6. ステータス別の色分け
7. ホバーでタスク詳細表示
8. 「今日」のインジケーター
9. クリックでタスク編集画面へ遷移

### カラースキーム
- Not Started: #E0E0E0（グレー）
- In Progress: #4A90E2（青）
- Completed: #7ED321（緑）
- Blocked: #D0021B（赤）
- High Priority: 濃い色
- Medium Priority: 通常色
- Low Priority: 薄い色

## Apexロジック

### トリガー
1. **TaskTrigger** - タスク変更時にプロジェクト進捗率を更新
2. **MilestoneTrigger** - マイルストーン完了時の処理

### クラス
1. **ProjectProgressCalculator** - 進捗率計算ロジック
2. **GanttChartController** - LWCへのデータ提供
3. **ProjectDemoDataGenerator** - デモデータ生成（Apex版）

## レポート・ダッシュボード

### レポート5種類
1. プロジェクト一覧（ステータス別）
2. タスク進捗レポート（担当者別）
3. 遅延タスクレポート（期限超過）
4. プロジェクト予実管理（予算vs実績）
5. リソース稼働状況（メンバー別）

### ダッシュボード
- プロジェクトステータスサマリー（円グラフ）
- タスク完了トレンド（折れ線グラフ）
- 優先度別タスク分布（棒グラフ）
- 予算消化率（ゲージ）
