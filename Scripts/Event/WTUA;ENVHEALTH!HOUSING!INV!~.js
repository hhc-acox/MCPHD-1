// WTUA;ENVHEALTH!HOUSING!INV!~
if (wfTask == 'Inspection' && wfStatus == 'Reinspect' && AInfo['Mosquito Control'] != 'Yes' && AInfo['Reinspection Date'] != null && AInfo['Reinspection Date'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date'],AInfo['Assigned To']);
	}

if (wfTask == 'Inspection' && wfStatus == 'Reinspect' && AInfo['Mosquito Control'] == 'Yes' && AInfo['Reinspection Date'] != null && AInfo['Reinspection Date'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date'],'LLOBDELL');
	}
