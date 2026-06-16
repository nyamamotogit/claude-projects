@isTest
private class CustomGanttChartControllerTest {

    @testSetup
    static void setup() {
        // Create test project
        CustomProject__c project = new CustomProject__c(
            Name = 'Test Project',
            Project_Code__c = 'TEST-001',
            Status__c = 'In Progress',
            Priority__c = 'High',
            Start_Date__c = Date.today(),
            End_Date__c = Date.today().addDays(30)
        );
        insert project;

        // Create test tasks
        List<CustomTask__c> tasks = new List<CustomTask__c>();
        tasks.add(new CustomTask__c(
            Name = 'Task 1',
            CustomProject__c = project.Id,
            Status__c = 'Completed',
            Priority__c = 'High',
            Due_Date__c = Date.today().addDays(5)
        ));
        tasks.add(new CustomTask__c(
            Name = 'Task 2',
            CustomProject__c = project.Id,
            Status__c = 'In Progress',
            Priority__c = 'Medium',
            Due_Date__c = Date.today().addDays(10)
        ));
        tasks.add(new CustomTask__c(
            Name = 'Task 3',
            CustomProject__c = project.Id,
            Status__c = 'Not Started',
            Priority__c = 'Low',
            Due_Date__c = Date.today().addDays(15)
        ));
        insert tasks;
    }

    @isTest
    static void testGetGanttData() {
        CustomProject__c project = [SELECT Id FROM CustomProject__c LIMIT 1];

        Test.startTest();
        List<CustomGanttChartController.GanttTaskData> result =
            CustomGanttChartController.getGanttData(project.Id);
        Test.stopTest();

        System.assertEquals(3, result.size(), 'Should return 3 tasks');
        System.assertNotEquals(null, result[0].name, 'Task name should not be null');
        System.assertNotEquals(null, result[0].status, 'Task status should not be null');
    }

    @isTest
    static void testGetGanttDataNoTasks() {
        CustomProject__c project = new CustomProject__c(
            Name = 'Empty Project',
            Project_Code__c = 'TEST-002',
            Status__c = 'New',
            Priority__c = 'Low'
        );
        insert project;

        Test.startTest();
        List<CustomGanttChartController.GanttTaskData> result =
            CustomGanttChartController.getGanttData(project.Id);
        Test.stopTest();

        System.assertEquals(0, result.size(), 'Should return 0 tasks');
    }

    @isTest
    static void testGetAllProjects() {
        Test.startTest();
        List<CustomGanttChartController.ProjectData> result =
            CustomGanttChartController.getAllProjects();
        Test.stopTest();

        System.assert(result.size() > 0, 'Should return at least 1 project');
        System.assertNotEquals(null, result[0].name, 'Project name should not be null');
        System.assertEquals('TEST-001', result[0].projectCode, 'Project code should match');
    }
}
