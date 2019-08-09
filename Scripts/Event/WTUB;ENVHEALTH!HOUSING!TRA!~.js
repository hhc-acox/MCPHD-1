// WTUB;ENVHEALTH!HOUSING!TRA!~
if (wfTask == 'Final Processing' && (wfStatus == 'Paid' || wfStatus == 'Finaled') && isTaskActive('Ticket')) {
	showMessage = true;
	comment('Cannot Close Case - TICKET task is still active');
	cancel = true;
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Paid' || wfStatus == 'Finaled') && isTaskActive('EC Clean Occupied')) {
	showMessage = true;
	comment('Cannot Close Case - EC Clean Occupied task is still active');
	cancel = true;
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Paid' || wfStatus == 'Finaled') && isTaskActive('EC Clean Vacant')) {
	showMessage = true;
	comment('Cannot Close Case - EC Clean Vacant task is still active');
	cancel = true;
	}

if (wfTask == 'Final Processing' && matches(wfStatus,'Finaled','Billing Letter Release') && balanceDue != 0) {
	showMessage = true;
	comment('Cannot Close Case - Fees are still due');
	cancel = true;
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Notice of Violation' && AInfo['Emergency'] == 'No') {
	editAppSpecific('Emergency', 'Yes');
	}