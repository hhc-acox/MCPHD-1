// WTUB;ENVHEALTH!HOUSING!TRA!~
if (wfTask == 'Final Processing' && (wfStatus == 'Paid' || wfStatus == 'Finaled') && isTaskActive('Ticket')) {
	showMessage = true;
	comment('Cannot Close Case - TICKET task is still active');
	cancel = true;
	}

if (wfTask == 'Request EHSM Clean' && wfStatus == 'Complete Request EHSM Clean' && capStatus == 'EHSM Clean Pending') {
	showMessage = true;
	comment('An RCP Record may have been previously created.  Please check related records.');
	cancel = true;
	}
	
if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Notice of Violation' && AInfo['Emergency'] == 'No') {
	editAppSpecific('Emergency', 'Yes');
	}
