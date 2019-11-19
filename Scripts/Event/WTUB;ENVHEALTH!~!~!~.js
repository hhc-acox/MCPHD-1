if (doesTaskHaveActiveSupervisorReview(wfTask)) {
	comment("Supervisor Review in process");
	cancel = true;
}