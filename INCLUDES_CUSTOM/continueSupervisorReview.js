function continueSupervisorReview(wfTask, wfNote) {
	if (wfTask == 'Supervisor Review Workflow') {
		var wfNoteSpl = wfNote.split('-');

		if (wfStatus == 'Accepted') {
		    closeTask(wfNoteSpl[0], wfNoteSpl[1], 'Closed by Script', wfNoteSpl[1]);
		} else if (wfStatus == 'Rework') {
            editTaskComment(wfNoteSpl[0], wfComment);
            var ehs = getAssignedToWkfl(wfNoteSpl[0], capId);

            if (ehs) {
                sendNotificationForSupervisorReviewWkfl(ehs.getUserID(), wfComment, 'EMSE_SUPREV_WKFL_EHS', wfNoteSpl[0], wfNoteSpl[1]);
            }
		}
    }
    
    if (wfTask == 'Supervisor Review Inspection' && wfStatus == 'Rework') {
        var wfNoteSpl = wfNote.split('-');

        var inspResultObj = aa.inspection.getInspections(capId);
	    if (inspResultObj.getSuccess())
		{
            var inspList = inspResultObj.getOutput();
            for (xx in inspList) {
                if (wfNoteSpl[wfNoteSpl.length - 1] == inspList[xx].getIdNumber()) {
                    var ehs = inspList[xx].getInspector();

                    if (ehs) {
                        sendNotificationForSupervisorReviewInspection(ehs.getUserID(), wfComment, 'EMSE_SUPREV_INSP_EHS', inspList[xx].getIdNumber());
                    }
                }
            }
        }	
    }
}
