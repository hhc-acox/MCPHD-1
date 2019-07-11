// WTUA;ENVHEALTH!HOUSING!INV!~
if (wfTask == 'Inspection' && wfStatus == 'Reinspect'&& getTSIfieldValue('Reinspection Date', 'Inspection') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Inspection'),assignedEHS);
	}
if (wfTask == 'Inspection' && wfStatus == 'Reinspect' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,1)),AInfo['Assigned To']); 
	}
