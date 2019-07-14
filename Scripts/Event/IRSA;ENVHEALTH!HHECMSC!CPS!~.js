//IRSA;ENVHEALTH!HHECMSC!CPS!~
var assignedTo = getAssignedToRecord();
if(checkInspectionResult('Initial Inspection','Complete')) {
	scheduleInspectDate('Follow-up',nextWorkDay(dateAdd(null,2)),assignedTo);  //Needs a method to use the recheck date field to get the date
	updateTask('Case Intake','Follow-up','Updated by Script');
}