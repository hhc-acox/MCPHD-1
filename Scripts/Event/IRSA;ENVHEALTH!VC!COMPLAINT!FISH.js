//IRSA;ENVHEALTH!VC!COMPLAINT!FISH.js
var resultDate = sysDate;
var resultComment = 'Updated by Script';
var inspStatus = 'Closed';
showDebug = true; 
showMessage = true; 
if (matches(inspResult,'Technician Completed')) {
	//assign to Mosquito Control Team Leader
	var userID = hhcgetUserByDiscipline('VCMosquito');
	assignInspection(inspId, userID);
}
if (matches(inspResult,'Supervisor Reviewed')) {
	//assign to Mosquito Control Biology
	var userID = hhcgetUserByDiscipline('VCBiology');
	assignInspection(inspId, userID);
}
if (matches(inspResult,'Lab Complete')) {
	CreateLarvicideSite_IfBreeding(capId);
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Closed");
}
if (matches(inspResult,'Unable to Inspect','No Access')) {
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Closed");
}
