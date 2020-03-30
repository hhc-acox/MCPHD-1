function getAssignedToWkfl(taskName, tcapId) {
    var workflowResult = aa.workflow.getTaskItems(tcapId, taskName,null,null,null,null);

    if (workflowResult.getSuccess()) {
        var tWfObj = workflowResult.getOutput();

        if (tWfObj) {
            var tfTask = tWfObj[0];

            if (tfTask) {
                var user = tfTask.getTaskItem().getAssignedUser();

                if (user) {
                    return aa.person.getUser(user.getFirstName(),user.getMiddleName(),user.getLastName()).getOutput();
                }
            }
        }
    }
}
