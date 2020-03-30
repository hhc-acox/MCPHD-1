showDebug = true;
showMessage = true;

try{
	addSupervisorReview(capId, "WORKFLOW", null, wfTask, wfStatus);
        if(wfTask.indexOf('Supervisor Review') > -1) {
            logDebug('Continuing Supervisor Review');
            continueSupervisorReview(wfTask, wfNote);
        }
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:*/*/*/*: Supervisor Review: " + err.message);
	logDebug(err.stack)
}
