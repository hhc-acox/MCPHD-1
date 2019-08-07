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
if (matches(inspResult,'Supervisor Reviewed')) {
	//assign to Mosquito Control Biology
	var userID = hhcgetUserByDiscipline('VCBiology');
	assignInspection(inspId, userID);
}
if (matches(inspResult,'Lab Complete')) {
	gName = "VC_LARVICIDE";
	gItem = "SITE INFORMATION";
	asiGroup = "VC_LVCCKLST";
	asiSubGroup = "LARVICIDE";
	asiLabel = "Is Site Breeding";
	var myResult = getGuidesheetASIValue(inspId,gName,gItem,asiGroup,asiSubGroup, asiLabel);
	copyParcelGisObjects4XAPO(); 
    var aZone = getVectorZone(capId); 
	var techByZone = lookup("GIS - Larvicide Techs",aZone); 
	if(myResult=="Yes")	{
	scheduleInspectDate("Larvicide",nextWorkDay(dateAdd(null,13)),techByZone);
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Active");
	}
}
if (matches(inspResult,'Unable to Inspect','No Access')) {
	aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
	updateAppStatus("Active");
}
