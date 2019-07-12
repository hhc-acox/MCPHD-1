//ASA;ENVHEALTH!VC!COMPLAINT!LARVICIDE.js
var aZone = getVectorZone(capId);
var techByZone = lookup("GIS - Larvicide Techs",aZone); 
scheduleInspectDate("Larvicide",nextWorkDay(dateAdd(null,0,"Scheduled by script")),techByZone);
editAppSpecific("Zone",aZone);
assignCap(techByZone);
updateAppStatus("Assigned");
