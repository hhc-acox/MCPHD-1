
if (wfTask == 'Initial Processing' && (wfStatus == 'Complete Notice of Violation') && getTSIfieldValue('Reinspection Date', 'Initial Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Initial Processing'),AInfo['Assigned To']);
	}

if (wfTask == 'Initial Processing' && (wfStatus == 'Complete Notice of Violation') && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,20)),AInfo['Assigned To']);
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,20)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Notice of Violation' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,20)));
	}

if (wfTask == 'Additional Processing' && matches(wfStatus,'Complete Cntr Referral 18 Day','Complete Cntr Referral 21 Day') && getTSIfieldValue('Reinspection Date', 'Additional Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Additional Processing'),'ARUSIE');
	assignTask('Towing Inspection','ARUSIE');
	}

if (wfTask == 'Additional Processing' && matches(wfStatus,'Complete Cntr Referral 18 Day','Complete Cntr Referral 21 Day') && getTSIfieldValue('Reinspection Date', 'Additional Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,13)),'ARUSIE');
	editTaskSpecific('Reinspection','Reinspection Date',nextWorkDay(dateAdd(null,13)));
	assignTask('Towing Inspection','ARUSIE');
	}

if (wfTask == 'Towing Inspection' && wfStatus == 'Reinspection') {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Towing Inspection'),AInfo['Assigned To']);
	}

if (wfTask == 'Reinspection' && wfStatus == 'Reinspection') {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Reinspection'),AInfo['Assigned To']);
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Contractor Referral 48 Hours') {
	activateTask('Towing Inspection');
	assignTask('Towing Inspection','ARUSIE');
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Contractor Referral 48 Hours' && getTSIfieldValue('Reinspection Date', 'Initial Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Initial Processing'),'ARUSIE');
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Contractor Referral 48 Hours' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,20)),'ARUSIE');
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,20)));
	}