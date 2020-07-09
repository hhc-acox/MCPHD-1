if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation') && getTSIfieldValue('Reinspection Date', 'Initial Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Initial Processing'),AInfo['Assigned To']);
	}

if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation') && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),AInfo['Assigned To']); 
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Notice of Violation' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,29)));
	}
	
if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Violation' && getTSIfieldValue('Reinspection Date', 'Initial Processing') == null) {
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,0)));
	editTaskSpecific('Initial Processing','Override','Yes');
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Violation' && getTSIfieldValue('Reinspection Date', 'Initial Processing') != null && AInfo['Override'] == 'No') {
	editTaskSpecific('Initial Processing','Override','Yes');
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Complete Emergency') {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Initial Processing'),AInfo['Assigned To']);
	}

if (wfTask == 'Reinspection' && matches(wfStatus,'Complete Reinspection Ltr','Complete Next Action Court Ltr','Complete Add Vio Reinspection Ltr','Reinspection') && getTSIfieldValue('Reinspection Date', 'Reinspection') != null) {
	assignTask('Reinspection',AInfo['Assigned To']);
        scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Reinspection'),AInfo['Assigned To']);
	}

if (wfTask == 'Reinspection' && matches(wfStatus,'Complete Reinspection Ltr','Complete Next Action Court Ltr','Complete Add Vio Reinspection Ltr','Reinspection') && getTSIfieldValue('Reinspection Date', 'Reinspection') == null) {
	assignTask('Reinspection',AInfo['Assigned To']);
        scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),AInfo['Assigned To']);
	editTaskSpecific('Reinspection','Reinspection Date',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && getTSIfieldValue('Reinspection Date', 'Final Processing') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Final Processing'),AInfo['Assigned To']);
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && getTSIfieldValue('Reinspection Date', 'Final Processing') == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,179)),AInfo['Assigned To']);
	editTaskSpecific('Final Processing','Reinspection Date',nextWorkDay(dateAdd(null,179)));
	}

if (wfTask == 'Recurring Inspection' && wfStatus == 'Reinspect' && getTSIfieldValue('Reinspection Date', 'Recurring Inspection') != null) {
	scheduleInspectDate('Reinspection',getTSIfieldValue('Reinspection Date', 'Recurring Inspection'),AInfo['Assigned To']);
	}

if (matches(wfTask, 'Final Processing', 'Recurring Inspection','Reinspection') && matches(wfStatus,'In Compliance', 'Non-Compliance/Case Closed', 'Closed','Finaled') && balanceDue > 0) {
	updateTask('Final Processing','Fees Outstanding','Updated by Script');
	updateAppStatus('Fees Outstanding','Status Updated by Script');
	HHC_VIOLATIONS_LOOP();
	}

if (matches(wfTask, 'Final Processing', 'Recurring Inspection', 'Reinspection') && matches(wfStatus,'In Compliance', 'Non-Compliance/Case Closed', 'Closed','Finaled') && balanceDue == 0) {
	HHC_VIOLATIONS_LOOP();
	}

if (wfTask == 'Reinspection' && wfStatus == 'Court Case') {
	HHC_VIOLATIONS_LOOP_COURT();
	}

if (wfTask == 'Reinspection' && wfStatus == 'Court Case') {
	HHC_CREATE_COURT();
	}
