function containsAcceptedOrPendingAdHocTaskForDisposition(capId, dispositionNote) {
	var tasks = aa.workflow.getTasks(capId).getOutput();
	
	for(e in tasks) {
		if(tasks[e].getTaskDescription().indexOf("Supervisor Review") > -1 && tasks[e].getDispositionNote().equals(dispositionNote) && (tasks[e].getDisposition().equals("Accepted") || tasks[e].getDisposition().equals("In Progress"))) {
			return true;
		}
	}
	return false;
}
