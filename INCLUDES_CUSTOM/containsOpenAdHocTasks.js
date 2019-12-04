function containsOpenAdHocTasks(capId) {
	var tasks = aa.workflow.getTasks(capId).getOutput();
	
	for(e in tasks) {
		if(tasks[e].getTaskDescription().indexOf("Supervisor Review") > -1 && tasks[e].getActiveFlag().equals("Y")) {
			return true;
		}
	}
	return false;
}
