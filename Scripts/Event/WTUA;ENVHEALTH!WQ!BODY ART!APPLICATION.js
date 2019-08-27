//WTUA;EnvHealth!WQ!Body Art!APPLICATION.js
var assignedInspector = '';
assignedInspector = HHC_getCapAssignment(); //gets the person assigned to the record.
if (wfTask == 'Application Intake' && matches(wfStatus,'Withdrawn','Denied')) {
	closeTask('Close','Closed','Action by Script','Application withdrawn or denied');
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
if (wfTask == 'Issuance' && matches(wfStatus,'Withdrawn','Denied')) {
	closeTask('Close','Closed','Action by Script','Application withdrawn or denied');
	//move to the close step with the status of closed
	}
if (wfTask == 'Issuance' && matches(wfStatus,'Issued')) {
	closeTask('Close','Closed','Action by Script', 'License Issued' );
	//Create a Body Art License Function
	//HHC_CREATE_BODYART_LICENSE();
	//Create a copy inspections and guidesheets function
 	var parId = getParent();
	var saveId = capId;
	assignedInspector = HHC_getCapAssignment(capId);
	assignCap(assignedInspector,parId);
	copyOwner(capId, parId); 
	capId = parId;
	scheduleInspectDate('Initial',nextWorkDay(dateAdd(null,89)),assignedInspector);
	capId = saveId;
	}
