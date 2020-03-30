function doesRecordHaveActiveSupervisorReview() {
	var retValue = false;
    var tasks = aa.workflow.getTasks(capId).getOutput();
    for(var x in tasks){
        thisTask = tasks[x];
        thisTaskDesc = "" + thisTask.getTaskDescription();
        if(thisTaskDesc.indexOf("Supervisor Review Workflow") > -1) {
            if (thisTask.getActiveFlag() == "Y" && thisTask.getCompleteFlag() == "N") {
                retValue = true;
            }
        }
    }
	return retValue
}
