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
            // value に Id を直接入れるとApp Builderの検証で弾かれるため
            // DeveloperName を value として渡し、LWC側でIdに変換する
            rows.addRow(new VisualEditor.DataRow(bot.MasterLabel, bot.DeveloperName));
        }
        return rows;
    }
}
