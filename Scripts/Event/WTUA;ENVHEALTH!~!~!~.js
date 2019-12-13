addSupervisorReview(capId, "WORKFLOW", null, wfTask, wfStatus);

if(wfTask.indexOf('Supervisor Review') > -1 && wfStatus == 'Accepted') {
    continueSupervisorReview(wfTask, wfNote);
}
