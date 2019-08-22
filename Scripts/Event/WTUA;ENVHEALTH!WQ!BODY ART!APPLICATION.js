//WTUA;EnvHealth!WQ!Body Art!APPLICATION.js
var assignedInspector = '';
assignedInspector = HHC_getCapAssignment(); //gets the person assigned to the record.
if (wfTask == 'Application Intake' && matches(wfStatus,'Withdrawn','Denied')) {
	updateTask('Close','Closed');
	closeTask('Close');
	//move to the close step with the status of closed
	}

if (wfTask == 'Application Intake' && matches(wfStatus,'Accepted')) {
	updateTask('Inspection','Pending');
	scheduleInspectDate('Initial',nextWorkDay(dateAdd(null,0)),assignedInspector);
	}
if (wfTask == 'Inspection' && matches(wfStatus,'Re-Inspection Required')) {
	assignTask('Inspection',assignedInspector);
	}
if (wfTask == 'Inspection' && matches(wfStatus,'Complete')) {
	assignTask('Inspection',assignedInspector);
	updateTask('Issuance','Ready for Issuance Fees Due');
	}
