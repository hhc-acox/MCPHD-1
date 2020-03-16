function continueSupervisorReview(wfTask, wfNote) {
	if (wfTask == 'Supervisor Review Workflow') {
		var wfNoteSpl = wfNote.split('-');

		if (wfStatus == 'Accepted') {
		    closeTask(wfNoteSpl[0], wfNoteSpl[1], 'Closed by Script', 'Closed by Script');
		} else if (wfStatus == 'Rework') {
		    editTaskComment(wfNoteSpl[0], wfComment);
		}
	}
}
