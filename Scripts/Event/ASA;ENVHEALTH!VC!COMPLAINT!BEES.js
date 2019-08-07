//ASA:ENVHEALTH/VC/COMPLAINT/BEES
var resultDate = sysDate;
var resultComment = 'Updated by Script';
var inspStatus = 'Closed';
var aZone = getVectorZone(capId);
var techByZone = hhcgetUserByDiscipline('VCBees');
scheduleInspectDate("Bees Inspection",nextWorkDay(dateAdd(null,0,"Scheduled by script")),techByZone);
editAppSpecific("Zone",aZone);
assignCap(techByZone);
updateAppStatus("Assigned");
if (!matches(inspResult,'',' ', null,'undefined')) {
aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
updateAppStatus("Closed");
}
