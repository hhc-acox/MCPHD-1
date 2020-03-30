function containsAcceptedAdHocTaskForDisposition(capId, dispositionNote) {
	var tasks = aa.workflow.getTasks(capId).getOutput();
	
	for(e in tasks) {
		if(tasks[e].getTaskDescription().indexOf("Supervisor Review") > -1 && tasks[e].getDispositionNote() == dispositionNote && tasks[e].getDisposition() == "Accepted") {
			return true;
		}
	}
	return false;
}
