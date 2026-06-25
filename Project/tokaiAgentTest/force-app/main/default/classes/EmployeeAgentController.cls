public with sharing class EmployeeAgentController {
    @AuraEnabled(cacheable=true)
    public static String getBotId(String developerName) {
        List<BotDefinition> bots = [
            SELECT Id FROM BotDefinition
            WHERE DeveloperName = :developerName
            AND AgentType = 'AgentforceEmployeeAgent'
            LIMIT 1
        ];
        return bots.isEmpty() ? null : bots[0].Id;
    }
}
