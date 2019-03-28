leadGrant = 'N'; showMessage = true;

if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation','Complete Emergency') && AInfo['Reinspection Date'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date'],AInfo['GENERAL.Assigned To']);
	}
	
if (wfTask == 'Initial Processing' && matches(wfStatus,'Complete Notice of Violation','Complete Emergency') && AInfo['Reinspection Date'] == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),AInfo['GENERAL.Assigned To']);
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Initial Processing' && wfStatus == 'Complete Lead No Hzd Found Ltr') {
	activateTask('Final Processing');
	}

if (wfTask == 'Initial Processing' && (wfStatus == 'Reinspection' || wfStatus == 'Complete Reinspection Ltr' || wfStatus == 'Complete Lead Clear Fail Ltr'|| wfStatus == 'Complete Lead Reinspection Ltr'|| wfStatus == 'Complete Next Action Court Ltr'|| wfStatus == 'Complete Lead Risk Ass Ltr') && AInfo['Reinspection Date'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Initial Processing' && leadGrant != 'Y' && (wfStatus == 'Reinspection' || wfStatus == 'Complete Reinspection Ltr' || wfStatus == 'Complete Lead Clear Fail Ltr' || wfStatus == 'Complete Lead Reinspection Ltr'|| wfStatus == 'Complete Next Action Court Ltr'|| wfStatus == 'Complete Lead Risk Ass Ltr') && (AInfo['Reinspection Date'] == null)) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),AInfo['GENERAL.Assigned To']);
	editTaskSpecific('Initial Processing','Reinspection Date',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Reinspection' && matches(wfStatus,'Reinspection','Complete Reinspection Ltr','Complete Next Action Court Ltr','Complete Lead Reinspection Ltr', 'Complete Lead Clear Fail Ltr','Complete Lead Add Vio Reinspection Ltr') && AInfo['Reinspection Date'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Reinspection' && leadGrant != 'Y' && matches(wfStatus,'Reinspection','Complete Reinspection Ltr','Complete Next Action Court Ltr','Complete Lead Reinspection Ltr', 'Complete Lead Clear Fail Ltr','Complete Lead Add Vio Reinspection Ltr') && AInfo['Reinspection Date'] == null) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,29)),AInfo['GENERAL.Assigned To']);
	editTaskSpecific('Reinspection','Reinspection Date',nextWorkDay(dateAdd(null,29)));
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Yearly Inspection') && AInfo['Reinspection Date'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Yearly Inspection') && (AInfo['Reinspection Date'] == null)) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,364)),lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']));
	editTaskSpecific('Final Processing','Reinspection Date',nextWorkDay(dateAdd(null,364)));
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && AInfo['Reinspection Date'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Final Processing' && (wfStatus == 'Permanent Injunction') && (AInfo['Reinspection Date'] == null)) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,179)),AInfo['GENERAL.Assigned To']);
	editTaskSpecific('Final Processing','Reinspection Date',nextWorkDay(dateAdd(null,179)));
	}

if (wfTask == 'Education Provided' && wfStatus == 'Reinspect' && AInfo['Reinspection Date'] != null) {
	scheduleInspectDate('Reinspection',AInfo['Reinspection Date'],AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Final Processing' && matches(wfStatus,'Complete Lead Clear Fail Ltr','Complete Lead Final Clr Ltr')) {
	assignTask('Final Processing',AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Education Provided' && matches(wfStatus,'Complete Lead No Hzd Found Ltr')) {
	assignTask('Education Provided',AInfo['GENERAL.Assigned To']);
	}

if (wfTask == 'Reinspection' && wfStatus == 'Court Case') {
comment(" appTypeArray[0] - "+ appTypeArray[0]+"appTypeArray[1] - "+appTypeArray[1]+" appTypeArray[2] - "+appTypeArray[2]+" appTypeArray[3] - "+appTypeArray[3]);
	HHC_CREATE_COURT();
	}
if (wfTask == 'Reinspection'  && matches(wfStatus,'Court Case')) {
	activateTask('Final Processing');
	}