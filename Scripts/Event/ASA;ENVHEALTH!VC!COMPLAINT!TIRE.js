//ASA:ENVHEALTH/VC/COMPLAINT/TIRE
var aZone = getVectorZone(capId);
var techByZone = hhcgetUserByDiscipline('VCTires');
scheduleInspectDate("Tires",nextWorkDay(dateAdd(null,0,"Scheduled by script")),techByZone);
editAppSpecific("Zone",aZone);
assignCap(techByZone);
updateAppStatus("Assigned");
