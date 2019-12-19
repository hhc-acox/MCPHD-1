//WTUA;ENVHEALTH!HOUSING!VEH!~
var areaInspector = hhcgetUserByDiscipline('HSGVehicleInspections');
if (wfTask == 'Initial Processing' && matches(wfStatus, 'Complete Notice of Violation') && getTSIfieldValue('Reinspection Date', 'Initial Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Initial Processing'),AInfo['Assigned To']);
	}

if (wfTask == 'Initial Processing' && matches(wfStatus, 'Complete Notice of Violation') && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,20)),AInfo['Assigned To']);
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,20)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Notice of Violation' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,20)));
	}

if (wfTask == 'Additional Processing' && matches(wfStatus,'Contractor Referral 18 Day') && getTSIfieldValue('Reinspection Date', 'Additional Processing') == null) {
editTaskSpecific('Additional Processing','Reinspection Date',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Additional Processing' && matches(wfStatus,'Complete Cntr Referral 18 Day') && getTSIfieldValue('Reinspection Date', 'Additional Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,13)),areaInspector);
	editTaskSpecific('Additional Processing','Reinspection Date',nextWorkDay(dateAdd(null,13)));
	assignTask('Towing Inspection',areaInspector);
	}

if (wfTask == 'Additional Processing' && matches(wfStatus,'Complete Cntr Referral 18 Day') && getTSIfieldValue('Reinspection Date', 'Additional Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Additional Processing'),areaInspector);
	assignTask('Towing Inspection',areaInspector);
	}

if (wfTask == 'Towing Inspection' && wfStatus == 'Reinspection') {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Towing Inspection'),AInfo['Assigned To']);
	}

if (wfTask == 'Reinspection' && wfStatus == 'Reinspection') {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Reinspection'),AInfo['Assigned To']);
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Contractor Referral 48 Hours') {
	activateTask('Towing Inspection');
	assignTask('Towing Inspection',areaInspector);
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Complete Cntr Referral 48 Hrs' && getTSIfieldValue('Reinspection Date', 'Initial Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Initial Processing'),areaInspector);
	}
if (wfTask == 'Initial Processing' && wfStatus == 'Contractor Referral 48 Hours' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,20)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Complete Cntr Referral 48 Hrs' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,20)),areaInspector);
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,20)));
	}
