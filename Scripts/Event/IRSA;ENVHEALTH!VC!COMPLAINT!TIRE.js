//IRSA;ENVHEALTH!VC!COMPLAINT!TIRE.js
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
	gName = "VC_TIRE";
	gItem = "INSPECTION INFORMATION";
	asiGroup = "VC_TIR_CKLST";
	asiSubGroup = "INSPECTION INFORMATION";
	HHC_CreateLarvicideSite_IfBreeding_OtherGS(gName,gItem,asiGroup,asiSubGroup);
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Closed");
}
if (matches(inspResult,'Unable to Inspect','No Access')) {
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Closed");
}
