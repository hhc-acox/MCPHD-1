if (doesTaskHaveActiveSupervisorReview(wfTask)) {
	showMessage = true;
	comment("Supervisor Review in process");
	cancel = true;
}