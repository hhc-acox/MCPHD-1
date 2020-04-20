// WTUA;ENVHEALTH!HOUSING!INV!~
if (wfTask == 'Inspection' && wfStatus == 'Reinspect'&& getTSIfieldValue('Reinspection Date', 'Inspection') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Inspection'),AInfo['Assigned To']);
	}
if (wfTask == 'Inspection' && wfStatus == 'Reinspect' && getTSIfieldValue('Reinspection Date', 'Inspection') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,1)),AInfo['Assigned To']); 
	}
