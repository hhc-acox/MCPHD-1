function containsDuplicateAdHocTask(capId, dispositionNote) {
	var tasks = aa.workflow.getTasks(capId).getOutput();
	
	for(e in tasks) {
		if(tasks[e].getTaskDescription().indexOf("Supervisor Review") > -1 && tasks[e].getDispositionNote().equals(dispositionNote)) {
			return true;
		}
	}
	return false;
}
