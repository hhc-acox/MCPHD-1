//IRMA:EnvHealth/Radon/ServiceRequest/*
var assignedTo = getAssignedToRecord();
var theDate = hhcgetInspRecheckDate(capId,inspId);
if(checkInspectionResult('Radon Detector Placement','Unable to Place') && theDate == null) {
	scheduleInspectDate('Radon Detector Placement',nextWorkDay(dateAdd(null,0)),assignedTo);  //When there is no Recheck Date
}
if(checkInspectionResult('Radon Detector Placement','Unable to Place') && theDate != null) {
	scheduleInspectDate('Radon Detector Placement',theDate,assignedTo);  //When there is a Recheck Date
}
if(checkInspectionResult('Radon Detector Placement','Unable to Place - Case Closed')) {
	updateTask('Initial Visit','Case Closed Unable to Place Detector','Updated by Script');
	}
if(checkInspectionResult('Radon Detector Placement','Placed') && theDate == null) {
	scheduleInspectDate('Radon Detector Retrieval',nextWorkDay(dateAdd(null,0)),assignedTo);  //When there is no Recheck Date
	updateTask('Initial Visit','Placed Detector','Updated by Script');
}
if(checkInspectionResult('Radon Detector Placement','Placed') && theDate != null) {
	scheduleInspectDate('Radon Detector Retrieval',theDate,assignedTo);  //When there is a Recheck Date
	updateTask('Initial Visit','Placed Detector','Updated by Script');
}
if(checkInspectionResult('Radon Detector Placement','Unable to Retrieve') && theDate == null) {
	scheduleInspectDate('Radon Detector Retrieval',nextWorkDay(dateAdd(null,0)),assignedTo);  //When there is no Recheck Date
}
if(checkInspectionResult('Radon Detector Placement','Unable to Retrieve') && theDate != null) {
	scheduleInspectDate('Radon Detector Retrieval',theDate,assignedTo);  //When there is a Recheck Date
}
if(checkInspectionResult('Radon Detector Retrieval','Retrieved')) {
	updateTask('Followup Visit','Picked up Detector','Updated by Script');
	}
