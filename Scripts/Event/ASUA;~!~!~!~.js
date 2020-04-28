// Enter your script here...
showDebug = true;
showMessage = true;

if (appStatus == 'Inactive-Error') {
    inspCancelAll();

    var workflowResult = aa.workflow.getTasks(capId);

    if (workflowResult.getSuccess()) {
        wfObj = workflowResult.getOutput();

        for (i in wfObj) {
            fTask = wfObj[i];
            if (fTask.getActiveFlag().equals("Y")) {
                deactivateTask(fTask.getTaskDescription());
            }
        }
    } else {
        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
    }
}
