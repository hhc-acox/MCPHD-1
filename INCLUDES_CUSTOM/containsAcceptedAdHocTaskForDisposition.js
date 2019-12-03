function containsAcceptedAdHocTaskForDisposition(capId, dispositionNote) {
	var tasks = aa.workflow.getTasks(capId).getOutput();
	
	for(e in tasks) {
		if(tasks[e].getTaskDescription().indexOf("Supervisor Review") > -1 && tasks[e].getDispositionNote().equals(dispositionNote) && tasks[e].getDisposition().equals("Accepted")) {
			return true;
		}
	}
	return false;
}
