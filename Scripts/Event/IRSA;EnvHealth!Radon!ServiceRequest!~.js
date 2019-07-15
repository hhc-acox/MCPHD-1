//IRSA:EnvHealth/Radon/ServiceRequest/*
var assignedTo = getAssignedToRecord();
if(checkInspectionResult('Radon Detector Placement','Unable to Place')) {
	scheduleInspectDate('Radon Detector Placement',nextWorkDay(dateAdd(null,2)),assignedTo);  //Needs a method to use the recheck date field to get the date
	}
if(checkInspectionResult('Radon Detector Placement','Unable to Place - Case Closed')) {
	updateTask('Initial Visit','Case Closed Unable to Place Detector','Updated by Script');
	}
if(checkInspectionResult('Radon Detector Placement','Placed')) {
	scheduleInspectDate('Radon Detector Retrieval',nextWorkDay(dateAdd(null,2)),assignedTo);  //Needs a method to use the recheck date field to get the date
	updateTask('Initial Visit','Placed Detector','Updated by Script');
	}
if(checkInspectionResult('Radon Detector Retrieval','Unable to Retrieve')) {
	scheduleInspectDate('Radon Detector Retrieval',nextWorkDay(dateAdd(null,2)),assignedTo);  //Needs a method to use the recheck date field to get the date
	}
if(checkInspectionResult('Radon Detector Retrieval','Retrieved')) {
	updateTask('Followup Visit','Picked up Detector','Updated by Script');
	}