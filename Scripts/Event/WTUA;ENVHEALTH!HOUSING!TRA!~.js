var assignedEHS = '';
assignedEHS = convertForAssignedTo(AInfo['Assigned To']);
comment('assignedEHS is '+assignedEHS);

if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation','Complete Emergency NOV') && getTSIfieldValue('Reinspection Date', 'Initial Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Initial Processing'),assignedEHS);
	}

if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation','Complete Emergency NOV') && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,13)),assignedEHS); 
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Notice of Violation' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Notice of Violation' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,0)));
	}

if (wfTask == 'Reinspection' && wfStatus == 'Reinspection' && getTSIfieldValue('Reinspection Date', 'Reinspection') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Reinspection'),assignedEHS);
	}
	
if (wfTask == 'Reinspection' && wfStatus == 'In Violation') {
	activateTask('Additional Processing');
	}
	
if (wfTask == 'Reinspection' && wfStatus == 'In Violation – Ticket Issued') {
	activateTask('Additional Processing');
	}
//Additional Processing--------------------------------------------------------------------------------------------Additional Processing
if (wfTask == 'Additional Processing' && matches(wfStatus,'Reinspection', 'Complete Reinspection Letter', 'Complete Ticket', 'Complete Add Vio Reinspection Ltr') && getTSIfieldValue('Reinspection Date', 'Additional Processing') != null) {
	scheduleInspectDate('Reinspection', getTSIfieldValue('Reinspection Date', 'Additional Processing'),assignedEHS);
	}

if (wfTask == 'Additional Processing' && matches(wfStatus,'Reinspection', 'Complete Reinspection Letter', 'Complete Ticket', 'Complete Add Vio Reinspection Ltr') && getTSIfieldValue('Reinspection Date', 'Additional Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,13)),assignedEHS);
	editTaskSpecific('Additional Processing','Reinspection Date',nextWorkDay(dateAdd(null,13)));
	}
	
if (wfTask == 'Additional Processing' && wfStatus == 'Request EHSM Clean') {
	var areaTeamLeader = '';
	var censusTract = '';
	censusTract = AInfo['ParcelAttribute.CensusTract'];
	areaTeamLeader = lookup('Census - Team Leader',censusTract); 
	activateTask('Request EHSM Clean');
	assignTask('Request EHSM Clean',areaTeamLeader);
	}
	
if (wfTask == 'Additional Processing' && wfStatus == 'Request Admin Court Order') {
	HHC_CREATE_COURT();
	editAppSpecific('Admin Court Order','Yes',newChildID);
	activateTask('Requesting Admin Court Order');
	deactivateTask('Additional Processing'); //Requested on the UAT issues list by Juli Gonyou item # 403
	//Assign to EHS Team Leader
	var areaTeamLeader = '';
	var censusTract = '';
	censusTract = AInfo['ParcelAttribute.CensusTract'];
	areaTeamLeader = lookup('Census - Team Leader',censusTract); 
	assignTask('Requesting Admin Court Order',areaTeamLeader);
	}

if (wfTask == 'Additional Processing' && wfStatus == 'Ticket' && AInfo['Ticket Due Date'] != null) {
	addTrashTicketFee();
	activateTask('Ticket');
	editTaskDueDate('Ticket',AInfo['Ticket Due Date']);
	assignTask('Ticket',assignedEHS);
	}

if (wfTask == 'Additional Processing' && wfStatus == 'Ticket' && (AInfo['Ticket Due Date'] == null)) {
	addTrashTicketFee();
	activateTask('Ticket');
	editTaskDueDate('Ticket',nextWorkDay(dateAdd(null,13)));
	assignTask('Ticket',assignedEHS);
	editTaskSpecific('Additional Processing','Ticket Due Date',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Additional Processing' && matches(wfStatus,'Complete Reinspection Letter','Complete Ticket','Complete Add Vio Reinspection Ltr')) {
	assignTask('Additional Processing',assignedEHS);
	}	
//Request Admin Court Order
if (wfTask == 'Requesting Admin Court Order' && wfStatus == 'Request EHSM Clean') {
	var areaTeamLeader = '';
	var censusTract = '';
	censusTract = AInfo['ParcelAttribute.CensusTract'];
	areaTeamLeader = lookup('Census - Team Leader',censusTract); 
	activateTask('Request EHSM Clean');
	assignTask('Request EHSM Clean',areaTeamLeader);
	deactivateTask('Requesting Admin Court Order');
	}

if (wfTask == 'Request EHSM Clean' && wfStatus == 'Complete Request EHSM Clean') {
	HHC_CREATE_RCP_CASE();
	}
	
if (matches(wfTask, 'Additional Processing','Requesting Admin Court Order') && wfStatus == 'Request Towing') {
	activateTask('Request Towing');
	//notify towing company by email -no longer need the towing notification for TRA just on VEH as of 02/04/2020 - rdv
	//sendTowingEmail(); no longer need the towing notification for TRA just on VEH as of 02/04/2020 - rdv
	deactivateTask('Requesting Admin Court Order');
}
//no longer using the status or task 'Request EHSM Clean and Towing' as of 02/04/2020 - rdv
// if (matches(wfTask,'Additional Processing','Requesting Admin Court Order') && wfStatus == 'Request EHSM Clean and Towing') {
	// //notify towing company by email - must update the function with the correct email.
	// //As of 12/17/2019, Juli says EHSM should send the email for towing when the clean and towing are both requested.
	// //sendTowingEmail();
	// var areaTeamLeader = '';
	// var censusTract = '';
	// censusTract = AInfo['ParcelAttribute.CensusTract'];
	// areaTeamLeader = lookup('Census - Team Leader',censusTract); 
	// activateTask('Request EHSM Clean');
	// //activateTask('Request Towing'); //As of 12/17/2019, Juli says EHSM should send the email for towing.  They should also deal with the Towing request so it does not need to be active for Housing on the TRA case.
	// deactivateTask('Requesting Admin Court Order');
	// assignTask('Request EHSM Clean',areaTeamLeader);
// }
//no longer using the status or task 'Request EHSM Clean and Towing' as of 02/04/2020 - rdv

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && getTSIfieldValue('Reinspection Date', 'Final Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Final Processing'),assignedEHS);
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && getTSIfieldValue('Reinspection Date', 'Final Processing') == null ) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,179)),assignedEHS);
	editTaskSpecific('Final Processing','Reinspection Date',nextWorkDay(dateAdd(null,179)));
	}

if (wfTask == 'Recurring Inspection' && wfStatus == 'Reinspect' && getTSIfieldValue('Reinspection Date', 'Final Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Final Processing'),assignedEHS);
	}
//Closing the Case-----------------------------------------------------------------------------------------------------------------Closing the Case
if (matches(wfTask,'Reinspection','Additional Processing','Final Processing','Recurring Inspection','Request EHSM Clean','Requesting Admin Court Order') && matches(wfStatus,'In Compliance', 'Non-Compliance/Case Closed','Cleaned by Other','Cleaned No Billing','Finaled', 'Closed') && balanceDue > 0) {
	//updateTask('Final Processing','Closed/Fees Outstanding','Updated by Script'); Not changed
	activateTask('Final Processing');
	updateAppStatus('Final Processing','Status Updated by Script');
	HHC_VIOLATIONS_LOOP();
	}

if (matches(wfTask,'Reinspection','Additional Processing','Final Processing','Recurring Inspection', 'Request EHSM Clean','Requesting Admin Court Order') && matches(wfStatus,'In Compliance', 'Non-Compliance/Case Closed','Cleaned by Other','Finaled', 'Closed') && balanceDue == 0) {
	HHC_VIOLATIONS_LOOP(); //Sets all the violation statuses to Final
	}

if (wfTask == 'Additional Processing' && wfStatus == 'Court Case') {
	HHC_VIOLATIONS_LOOP_COURT(); //Sets all the violation statuses to Court
	}

if (wfTask == 'Additional Processing' && wfStatus == 'Court Case') {
	HHC_CREATE_COURT(); //Creates a Court Case
	activateTask('Final Processing');
	updateAppStatus('Final Processing','Status Updated by Script');
	deactivateTask('Additional Processing');
	}

if (wfTask == 'Ticket' && (wfStatus == 'Paid' || wfStatus == 'Voided')) {
	activateTask('Final Processing');
	deactivateTask('Additional Processing');
	}
