function continueSupervisorReview(wfTask, wfNote) {
	if (wfTask == 'Supervisor Review Workflow') {
		var wfNoteSpl = wfNote.split('-');
		closeTask(wfNoteSpl[0], wfNoteSpl[1], 'Closed by Script', 'Closed by Script');
	}
}
