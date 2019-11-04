//WTUA;ENVHEALTH!HHECMSC!LINV!~.js
//Create LHH Initial Lead Inspection

if (wfTask == 'Case Intake' && wfStatus == 'Complete' && AInfo['Bed Bugs'] == 'CHECKED' && AInfo['Initial Inspection Date'] == null) {
	scheduleInspectDate('Initial Inspection',nextWorkDay(dateAdd(null,1)),AInfo['Assigned To']);
	}
//Create LHH Reinspection and create letter
	if (wfTask == "Inspection" && matches(wfStatus,"Complete Notice of Violation","Complete Lead Risk Ass Ltr") && getTSIfieldValue('Reinspection Date', 'Inspection') != null) {
	scheduleInspectDate("Reinspection",getTSIfieldValue('Reinspection Date', 'Inspection'),AInfo["Assigned To"]);
	}

if (wfTask == "Inspection" && matches(wfStatus,"Complete Notice of Violation","Complete Lead Risk Ass Ltr") && getTSIfieldValue('Reinspection Date', 'Inspection') == null) {
	scheduleInspectDate("Reinspection",nextWorkDay(dateAdd(null,29)),AInfo["Assigned To"]);
	editTaskSpecific("Inspection","Reinspection Date",nextWorkDay(dateAdd(null,29)));
	}
//Create BBE Reinspection and create letter
	if (wfTask == "Inspection" && matches(wfStatus,"Complete BedBug Notice of Violation") && getTSIfieldValue('Reinspection Date', 'Inspection') != null) {
	scheduleInspectDate("Reinspection",getTSIfieldValue('Reinspection Date', 'Inspection'),AInfo["Assigned To"]);
	}

if (wfTask == "Inspection" && matches(wfStatus,"Complete BedBug Notice of Violation") && getTSIfieldValue('Reinspection Date', 'Inspection') == null) {
	scheduleInspectDate("Reinspection",nextWorkDay(dateAdd(null,29)),AInfo["Assigned To"]);
	editTaskSpecific("Inspection","Reinspection Date",nextWorkDay(dateAdd(null,29)));
}
	
if (wfTask == "Inspection" && matches(wfStatus,"Complete") && AInfo['Suspect Lead'] == 'CHECKED')  {
		editAppSpecific('LHH Created',dateAdd(null,0));
		updateAppStatus('Finaled','Child Case Created');
		branchTask('Create Case','Case Created','Action by Script','');
		newChildID = createChild('EnvHealth','HHECMSC','LHH','NA','');
		comment('New child app id = '+ newChildID);
		HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
		aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
		copyAppSpecific(newChildID);
		updateAppStatus('In Violation','Created from LINV',newChildID);
		copyOwner(capId, newChildID);
		assignCap(AInfo['Assigned To'],newChildID);
		editAppSpecific('INV Case',capIDString,newChildID);
		HHC_GET_ADDRESS_FOR_CHILD();
	}
