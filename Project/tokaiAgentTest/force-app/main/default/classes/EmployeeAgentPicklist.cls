global class EmployeeAgentPicklist extends VisualEditor.DynamicPickList {
    global override VisualEditor.DataRow getDefaultValue() {
        return new VisualEditor.DataRow('-- 選択してください --', '');
    }

    global override VisualEditor.DynamicPickListRows getValues() {
        VisualEditor.DynamicPickListRows rows = new VisualEditor.DynamicPickListRows();
        for (BotDefinition bot : [
            SELECT Id, DeveloperName, MasterLabel
            FROM BotDefinition
            WHERE AgentType = 'AgentforceEmployeeAgent'
            ORDER BY MasterLabel ASC
        ]) {
            rows.addRow(new VisualEditor.DataRow(bot.MasterLabel, bot.Id));
        }
        return rows;
    }
}
