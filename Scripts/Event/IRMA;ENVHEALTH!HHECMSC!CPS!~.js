//IRMA;ENVHEALTH!HHECMSC!CPS!~
var assignedTo = getAssignedToRecord();
if(checkInspectionResult('CP Initial Recall Inspection','Hazard - 1 month')) {
	scheduleInspectDate('CP Follow-up Recall Compliance',nextWorkDay(dateAdd(null,30)),assignedTo); 
	}
if(checkInspectionResult('CP Initial Recall Inspection','Hazard - 6 month')) {
	scheduleInspectDate('CP Follow-up Recall Compliance',nextWorkDay(dateAdd(null,180)),assignedTo); 
	}
if(checkInspectionResult('CP Follow-up Recall Compliance','Hazard - 1 month')) {
	scheduleInspectDate('CP Follow-up Recall Compliance',nextWorkDay(dateAdd(null,30)),assignedTo); 
	}
if(checkInspectionResult('CP Follow-up Recall Compliance','Hazard - 6 month')) {
	scheduleInspectDate('CP Follow-up Recall Compliance',nextWorkDay(dateAdd(null,180)),assignedTo); 
	}
if(checkInspectionResult('CP Routine Inspection','Hazard - 1 month')) {
	scheduleInspectDate('CP Routine Inspection',nextWorkDay(dateAdd(null,30)),assignedTo); 
	}
if(checkInspectionResult('CP Routine Inspection','Hazard - 6 month')) {
	scheduleInspectDate('CP Routine Inspection',nextWorkDay(dateAdd(null,180)),assignedTo); 
	}
if(checkInspectionResult('CP Routine Inspection','Hazard - 1 month')) {
	scheduleInspectDate('CP Routine Inspection',nextWorkDay(dateAdd(null,30)),assignedTo); 
	}
if(checkInspectionResult('CP Routine Inspection','Hazard - 6 month')) {
	scheduleInspectDate('CP Routine Inspection',nextWorkDay(dateAdd(null,180)),assignedTo); 
	}