function HHC_getAssignedToWorkflow(wfTask){
	
		var workflowResult = aa.workflow.getTaskItems(capId, wfTask,"","","","");
			if (workflowResult.getSuccess())
				wfObj = workflowResult.getOutput();
					for (var i in wfObj) {
						fTask = wfObj[i];
						if (fTask.getTaskDescription().toUpperCase().equals(wfTask.toUpperCase())) {
							var taskUserObj = fTask.getTaskItem().getAssignedStaff();
							return taskUserObj;
			}

}
}