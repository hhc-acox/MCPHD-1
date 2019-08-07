//IRSA;ENVHEALTH!VC!COMPLAINT!ADULTICIDE.js
var resultDate = sysDate;
var resultComment = 'Updated by Script';
var inspStatus = 'Closed';
if (!matches(inspResult,'Received')) {
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Closed");
}
