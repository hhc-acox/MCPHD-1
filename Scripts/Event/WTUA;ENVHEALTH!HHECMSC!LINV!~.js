//WTUA;ENVHEALTH!HHECMSC!LINV!~.js
//Create LHH Initial Lead Inspection
if (wfTask == 'Case Intake' && wfStatus == 'Complete' && AInfo['Suspect Lead'] == 'CHECKED' && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('Initial Lead Inspection',AInfo['Initial Inspection Date'],AInfo['Assigned To']);
	}
if (wfTask == 'Case Intake' && wfStatus == 'Complete' && AInfo['Suspect Lead'] == 'CHECKED' && AInfo['Initial Inspection Date'] == null) {
	scheduleInspectDate('Initial Lead Inspection',nextWorkDay(dateAdd(null,1)),AInfo['Assigned To']);
	}
//Create BBE Initial Lead Inspection
if (wfTask == 'Case Intake' && wfStatus == 'Complete' && AInfo['Bed Bugs'] == 'CHECKED' && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('Initial Inspection',AInfo['Initial Inspection Date'],AInfo['Assigned To']);
	}
if (wfTask == 'Case Intake' && wfStatus == 'Complete' && AInfo['Bed Bugs'] == 'CHECKED' && AInfo['Initial Inspection Date'] == null) {
	scheduleInspectDate('Initial Inspection',nextWorkDay(dateAdd(null,1)),AInfo['Assigned To']);
	}