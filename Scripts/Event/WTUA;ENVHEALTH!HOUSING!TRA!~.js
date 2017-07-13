// WTUA;ENVHEALTH!HOUSING!TRA!~
var myEC = true;
if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation','Complete Emergency NOV') && AInfo['Reinspection Date (in 14 days if blank)'] != null && AInfo['Reinspection Date (in 14 days if blank)'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date (in 14 days if blank)'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation','Complete Emergency NOV') && (AInfo['Reinspection Date (in 14 days if blank)'] == null || AInfo['Reinspection Date (in 14 days if blank)'] == '')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,13)),AInfo['GENERAL.Assigned To']), editTaskSpecific('Initial Processing','Reinspection Date (in 14 days if blank)',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Notice of Violation' && (AInfo['Reinspection Date (in 14 days if blank)'] == null || AInfo['Reinspection Date (in 14 days if blank)'] == '')) {
	editTaskSpecific('Initial Processing','Reinspection Date (in 14 days if blank)',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Notice of Violation'  && AInfo['Reinspection Date (in 14 days if blank)'] == null) {
	editTaskSpecific('Initial Processing','Reinspection Date (in 14 days if blank)',nextWorkDay(dateAdd(null,0)));
	}

if (wfTask == 'Reinspection' && wfStatus == 'Reinspection' && AInfo['Reinspect On']!= null) {
	scheduleInspectDate('Reinspection',AInfo['Reinspect On'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Additional Processing' && (wfStatus == 'Reinspection' || wfStatus == 'Complete Reinspection Letter' || wfStatus == 'Complete Ticket' || wfStatus == 'Complete Add Vio Reinspection Ltr') && AInfo['Schedule Reinspection On'] != null && AInfo['Schedule Reinspection On'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Schedule Reinspection On'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Additional Processing' && (wfStatus == 'Reinspection' || wfStatus == 'Complete Reinspection Letter' || wfStatus == 'Complete Add Vio Reinspection Ltr') && (AInfo['Schedule Reinspection On'] == null || AInfo['Schedule Reinspection On'] == '')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,13)),AInfo['GENERAL.Assigned To']);
	editTaskSpecific('Additional Processing','Schedule Reinspection On',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Additional Processing' && AInfo['GENERAL.Owner Occupied'] == 'Yes') {
	cleanType = 'Occupied';
	}

if (wfTask == 'Additional Processing' && AInfo['GENERAL.Owner Occupied'] == 'No') {
	cleanType = 'Not Occupied';
	}

if (wfTask == 'Additional Processing' && wfStatus == 'EC Clean Occupied') {
	activateTask('EC Clean Occupied');
	assignTask('EC Clean Occupied',lookup('Census - Team Leader',AInfo['ParcelAttribute.CensusTract']));
	}

if (wfTask == 'Additional Processing' && wfStatus == 'EC Clean Vacant') {
	activateTask('EC Clean Vacant');
	assignTask('EC Clean Vacant',lookup('Census - Team Leader',AInfo['ParcelAttribute.CensusTract']));
	}

if (wfTask == 'Additional Processing' && wfStatus == 'Ticket' && AInfo['Ticket Due Date (in 14 days if blank)'] != null && AInfo['Ticket Due Date (in 14 days if blank)'] != '') {
	
//start replaced branch: CMN;HHC!TRA!~!~AddTicketFee
 {
var tFee='H_T';
tFee+=AInfo['Ticket Fee'];
if (!feeExists(tFee,'INVOICED')) {
	updateFee(tFee,'H_TRA','FINAL',1,'Y');
	}

}
//end replaced branch: CMN;HHC!TRA!~!~AddTicketFee
	activateTask('Ticket');
	editTaskDueDate('Ticket',AInfo['Ticket Due Date (in 14 days if blank)']);
	assignTask('Ticket',AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Additional Processing' && wfStatus == 'Ticket' && (AInfo['Ticket Due Date (in 14 days if blank)'] == null || AInfo['Ticket Due Date (in 14 days if blank)'] == '')) {
	
//start replaced branch: CMN;HHC!TRA!~!~AddTicketFee
 {
var tFee='H_T';
tFee+=AInfo['Ticket Fee'];
if (!feeExists(tFee,'INVOICED')) {
	updateFee(tFee,'H_TRA','FINAL',1,'Y');
	}

}
//end replaced branch: CMN;HHC!TRA!~!~AddTicketFee
	activateTask('Ticket');
	editTaskDueDate('Ticket',nextWorkDay(dateAdd(null,13)));
	assignTask('Ticket',AInfo['GENERAL.Assigned To']);
	editTaskSpecific('Additional Processing','Ticket Due Date (in 14 days if blank)',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && AInfo['Schedule PI Inspection On'] != null && AInfo['Schedule PI Inspection On'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Schedule PI Inspection On'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && (AInfo['Schedule PI Inspection On'] == null || AInfo['Schedule PI Inspection On'] == '')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,179)),AInfo['GENERAL.Assigned To']);
	editTaskSpecific('Final Processing','Schedule PI Inspection On',nextWorkDay(dateAdd(null,179)));
	}

if (wfTask == 'Recurring Inspection' && wfStatus == 'Reinspect' && AInfo['Schedule Recurring Inspection On'] != null && AInfo['Schedule Recurring Inspection On'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Schedule Recurring Inspection On'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Additional Processing' && matches(wfStatus,'Complete Reinspection Letter','Complete Ticket','Complete Add Vio Reinspection Ltr')) {
	assignTask('Additional Processing',AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'EC Clean Occupied' && matches(wfStatus,'Complete Billing Letter') && capStatus == 'Final Processing') {
	updateAppStatus('Closed/Fees Outstanding','Billing Letter Complete-Status Updated by Script');
	}

if (wfTask == 'EC Clean Vacant' && matches(wfStatus,'Complete Billing Letter') && capStatus == 'Final Processing') {
	updateAppStatus('Closed/Fees Outstanding','Billing Letter Complete-Status Updated by Script');
	}

if (matches(wfTask,'EC Clean Occupied') && matches(wfStatus,'Canceled') && isTaskActive('Additional Processing') !=true && isTaskActive('Ticket') != true &&  capStatus != 'Court' && balanceDue == 0) {
	deactivateTask('EC Clean Occupied');
	branchTask('Final Processing', 'Finaled','Updated by Script','Updated by Script');
	updateAppStatus('Finaled','Status Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (matches(wfTask,'EC Clean Vacant') && matches(wfStatus,'Canceled') && isTaskActive('Additional Processing') !=true && isTaskActive('Ticket') != true &&  capStatus != 'Court' && balanceDue == 0) {
	deactivateTask('EC Clean Vacant');
	branchTask('Final Processing', 'Finaled','Updated by Script','Updated by Script');
	updateAppStatus('Finaled','Status Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (matches(wfTask,'Reinspection','Additional Processing','Final Processing','Recurring Inspection','EC Clean Vacant') && matches(wfStatus,'In Compliance', 'Non-Compliance/Case Closed','Cleaned by Other','Cleaned No Billing','Finaled', 'Closed') && balanceDue > 0) {
	updateTask('Final Processing','Closed/Fees Outstanding','Updated by Script');
	activateTask('Final Processing');
	updateAppStatus('Closed/Fees Outstanding','Status Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (matches(wfTask,'Reinspection','Additional Processing','Final Processing','Recurring Inspection','EC Clean Vacant') && matches(wfStatus,'In Compliance', 'Non-Compliance/Case Closed','Cleaned by Other','Cleaned No Billing','Finaled', 'Closed') && balanceDue == 0) {
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (matches(wfTask,'EC Clean Occupied') && matches(wfStatus,'Cleaned by Other') && isTaskActive('Additional Processing') ==true && isTaskActive('Ticket') == true) {
	deactivateTask('EC Clean Occupied');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (matches(wfTask,'EC Clean Vacant') && matches(wfStatus,'Cleaned by Other') && isTaskActive('Additional Processing') ==true && isTaskActive('Ticket') == true) {
	deactivateTask('EC Clean Vacant');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('EC Clean Vacant') == true || isTaskActive('EC Clean Occupied') == true) {
	myEC = false;
	}

if (myEC && wfTask == 'Additional Processing' && wfStatus == 'Court Case') {
	
//replaced branch(ES_VIOLATIONS_LOOP_COURT)
ES_VIOLATIONS_LOOP_COURT();
	}

if (wfTask == 'Additional Processing' && wfStatus == 'Court Case') {
	
//replaced branch(ES_HHC_ODYSSEY_PROCESS)
ES_HHC_ODYSSEY_PROCESS();
	crtConAry=nextNameArr;
	concnt = y;
	}

if (wfTask == 'Additional Processing' && wfStatus == 'Court Case') {
	
//replaced branch(ES_CREATE_CRT_CASES)
ES_CREATE_CRT_CASES();
	}
