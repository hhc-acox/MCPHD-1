//IRSA;ENVHEALTH!VC!COMPLAINT!ADULTICIDE.js
if (!matches(inspResult,'Received')) {
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Closed");
}
