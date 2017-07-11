// ASA;EnvHealth!HHECMSC!CPS!~

var cptEHS;
var theDate;
var Haz;
var inVio;
var NHaz;
var recallComp;
var RCL;
cptEHS ='N';
theDate = '';
Haz = false;
inVio = false;
NHaz = false;
recallComp = false;
RCL=0;
// 7.5.17 chaas: lookup table missing in MCPHD configuration and NOT FOUND in City of Indy configuration
cptEHS=lookup('Census - CPT EHS', currentUserID);
if (cptEHS=='N') {
	// 7.5.17 chaas: User QWILSON not in MCPHD configuration
	currentUserID='QWILSON';
	}

editAppSpecific('GENERAL.Assigned To', currentUserID);
assignCap(currentUserID);
theDate = AInfo['GENERAL.Initial Inspection Date'].substring(6,10) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(0,2) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(3,5);
comment('The new date is ' + theDate);
if (tableHasRows('CONSUMERPRODUCTTESTING') && CONSUMERPRODUCTTESTING[0]['Resolved'] != null) { //verified ASIT
	for(x in CONSUMERPRODUCTTESTING) if(CONSUMERPRODUCTTESTING[x]['Resolved'].fieldValue.equals('No')) inVio = true;
	}

if (tableHasRows('CONSUMERPRODUCTTESTING') && CONSUMERPRODUCTTESTING[0]['Status'] != null) {
	for(y in CONSUMERPRODUCTTESTING) if(CONSUMERPRODUCTTESTING[y]['Status'].fieldValue.equals('No Hazard')) NHaz = true;
	}

if (tableHasRows('CONSUMERPRODUCTTESTING') && CONSUMERPRODUCTTESTING[0]['Status'] != null) {
	for(z in CONSUMERPRODUCTTESTING) if (CONSUMERPRODUCTTESTING[z]['Status'].fieldValue.equals('Hazard')) Haz = true;
	}

if (!isScheduled('CP Initial Inspection') && inVio) {
	scheduleInspectDate('CP Initial Inspection', AInfo['GENERAL.Initial Inspection Date'], currentUserID);
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process		
	closeTask('Routine Inspection');
	}

if (Haz && checkInspectionResult('CP Initial Inspection','Scheduled')) {
	resultInspection('CP Initial Inspection','Hazard', theDate,'Updated by Script');
	scheduleInspectDate('CP Follow-up Inspection', dateAdd(null,30),currentUserID);
	updateAppStatus('Hazard', 'Status by Script'); // verified app status
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process
	updateTask('Consumer Product Testing','Hazard','Updated by Script');
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process	
	activateTask('Consumer Product Testing');
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process		
	closeTask('Routine Inspection');
	}

if ((Haz==false) && NHaz && checkInspectionResult('CP Initial Inspection','Scheduled')) {
	resultInspection('CP Initial Inspection', 'No Hazard', theDate,'Updated by Script');
	scheduleInspectDate('CP Follow-up Inspection', dateAdd(null,90),currentUserID);
	updateAppStatus('No Hazard', 'Status by Script'); // verified app status
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process	
	updateTask('Consumer Product Testing', 'No Hazard','Updated by Script');
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process	
	activateTask('Consumer Product Testing');
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process		
	closeTask('Routine Inspection');
	}

if (tableHasRows('RECALLCOMPLIANCE') && RECALLCOMPLIANCE[0]['Resolved'].fieldValue != null) { // verified ASIT
	for(w in RECALLCOMPLIANCE) if (RECALLCOMPLIANCE[w]['Resolved'].fieldValue.equals('No')) recallComp = true;
	RCL=RECALLCOMPLIANCE.length;
	}

if (!isScheduled('CP Initial Recall Compliance') && recallComp) {
	scheduleInspectDate('CP Initial Recall Compliance', AInfo['GENERAL.Initial Inspection Date'], currentUserID);
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process		
	activateTask('Recall Compliance');
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process		
	updateTask('Recall Compliance', 'Compliant','Updated by Script');
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process		
	closeTask('Routine Inspection');
	}

if (recallComp && checkInspectionResult('CP Initial Recall Compliance','Scheduled')) {
	resultInspection('CP Initial Recall Compliance','Non-Compliant', theDate,'Updated by Script');
	scheduleInspectDate('CP Follow-up Recall Compliance', dateAdd(null,30),currentUserID);
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process		
	updateTask('Recall Compliance', 'Non-Compliant','Updated by Script');
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process		
	closeTask('Routine Inspection');
	}

if (AInfo['GENERAL.Education Provided'] == 'Yes') {
	scheduleInspectDate('CP Education', AInfo['GENERAL.Initial Inspection Date'], currentUserID);
	resultInspection('CP Education','Complete', theDate,'Updated by Script');
	editAppSpecific('GENERAL.Education Provided', 'No');
	}

if ((Haz==false) && (recallComp==false)) {
	// 7.5.17 chaas: Compliant is not an app status in H_CPT app status group. Completed, Hazard, No Hazard, Resolved are configured statuses
	updateAppStatus('Compliant', 'Status by Script');
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process	
	updateTask('Recall Compliance', 'Compliant','Updated by Script');
	}

if (inVio == false && recallComp == false) {
	scheduleInspectDate('CP Routine Inspection', dateAdd(null,90), currentUserID);
	// 7.5.17 chaas: no workflow task/status in H_CPT workflow process
	activateTask('CP Routine Inspection');
	// 7.5.17 chaas: Scheduled is not an app status in H_CPT app status group. Completed, Hazard, No Hazard, Resolved are configured statuses
	updateAppStatus('Scheduled', 'Status by Script');
	}
