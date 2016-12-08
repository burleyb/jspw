global class JSpwTestDataCleaningScheduler implements Schedulable {
    global void execute(SchedulableContext sc) {
        JSpwTestData.cleanupData();
    }
}