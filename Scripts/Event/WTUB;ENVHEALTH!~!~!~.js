if (doesRecordHaveActiveSupervisorReview()) {
	showMessage = true;
	comment("Supervisor Review in process");
	cancel = true;
}

/*
if (!isSupervisor(currentUserID) && wfTask.indexOf("Supervisor Review > -1")){
        showMessage = true;
	comment("Only Supervisor's can update Supervisor Review tasks");
	cancel = true;
}
*/
