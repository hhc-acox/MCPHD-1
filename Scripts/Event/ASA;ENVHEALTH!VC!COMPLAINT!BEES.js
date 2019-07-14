//ASA;ENVHEALTH!VC!COMPLAINT!BEES.js
copyParcelGisObjects();
var aZone = getVectorZone(capId);
var techByZone = hhcgetUserByDiscipline('VCBees');
scheduleInspectDate("Bees Inspection",nextWorkDay(dateAdd(null,0,"Scheduled by script")),techByZone);
editAppSpecific("Zone",aZone);
assignCap(techByZone);
updateAppStatus("Assigned");
