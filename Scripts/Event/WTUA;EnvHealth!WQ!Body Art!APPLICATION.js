//WTUA;EnvHealth!WQ!Body Art!APPLICATION.js
var assignedInspector = '';
assignedInspector = HHC_getCapAssignment(); //gets the person assigned to the record.
if (wfTask == 'Application Intake' && matches(wfStatus,'Withdrawn','Denied')) {
	updateTask('Close','Closed');
	closeTask('Close');
	//move to the close step with the status of closed
	}

if (wfTask == 'Application Intake' && matches(wfStatus,'Accepted')) {
	scheduleInspectDate('Body Art Initial Inspection',nextWorkDay(dateAdd(null,0)),assignedInspector);
	}
