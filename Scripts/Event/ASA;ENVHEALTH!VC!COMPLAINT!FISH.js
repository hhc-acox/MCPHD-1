//ASA;ENVHEALTH!VC!COMPLAINT!FISH
var aZone = getVectorZone(capId);
var userID = hhcgetUserByDiscipline('VCFish');
scheduleInspectDate("Fish",nextWorkDay(dateAdd(null,0,"Scheduled by script")),userID);
editAppSpecific("Zone",aZone);
assignCap(userID);
updateAppStatus("Assigned");
