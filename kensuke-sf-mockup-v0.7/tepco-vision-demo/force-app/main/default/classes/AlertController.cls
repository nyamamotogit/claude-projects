public with sharing class AlertController {

    @AuraEnabled(cacheable=true)
    public static Substation_Alert__c getAlert(Id alertId) {
        return [
            SELECT Id, Name, Substation__c, Equipment__c, Severity__c, Status__c,
                   H2_PPM__c, C2H2_PPM__c, Oil_Temp__c, Load_Rate__c,
                   Households_Affected__c, AF_Confidence__c, AF_Reasoning__c, Detected_At__c
            FROM Substation_Alert__c
            WHERE Id = :alertId
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Action_Step__c> getSteps(Id alertId) {
        return [
            SELECT Id, Name, Sequence__c, System__c, Title__c, Description__c, Meta_Info__c, Status__c
            FROM Action_Step__c
            WHERE Alert__c = :alertId
            ORDER BY Sequence__c ASC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Swarm_Message__c> getMessages(Id alertId) {
        return [
            SELECT Id, Name, Sequence__c, Sender_Name__c, Sender_Role__c, Sender_Type__c,
                   Body__c, Sent_At__c, Attachment_Title__c, Attachment_Body__c
            FROM Swarm_Message__c
            WHERE Alert__c = :alertId
            ORDER BY Sequence__c ASC
        ];
    }

    @AuraEnabled
    public static void runAgentforce(Id alertId) {
        Substation_Alert__c a = [SELECT Id, Status__c, AF_Confidence__c, AF_Reasoning__c FROM Substation_Alert__c WHERE Id = :alertId LIMIT 1];
        a.Status__c = 'AI診断';
        a.AF_Confidence__c = 94;
        a.AF_Reasoning__c = '過去類似事例 (2020 南港・2017 南渡田) と一致度89%。SAP・AWS・M365・Teams から横断照合し、5ステップの対応プランを生成しました。';
        update a;
    }

    @AuraEnabled
    public static void executeStep(Id stepId) {
        Action_Step__c s = [SELECT Id, Status__c FROM Action_Step__c WHERE Id = :stepId LIMIT 1];
        s.Status__c = '完了';
        update s;
    }

    @AuraEnabled
    public static void approvePlan(Id alertId) {
        Substation_Alert__c a = [SELECT Id, Status__c FROM Substation_Alert__c WHERE Id = :alertId LIMIT 1];
        a.Status__c = '承認済';
        update a;

        List<Action_Step__c> steps = [SELECT Id, Status__c FROM Action_Step__c WHERE Alert__c = :alertId];
        for (Action_Step__c s : steps) s.Status__c = '完了';
        update steps;
    }

    @AuraEnabled
    public static void resetDemo(Id alertId) {
        Substation_Alert__c a = [SELECT Id, Status__c, AF_Confidence__c, AF_Reasoning__c FROM Substation_Alert__c WHERE Id = :alertId LIMIT 1];
        a.Status__c = 'IoT検知';
        a.AF_Confidence__c = null;
        a.AF_Reasoning__c = null;
        update a;
        List<Action_Step__c> steps = [SELECT Id, Status__c FROM Action_Step__c WHERE Alert__c = :alertId];
        for (Action_Step__c s : steps) s.Status__c = '待機';
        update steps;
    }
}
