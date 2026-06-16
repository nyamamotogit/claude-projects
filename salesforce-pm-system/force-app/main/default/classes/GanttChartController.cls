public with sharing class GanttChartController {

    @AuraEnabled(cacheable=true)
    public static List<GanttTaskData> getGanttData(Id projectId) {
        List<GanttTaskData> ganttTasks = new List<GanttTaskData>();

        List<Task__c> tasks = [
            SELECT Id, Name, Start_Date__c, Due_Date__c, Actual_Start_Date__c,
                   Actual_End_Date__c, Status__c, Priority__c, Progress__c,
                   Assigned_To__r.Name, Dependencies__c, Milestone__r.Name
            FROM Task__c
            WHERE Project__c = :projectId
            ORDER BY Start_Date__c ASC NULLS LAST
        ];

        for (Task__c task : tasks) {
            GanttTaskData gtd = new GanttTaskData();
            gtd.id = task.Id;
            gtd.name = task.Name;
            gtd.startDate = task.Start_Date__c;
            gtd.endDate = task.Due_Date__c;
            gtd.actualStartDate = task.Actual_Start_Date__c;
            gtd.actualEndDate = task.Actual_End_Date__c;
            gtd.status = task.Status__c;
            gtd.priority = task.Priority__c;
            gtd.progress = task.Progress__c != null ? task.Progress__c : 0;
            gtd.assignedTo = task.Assigned_To__r != null ? task.Assigned_To__r.Name : '';
            gtd.dependencies = task.Dependencies__c;
            gtd.milestoneName = task.Milestone__r != null ? task.Milestone__r.Name : '';

            ganttTasks.add(gtd);
        }

        return ganttTasks;
    }

    @AuraEnabled(cacheable=true)
    public static List<MilestoneData> getMilestones(Id projectId) {
        List<MilestoneData> milestones = new List<MilestoneData>();

        List<Milestone__c> msList = [
            SELECT Id, Name, Due_Date__c, Status__c
            FROM Milestone__c
            ORDER BY Due_Date__c ASC
            LIMIT 100
        ];

        for (Milestone__c ms : msList) {
            MilestoneData md = new MilestoneData();
            md.id = ms.Id;
            md.name = ms.Name;
            md.dueDate = ms.Due_Date__c;
            md.status = ms.Status__c;

            milestones.add(md);
        }

        return milestones;
    }

    @AuraEnabled(cacheable=true)
    public static List<ProjectData> getAllProjects() {
        List<ProjectData> projects = new List<ProjectData>();

        List<Project__c> projList = [
            SELECT Id, Name, Project_Code__c, Status__c, Priority__c,
                   Start_Date__c, End_Date__c, Progress_Percentage__c
            FROM Project__c
            ORDER BY CreatedDate DESC
            LIMIT 100
        ];

        for (Project__c proj : projList) {
            ProjectData pd = new ProjectData();
            pd.id = proj.Id;
            pd.name = proj.Name;
            pd.projectCode = proj.Project_Code__c;
            pd.status = proj.Status__c;
            pd.priority = proj.Priority__c;
            pd.startDate = proj.Start_Date__c;
            pd.endDate = proj.End_Date__c;
            pd.progress = proj.Progress_Percentage__c;

            projects.add(pd);
        }

        return projects;
    }

    public class GanttTaskData {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        @AuraEnabled public Date actualStartDate;
        @AuraEnabled public Date actualEndDate;
        @AuraEnabled public String status;
        @AuraEnabled public String priority;
        @AuraEnabled public Decimal progress;
        @AuraEnabled public String assignedTo;
        @AuraEnabled public String dependencies;
        @AuraEnabled public String milestoneName;
    }

    public class MilestoneData {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public Date dueDate;
        @AuraEnabled public String status;
    }

    public class ProjectData {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String projectCode;
        @AuraEnabled public String status;
        @AuraEnabled public String priority;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        @AuraEnabled public Decimal progress;
    }
}
