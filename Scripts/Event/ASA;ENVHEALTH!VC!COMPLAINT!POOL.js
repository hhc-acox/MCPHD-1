//ASA;ENVHEALTH!VC!COMPLAINT!POOL.js
var aZone = getVectorZone(capId);
var techByZone = lookup("GIS - Larvicide Techs",aZone); 
scheduleInspectDate("Vector Pool Complaint",nextWorkDay(dateAdd(null,0,"Scheduled by script")),techByZone);
editAppSpecific("Zone",aZone);
assignCap(techByZone);
updateAppStatus("Assigned");
