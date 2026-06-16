# ガントチャート追加手順

## 作成したコンポーネント

✅ **Apexクラス**: `CustomGanttChartController`
✅ **テストクラス**: `CustomGanttChartControllerTest`
✅ **LWC**: `customGanttChart`

## 🔧 手動デプロイ手順

Salesforce Developer Console を使用してデプロイします。

### Step 1: Developer Console を開く

1. Salesforceにログイン
2. 右上の歯車アイコン → **Developer Console**

### Step 2: Apexクラスを作成

#### CustomGanttChartController

1. Developer Console で **File** → **New** → **Apex Class**
2. Name: `CustomGanttChartController`
3. 以下のコードを貼り付け：

\`\`\`apex
public with sharing class CustomGanttChartController {

    @AuraEnabled(cacheable=true)
    public static List<GanttTaskData> getGanttData(Id projectId) {
        List<GanttTaskData> ganttTasks = new List<GanttTaskData>();

        List<CustomTask__c> tasks = [
            SELECT Id, Name, Due_Date__c, Status__c, Priority__c,
                   Assigned_To__r.Name, CustomProject__r.Name
            FROM CustomTask__c
            WHERE CustomProject__c = :projectId
            ORDER BY Due_Date__c ASC NULLS LAST
        ];

        for (CustomTask__c task : tasks) {
            GanttTaskData gtd = new GanttTaskData();
            gtd.id = task.Id;
            gtd.name = task.Name;
            gtd.dueDate = task.Due_Date__c;
            gtd.status = task.Status__c;
            gtd.priority = task.Priority__c;
            gtd.assignedTo = task.Assigned_To__r != null ? task.Assigned_To__r.Name : '';
            gtd.projectName = task.CustomProject__r.Name;

            ganttTasks.add(gtd);
        }

        return ganttTasks;
    }

    @AuraEnabled(cacheable=true)
    public static List<ProjectData> getAllProjects() {
        List<ProjectData> projects = new List<ProjectData>();

        List<CustomProject__c> projList = [
            SELECT Id, Name, Project_Code__c, Status__c, Priority__c,
                   Start_Date__c, End_Date__c
            FROM CustomProject__c
            ORDER BY CreatedDate DESC
            LIMIT 100
        ];

        for (CustomProject__c proj : projList) {
            ProjectData pd = new ProjectData();
            pd.id = proj.Id;
            pd.name = proj.Name;
            pd.projectCode = proj.Project_Code__c;
            pd.status = proj.Status__c;
            pd.priority = proj.Priority__c;
            pd.startDate = proj.Start_Date__c;
            pd.endDate = proj.End_Date__c;

            projects.add(pd);
        }

        return projects;
    }

    public class GanttTaskData {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public Date dueDate;
        @AuraEnabled public String status;
        @AuraEnabled public String priority;
        @AuraEnabled public String assignedTo;
        @AuraEnabled public String projectName;
    }

    public class ProjectData {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String projectCode;
        @AuraEnabled public String status;
        @AuraEnabled public String priority;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
    }
}
\`\`\`

4. **Save**

#### CustomGanttChartControllerTest

1. **File** → **New** → **Apex Class**
2. Name: `CustomGanttChartControllerTest`
3. コードを貼り付け（`CustomGanttChartControllerTest.cls` の内容）
4. **Save**

### Step 3: Lightning Web Component を手動で作成

**LWCはDeveloper Consoleでは作成できません。**

2つの選択肢があります：

#### オプション A: VS Code + Salesforce Extensions（推奨）

1. VS Code をインストール
2. Salesforce Extension Pack をインストール
3. プロジェクトを認証
4. LWCファイルを作成してデプロイ

#### オプション B: シンプルな代替案

ガントチャートの代わりに、**カスタムレポート + ダッシュボード** を使用：

1. **Setup** → **Reports**
2. 新しいレポートタイプ: Custom Tasks
3. フィルター: Status, Priority, Due Date
4. グルーピング: Status
5. ダッシュボードに配置

## 📊 現在利用可能な機能

現時点で、以下の機能が動作しています：

✅ プロジェクト一覧（Custom Projects タブ）
✅ プロジェクト詳細（全項目表示）
✅ Custom Tasks 関連リスト（タスク一覧）
✅ タスクのステータス、優先度、期限表示
✅ デモデータ（3プロジェクト、13タスク）

## 🎯 次のステップ

### すぐにできること

1. **レポート作成**
   - Setup → Reports → New Report
   - Report Type: Custom Tasks
   - Group by: Status, Priority
   
2. **ダッシュボード作成**
   - Setup → Dashboards → New Dashboard
   - レポートをドラッグ&ドロップ
   - タスク進捗を可視化

### より高度な可視化

VS Code + Salesforce CLI でLWCをデプロイすれば、ガントチャートが利用可能になります。

## ファイル一覧

すべてのファイルは以下に保存されています：

\`\`\`
/Users/nyamamoto/claude-projects/salesforce-pm-custom/force-app/main/default/
├── classes/
│   ├── CustomGanttChartController.cls
│   ├── CustomGanttChartController.cls-meta.xml
│   ├── CustomGanttChartControllerTest.cls
│   └── CustomGanttChartControllerTest.cls-meta.xml
└── lwc/
    └── customGanttChart/
        ├── customGanttChart.js
        ├── customGanttChart.html
        ├── customGanttChart.css
        └── customGanttChart.js-meta.xml
\`\`\`

これらのファイルは、VS Code + Salesforce Extensionsでデプロイ可能です。
