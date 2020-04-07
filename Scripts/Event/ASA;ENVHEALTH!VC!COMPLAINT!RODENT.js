//ASA;ENVHEALTH!VC!COMPLAINT!RODENT.js
var assignTo = getAssignedToRecord();
scheduleInspectDate("Rodents",nextWorkDay(dateAdd(null,0,"Scheduled by script")),assignTo);
