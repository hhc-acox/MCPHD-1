// WTUA;ENVHEALTH!HOUSING!HSG!~
leadGrant = 'N';
if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation') && AInfo['Reinspection Date (in 30 days if blank)'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date (in 30 days if blank)'],AInfo['Assigned To']);
	}

if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation') && AInfo['Reinspection Date (in 30 days if blank)'] == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),AInfo['Assigned To']); 
	editTaskSpecific('Initial Processing','Reinspection Date (in 30 days if blank)',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Notice of Violation' && (AInfo['Reinspection Date (in 30 days if blank)'] == null || AInfo['Reinspection Date (in 30 days if blank)'] == '')) {
	editTaskSpecific('Initial Processing','Reinspection Date (in 30 days if blank)',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Suspect Lead') {
	scheduleInspectDate('Initial Lead Inspection',nextWorkDay(dateAdd(null,1)),lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']));
	}

if (wfTask == 'Lead Case' && leadGrant !='Y' && wfStatus == 'Lead Abated') {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']));
	}

if (wfTask == 'Lead Case' && leadGrant !='Y' && (wfStatus == 'Lead Reinspection' || wfStatus == 'Lead Reinspection Letter' || wfStatus == 'Next Action Court Date Letter' || wfStatus == 'Lead Risk Assessment Letter' || wfStatus == 'Complete Lead Add Vio Reinspection Ltr') && AInfo['Schedule Lead Reinspection On'] != null) {
	scheduleInspectDate('Reinspection',nextWorkDay(AInfo['Schedule Lead Reinspection On']),lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']));
	}

if (wfTask == 'Lead Case' && leadGrant !='Y' && (wfStatus == 'Lead Reinspection' || wfStatus == 'Lead Reinspection Letter' || wfStatus == 'Next Action Court Date Letter' || wfStatus == 'Lead Risk Assessment Letter' || wfStatus == 'Complete Lead Add Vio Reinspection Ltr') && AInfo['Schedule Lead Reinspection On'] == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']));
	editTaskSpecific('Lead Case','Schedule Lead Reinspection On',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Lead Case' && leadGrant =='Y' && wfStatus == 'Lead Abated') {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),currentUserID);
	}

if (wfTask == 'Lead Case' && leadGrant =='Y' && (wfStatus == 'Lead Reinspection' || wfStatus == 'Lead Reinspection Letter' || wfStatus == 'Next Action Court Date Letter' || wfStatus == 'Lead Risk Assessment Letter' || wfStatus == 'Complete Lead Add Vio Reinspection Ltr') && AInfo['Schedule Lead Reinspection On'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Schedule Lead Reinspection On'],currentUserID);
	}

if (wfTask == 'Lead Case' && leadGrant =='Y' && (wfStatus == 'Lead Reinspection' || wfStatus == 'Lead Reinspection Letter' || wfStatus == 'Next Action Court Date Letter'|| wfStatus == 'Lead Risk Assessment Letter' || wfStatus == 'Complete Lead Add Vio Reinspection Ltr') && AInfo['Schedule Lead Reinspection On'] == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),currentUserID);
	editTaskSpecific('Lead Case','Schedule Lead Reinspection On',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Reinspection' && matches(wfStatus,'Reinspection','Complete Reinspection Ltr','Complete Next Action Court Ltr','Complete Lead Reinspection Ltr','Complete Add Vio Reinspection Ltr') && AInfo['Schedule Reinspection On'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Schedule Reinspection On'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Reinspection' && matches(wfStatus,'Reinspection','Complete Reinspection Ltr','Complete Next Action Court Ltr','Complete Lead Reinspection Ltr','Complete Add Vio Reinspection Ltr') && AInfo['Schedule Reinspection On'] == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),AInfo['Assigned To']);
	editTaskSpecific('Reinspection','Schedule Reinspection On',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Yearly Inspection') && AInfo['Schedule Yearly Inspection On'] != null && AInfo['Schedule Yearly Inspection On'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Schedule Yearly Inspection On'],AInfo['Assigned To']);
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Yearly Inspection') && (AInfo['Schedule Yearly Inspection On'] == null || AInfo['Schedule Yearly Inspection On'] == '')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,364)),lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']));
	editTaskSpecific('Final Processing','Schedule Yearly Inspection On',nextWorkDay(dateAdd(null,364)));
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && AInfo['Schedule PI Inspection On'] != null && AInfo['Schedule PI Inspection On'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Schedule PI Inspection On'],AInfo['Assigned To']);
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && (AInfo['Schedule PI Inspection On'] == null || AInfo['Schedule PI Inspection On'] == '')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,179)),AInfo['Assigned To']);
	editTaskSpecific('Final Processing','Schedule PI Inspection On',nextWorkDay(dateAdd(null,179)));
	}

if (wfTask == 'Recurring Inspection' && wfStatus == 'Reinspect' && AInfo['Schedule Recurring Inspection On'] != null && AInfo['Schedule Recurring Inspection On'] != '') {
	scheduleInspectDate('Reinspection',AInfo['Schedule Recurring Inspection On'],AInfo['Assigned To']);
	}

if (wfTask == 'Reinspection' && matches(wfStatus,'Complete Reinspection Ltr','Complete Next Action Court Ltr','Complete Lead Reinspection Ltr','Complete Add Vio Reinspection Ltr')) {
	assignTask('Reinspection',AInfo['Assigned To']);
	}

if (wfTask == 'Final Processing' && matches(wfStatus,'Complete Lead Clear Fail Ltr','Complete Lead Final Clr Ltr')) {
	assignTask('Final Processing',AInfo['Assigned To']);
	}

if (wfTask == 'Recurring Inspection' && matches(wfStatus,'Complete Lead No Hzd Found Ltr')) {
	assignTask('Recurring Inspection',AInfo['Assigned To']);
	}

if (wfTask == 'Reinspection' && matches(wfStatus,'Compliance - Dust Taken')) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,13)),AInfo['Assigned To']);
	editTaskSpecific('Reinspection','Schedule Reinspection On',nextWorkDay(dateAdd(null,13)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Violation' && (AInfo['Reinspection Date (in 24 Hours if blank)'] == null || AInfo['Reinspection Date (in 24 Hours if blank)'] == '')) {
	editTaskSpecific('Initial Processing','Reinspection Date (in 24 Hours if blank)',nextWorkDay(dateAdd(null,0)));
	editTaskSpecific('Initial Processing','Override','Yes');
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Emergency Violation' && AInfo['Reinspection Date (in 24 Hours if blank)'] != null && AInfo['Reinspection Date (in 24 Hours if blank)'] != '' && AInfo['Override'] == 'No') {
	editTaskSpecific('Initial Processing','Override','Yes');
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Complete Emergency') {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date (in 24 Hours if blank)'],AInfo['GENERAL.Assigned To']);
	}

if (matches(wfTask, 'Final Processing', 'Recurring Inspection','Reinspection') && matches(wfStatus,'In Compliance', 'Non-Compliance/Case Closed', 'Closed','Finaled') && balanceDue > 0) {
	updateTask('Final Processing','Fees Outstanding','Updated by Script');
	updateAppStatus('Fees Outstanding','Status Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (matches(wfTask, 'Final Processing', 'Recurring Inspection','Reinspection') && matches(wfStatus,'In Compliance', 'Non-Compliance/Case Closed', 'Closed','Finaled') && balanceDue == 0) {
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (wfTask == 'Reinspection' && wfStatus == 'Court Case') {
	
//replaced branch(ES_VIOLATIONS_LOOP_COURT)
ES_VIOLATIONS_LOOP_COURT();
	}

if (wfTask == 'Reinspection' && wfStatus == 'Court Case') {
	
//replaced branch(ES_HHC_ODYSSEY_PROCESS)
ES_HHC_ODYSSEY_PROCESS();
	crtConAry=nextNameArr;
	}

if (wfTask == 'Reinspection' && wfStatus == 'Court Case') {
	concnt = y;
	
//replaced branch(ES_CREATE_CRT_CASES)
ES_CREATE_CRT_CASES();
	}
