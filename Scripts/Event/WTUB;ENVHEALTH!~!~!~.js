// WTUB;ENVHEALTH!~!~!~ 
if (wfTask == 'Release of Interest' && wfStatus == 'Generate Release Notice' && balanceDue > 0) {
	showMessage = true;
	comment('All FEES must be paid before the Release of Interest');
	cancel = true;
	}

if (wfTask == 'Release of Interest' && matches(wfStatus,'Finaled','Billing Letter Release') && balanceDue > 0) {
	showMessage = true;
	comment('All FEES must be paid before the Case can be FINALED');
	cancel = true;
	}
