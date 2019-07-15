//ASA;ENVHEALTH!~!~!~
//lwacht: 151016: updating so it doesn't throw an error
showDebug = true;
showMessage = true;
var areaInspector = '';
//lwacht: 151016: end
//Always set the Census Tract on the ASI General Screen
var censusTract = '';
censusTract = AInfo['ParcelAttribute.CensusTract'];
editAppSpecific('Census Tract',censusTract);
comment('the census tract is: '+censusTract);
//Getting and Setting the EHS - to the Assigned To field and the Case.
//The rest of the departments will have to be added to this section in the future.

//Housing EHS
if (matches(appTypeArray[2],'HSG','TRA','VEH','INV')) {
	areaInspector = lookup('Census - Housing EHS',censusTract); 
	logDebug('Inspector to Assign: '+areaInspector);
	}
	
//SEC Assigment
if (matches(appTypeArray[3],'SEC')) {
	areaInspector = lookup('Census - Housing EHS',censusTract); 
	logDebug('Inspector to Assign: '+areaInspector);
	}

//Healthy Homes EHS	
if (matches(appTypeArray[2],'LHH','LINV')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the Healthy Homes area Inspector: '+areaInspector);
	}

//Asthma EHS
if (matches(appTypeArray[2],'ASP')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCAsthma');
	comment('the Asthma area Inspector is: '+areaInspector);
	}
	
//BedBugs EHS
if (matches(appTypeArray[2],'BBE')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
	comment('the BedBugs area Inspector is: '+areaInspector);
	}
	
//CPS EHS
if (matches(appTypeArray[2],'CPS')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCConsumerProductSafety');
	comment('the CPS area Inspector is: '+areaInspector);
	}
	
//Radon EHS
if (matches(appTypeArray[1],'Radon')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCRadon');
	updateTask('Inspection','Reinspections','Updated by Script');
	comment('the Radon area Inspector is: '+areaInspector);
	}	

//Senior Care EHS
if (matches(appTypeArray[2],'SCM')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCSeniorCare');
	comment('the Senior Care area Inspector is: '+areaInspector);
	}	

//LINV EHS
if (AInfo['Asthma'] == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCAsthma');
	comment('the LINV is for Asthma: '+areaInspector);
	}
	
if (AInfo['Bed Bugs'] == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
	comment('the LINV is for BedBugs: '+areaInspector);
	}

if (AInfo['Assigned To'] == null && AInfo['Suspect Lead'] == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']);
	comment('the LINV is for Lead: '+areaInspector);
	}

if (AInfo['Consumer Product Safety'] == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCConsumerProductSafety');
	comment('the LINV is for Consumer Product Safety: '+areaInspector);
	}
	
if (AInfo['Healthy Homes'] == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the LINV is for Healthy Homes: '+areaInspector);
	}

if (AInfo['Radon'] == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCRadon');
	comment('the LINV is for Radon: '+areaInspector);
	}

	if (AInfo['Senior Care'] == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCSeniorCare');
	comment('the LINV is for Senior Care: '+areaInspector);
	}
//lwacht: 151016: updating so it doesn't throw an error
if(areaInspector) {
	var aInsp = convertForAssignedTo(areaInspector);
	editAppSpecific('Assigned To',aInsp);
	editAppSpecific('Previous Assigned To',aInsp);
	assignCap(areaInspector);
	}
//lwacht: 151016: end
//LINV Initial Inspection Scheduling set for next business day and case assignments.
if (matches(appTypeArray[2],'LINV')) {
	updateAppStatus('Open','Initial status');
	editAppSpecific('Initial Inspection Date',nextWorkDay());
	scheduleInspectDate('Initial Lead Inspection',nextWorkDay(),areaInspector);
	}
//Get the Initial Inspection Date and reformat it for resulting the Initial Inspection
if (matches(appTypeArray[2],'VEH','HSG','SEC','TRA','LHH')) {
	theDate = AInfo['Initial Inspection Date'].substring(6,10) + '-' + AInfo['Initial Inspection Date'].substring(0,2) + '-' + AInfo['Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}
//Get the SEC Initial Inspection Date Information
if (matches(appTypeArray[3],'SEC')) {
	theDate = AInfo['Initial Inspection Date'].substring(6,10) + '-' + AInfo['Initial Inspection Date'].substring(0,2) + '-' + AInfo['Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}
//Housing Initial Inspection scheduling
if (matches(appTypeArray[2],'VEH','HSG','TRA') && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('Initial Inspection',AInfo['Initial Inspection Date'],areaInspector);
	}
if (matches(appTypeArray[3],'SEC') && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('SEC Action',AInfo['Initial Inspection Date'],areaInspector);
	}
//Healthy Homes Initial Inspection scheduling
if (matches(appTypeArray[2],'LHH') && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('Initial Lead Inspection',AInfo['Initial Inspection Date'],areaInspector);
	}
//Inspection Resulting - Resulted with the assumption that violations exist for Housing case types.
//Housing - result the Initial Inspection
if (matches(appTypeArray[2],'VEH','HSG','TRA') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('Initial Inspection','In Violation',theDate,'Resulted by Script');
	}
if (matches(appTypeArray[3],'SEC') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('SEC Action','In Violation',theDate,'Resulted by Script');
	}
//Healthy Homes - result the Initial Inspection (LHH only)
if (matches(appTypeArray[2],'LHH') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('Initial Lead Inspection','In Violation',theDate,'Resulted by Script');
	}
//Consumer Product Safety
if (matches(appTypeArray[2],'CPS') && AInfo['Recall']=='Yes') {
	scheduleInspectDate('CP Initial Recall Inspection',nextWorkDay(dateAdd(null,0)),areaInspector);
	}
if (matches(appTypeArray[2],'CPS') && AInfo['Recall']=='No') {
	scheduleInspectDate('CP Routine Inspection',nextWorkDay(dateAdd(null,0)),areaInspector);
	}
//Set the address to the Application Name field on the record
HHC_GET_ADDRESS();

if (matches(appTypeArray[2],'VEH','HSG','TRA','LHH')) {
	updateAppStatus('In Violation','Initial Status');
	}
	
if (matches(appTypeArray[3],'SEC')) {
	updateAppStatus('In Violation','Initial Status');
	}

if (areaInspector == null || areaInspector == 'undefined') {
	overrideMessage = 'The EHS Inspector could not be determined. Speak to a System Administrator to resolve the problem.<BR><BR>';
	}	
