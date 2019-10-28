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
//Create LHH Reinspection and create letter
if (wfTask == "Inspection" && matches(wfStatus,"Complete Notice of Violation","Complete Lead Risk Ass Ltr") && getTSIfieldValue('Reinspection Date', 'Inspection') != null) {
	inspId = scheduleInspectDateReturnInspID("Reinspection",getTSIfieldValue('Reinspection Date', 'Inspection'),AInfo["Assigned To"]);
	copyLeadViolations(inspId);
}

if (wfTask == "Inspection" && matches(wfStatus,"Complete Notice of Violation","Complete Lead Risk Ass Ltr") && getTSIfieldValue('Reinspection Date', 'Inspection') == null) {
	inspId = scheduleInspectDateReturnInspID("Reinspection",nextWorkDay(dateAdd(null,29)),AInfo["Assigned To"]);
	copyLeadViolations(inspId);
	editTaskSpecific("Inspection","Reinspection Date",nextWorkDay(dateAdd(null,29)));
	}
//Create BBE Reinspection and create letter
	if (wfTask == "Inspection" && matches(wfStatus,"Complete BedBug Notice of Violation") && getTSIfieldValue('Reinspection Date', 'Inspection') != null) {
		inspId = scheduleInspectDateReturnInspID("Reinspection",getTSIfieldValue('Reinspection Date', 'Inspection'),AInfo["Assigned To"]);
		copyLeadViolations(inspId);
	}

if (wfTask == "Inspection" && matches(wfStatus,"Complete BedBug Notice of Violation") && getTSIfieldValue('Reinspection Date', 'Inspection') == null) {
	inspId = scheduleInspectDateReturnInspID("Reinspection",nextWorkDay(dateAdd(null,29)),AInfo["Assigned To"]);
	copyLeadViolations(inspId);
	editTaskSpecific("Inspection","Reinspection Date",nextWorkDay(dateAdd(null,29)));
	}
