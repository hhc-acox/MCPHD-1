function containsAcceptedOrPendingAdHocTaskForDisposition(capId, dispositionNote) {
	var tasks = aa.workflow.getTasks(capId).getOutput();
	
	for(e in tasks) {
		if(tasks[e].getTaskDescription().indexOf("Supervisor Review") > -1 && tasks[e].getDispositionNote() == dispositionNote && (tasks[e].getDisposition() == "Accepted" || tasks[e].getDisposition() == "In Progress" || tasks[e].getDisposition() == "" || tasks[e].getDisposition() == null)) {
			return true;
		}
	}
	return false;
}
