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
