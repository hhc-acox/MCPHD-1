function continueSupervisorReview(wfTask, wfNote) {
	if (wfTask == 'Supervisor Review Workflow') {
		var wfNoteSpl = wfNote.split('-');
		updateTask(wfNoteSpl[0], wfNoteSpl[1], "Set by Script", "Set by Script");
	}
}
