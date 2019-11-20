//IRSA;EnvHealth!VC!Complaint!Larvicide.js
showDebug = true; 
showMessage = true;
var resultDate = sysDate;
var resultComment = 'Updated by Script';
var inspStatus = 'Closed'; 
	
if (matches(inspResult,'Technician Completed')) {
	//assign to Mosquito Control Team Leader
	var userID = hhcgetUserByDiscipline('VCMosquito');
	assignInspection(inspId, userID);
}
if (matches(inspResult,'Tech Complete - New Site','Tech Complete - Existing Site')) {
	//assign to Mosquito Control Biology
	var userID = hhcgetUserByDiscipline('VCBiology');
	assignInspection(inspId, userID);
	
	//create site if new
	if (matches(inspResult, 'Tech Complete - New Site')) {
		CreateLarvicideSite_IfBreeding(capId);	
	}
}
if (matches(inspResult,'Lab Complete')) {
	//CreateLarvicideSite_IfBreeding(capId);
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Closed");
}
if (matches(inspResult,'Unable to Inspect','No Access', 'Tech Complete - Not Breeding')) {
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Closed");
}
