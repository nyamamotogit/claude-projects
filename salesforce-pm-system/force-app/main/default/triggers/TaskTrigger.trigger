trigger TaskTrigger on Task__c (after insert, after update, after delete) {
    Set<Id> projectIds = new Set<Id>();

    if (Trigger.isInsert || Trigger.isUpdate) {
        for (Task__c task : Trigger.new) {
            if (task.Id != null) {
                projectIds.add(task.Id);
            }
        }
    }

    if (Trigger.isDelete) {
        for (Task__c task : Trigger.old) {
            if (task.Id != null) {
                projectIds.add(task.Id);
            }
        }
    }

    if (!projectIds.isEmpty()) {
        ProjectProgressCalculator.updateProjectProgress(projectIds);
    }
}
