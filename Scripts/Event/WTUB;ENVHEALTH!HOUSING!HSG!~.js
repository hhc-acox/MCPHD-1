// WTUB;ENVHEALTH!HOUSING!HSG!~
if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Violation' && AInfo['GENERAL.Emergency'] == 'No') {
	editAppSpecific('GENERAL.Emergency', 'Yes');
	}
