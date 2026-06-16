public with sharing class ProjectProgressCalculator {

    public static void updateProjectProgress(Set<Id> projectIds) {
        Map<Id, Project__c> projectsToUpdate = new Map<Id, Project__c>();

        for (Id projectId : projectIds) {
            Integer totalTasks = [SELECT COUNT() FROM Task__c];
            Integer completedTasks = [SELECT COUNT() FROM Task__c WHERE Status__c = 'Completed'];

            Project__c proj = new Project__c(
                Id = projectId,
                Total_Tasks__c = totalTasks,
                Completed_Tasks__c = completedTasks
            );

            projectsToUpdate.put(projectId, proj);
        }

        if (!projectsToUpdate.isEmpty()) {
            update projectsToUpdate.values();
        }
    }

    public static void autoUpdateProjectStatus(Set<Id> projectIds) {
        List<Project__c> projectsToUpdate = new List<Project__c>();

        for (Project__c proj : [SELECT Id, Progress_Percentage__c, Status__c
                                 FROM Project__c
                                 WHERE Id IN :projectIds]) {
            String newStatus = null;

            if (proj.Progress_Percentage__c >= 100) {
                newStatus = 'Completed';
            } else if (proj.Progress_Percentage__c > 0 && proj.Status__c == 'Planning') {
                newStatus = 'In Progress';
            }

            if (newStatus != null && newStatus != proj.Status__c) {
                proj.Status__c = newStatus;
                projectsToUpdate.add(proj);
            }
        }

        if (!projectsToUpdate.isEmpty()) {
            update projectsToUpdate;
        }
    }
}
