// WTUA;ENVHEALTH!HOUSING!VEH!~
if (wfTask == 'Initial Processing' && (wfStatus == 'Complete Notice of Violation') && AInfo['Reinspection Date (in 21 days if blank)'] != null && AInfo['Reinspection Date (in 21 days if blank)'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date (in 21 days if blank)'],AInfo['Assigned To']);
	}

if (wfTask == 'Initial Processing' && (wfStatus == 'Complete Notice of Violation') && (AInfo['Reinspection Date (in 21 days if blank)'] == null ||AInfo['Reinspection Date (in 21 days if blank)'] == '')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,20)),AInfo['Assigned To']);
	editTaskSpecific('Initial Processing','Reinspection Date (in 21 days if blank)',nextWorkDay(dateAdd(null,20)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Notice of Violation' && (AInfo['Reinspection Date (in 21 days if blank)'] == null || AInfo['Reinspection Date (in 21 days if blank)'] == '')) {
	editTaskSpecific('Initial Processing','Reinspection Date (in 21 days if blank)',nextWorkDay(dateAdd(null,20)));
	}

if (wfTask == 'Additional Processing' && (wfStatus == 'Complete Cntr Referral 18 Day' || wfStatus == 'Complete Cntr Referral 21 Day') && AInfo['Next Inspection'] != null && AInfo['Next Inspection'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Next Inspection'],'EMASON');
	assignTask('Towing Inspection','EMASON');
	}

if (wfTask == 'Additional Processing' && (wfStatus == 'Complete Cntr Referral 18 Day' || wfStatus == 'Complete Cntr Referral 21 Day') && (AInfo['Next Inspection'] == null ||AInfo['Next Inspection'] == '')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,13)),'EMASON');
	editTaskSpecific('Reinspection','Reinspection Date',nextWorkDay(dateAdd(null,13)));
	assignTask('Towing Inspection','EMASON');
	}

if (wfTask == 'Towing Inspection' && wfStatus == 'Reinspection') {
	scheduleInspectDate('Reinspection',AInfo['Reinspect on'],AInfo['Assigned To']);
	}

if (wfTask == 'Reinspection' && wfStatus == 'Reinspection') {
	scheduleInspectDate('Reinspection',AInfo['Schedule Reinspection On'],AInfo['Assigned To']);
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Contractor Referral 48 Hours') {
	assignTask('Towing Inspection','EMASON');
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Contractor Referral 48 Hours' && AInfo['Reinspection Date (in 21 days if blank)'] != null && AInfo['Reinspection Date (in 21 days if blank)'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date (in 21 days if blank)'],'EMASON');
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Contractor Referral 48 Hours' && (AInfo['Reinspection Date (in 21 days if blank)'] == null || AInfo['Reinspection Date (in 21 days if blank)'] == '')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,20)),'EMASON');
	editTaskSpecific('Initial Processing','Reinspection Date (in 21 days if blank)',nextWorkDay(dateAdd(null,20)));
	}
