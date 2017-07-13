// WTUB;ENVHEALTH!HOUSING!HSG!~
if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Violation' && AInfo['Emergency'] == 'No') {
	editAppSpecific('Emergency', 'Yes');
	}
