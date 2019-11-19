function doesTaskHaveActiveSupervisorReview(taskName, inspID) {
	var retValue = false;
	if (taskName && !inspID) {
		var tasks = aa.workflow.getTasks(capId).getOutput();
		for(var x in tasks){
			thisTask = tasks[x];
			thisTaskDesc = "" + thisTask.getTaskDescription();
			if(thisTaskDesc == "Supervisor Review Workflow") {
				if (thisTask.getActiveFlag() == "Y" && thisTask.getCompleteFlag() == "N") {
					taskNote = thisTask.getDispositionNote();
					if (taskNote && taskNote != "") {
						pieces = taskNote.split("-");
						if (pieces && pieces.length == 2) {
							tName = pieces[0];
							if (tName == taskName) retValue = true;
						}
					}
				}
			}
			if(thisTaskDesc == "Supervisor Review Inspection") {
				if (thisTask.getActiveFlag() == "Y" && thisTask.getCompleteFlag() == "N") {
					taskNote = thisTask.getDispositionNote();
					if (taskNote && taskNote != "") {
						pieces = taskNote.split("-");
						if (pieces && pieces.length == 4) {
							iID = pieces[3];
							if (iID == inspID) retValue = false;  // does not prevent inspection actions for now
						}
					}
				}
			}
		}
	}
	return retValue
}