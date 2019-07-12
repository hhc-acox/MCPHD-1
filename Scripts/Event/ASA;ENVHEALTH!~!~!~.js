//ASA;ENVHEALTH!~!~!~2
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
//The rest of the departments will have to be added to this section if they use the Census Tract method to assign Work.
//Also, new Census Tract tables need to be created for additional departments.
//Manually Entered EHS during case creation.  Method used if department has not been setup.
//if (AInfo['Assigned To'] != null) {
//	areaInspector = AInfo['Assigned To'];
//	}
//Housing EHS
if (matches(appTypeArray[1],'EHSM','HHECMSC','Housing') && (matches(appTypeArray[2],'HSG','TRA','VEH','INV','SEC'))) {
	areaInspector = lookup('Census - Housing EHS',censusTract); 
	logDebug('Inspector to Assign: '+areaInspector);
	comment('Inspector to Assign: '+areaInspector);
	//var aInsp = convertForAssignedTo(areaInspector);
	//editAppSpecific('Assigned To',aInsp);
	//editAppSpecific('Previous Assigned To',aInsp);
	//assignCap(areaInspector);
	}

//Healthy Homes EHS	
if (matches(appTypeArray[2],'LHH','LINV')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the Healthy Homes area Inspector: '+areaInspector);
	}

//Asthma EHS
if (matches(appTypeArray[2],'ASP')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the Asthma area Inspector is: '+areaInspector);
	}
	
//BedBugs EHS
if (matches(appTypeArray[2],'BBE')) {
	areaInspector = 'LLOBDELL';
	comment('the BedBugs area Inspector is: '+areaInspector);
	}
	
//CPS EHS
if (matches(appTypeArray[2],'CPS')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the Asthma area Inspector is: '+areaInspector);
	}
	
//Radon EHS
if (matches(appTypeArray[2],'RAD')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the Radon area Inspector is: '+areaInspector);
	}	

	//Senior Care EHS
if (matches(appTypeArray[2],'SCM')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the Senior Care area Inspector is: '+areaInspector);
	}	

//LINV EHS
if (AInfo['Assigned To'] == null && AInfo['Asthma'] == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the LINV is for Asthma: '+areaInspector);
	}
	
if (AInfo['Assigned To'] == null && AInfo['Bed Bugs'] == 'CHECKED') {
	areaInspector = 'LLOBDELL';
	comment('the LINV is for BedBugs: '+areaInspector);
	}

if (AInfo['Assigned To'] == null && AInfo['Suspect Lead'] == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']);
	comment('the LINV is for Lead: '+areaInspector);
	}

if (AInfo['Assigned To'] == null && AInfo['Consumer Product Safety'] == 'CHECKED') {
	areaInspector = 'QWILSON';
	comment('the LINV is for Consumer Product Safety: '+areaInspector);
	}
	
if (AInfo['Assigned To'] == null && AInfo['Healthy Homes'] == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the LINV is for Healthy Homes: '+areaInspector);
	}

if (AInfo['Assigned To'] == null && AInfo['Radon'] == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the LINV is for Radon: '+areaInspector);
	}

	if (AInfo['Assigned To'] == null && AInfo['Senior Care'] == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	comment('the LINV is for Senior Care: '+areaInspector);
	}

//if (AInfo['Assigned To'] != null) {
//	areaInspector = AInfo['Assigned To'];
//	}
	
//lwacht: 151016: updating so it doesn't throw an error
if(areaInspector) {
	var aInsp = convertForAssignedTo(areaInspector);
	editAppSpecific('Assigned To',aInsp);
	editAppSpecific('Previous Assigned To',aInsp);
	assignCap(areaInspector);
	}
//lwacht: 151016: end

//Inspection Scheduling - based on Inspection Type.  
// 7.5.17 chaas: no custom fields in any of these three GENERAL custom field subgroups for Mosquito Control

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
//Housing Initial Inspection scheduling
if (matches(appTypeArray[2],'VEH','HSG','TRA') && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('Initial Inspection',AInfo['Initial Inspection Date'],areaInspector);
	}
// 7.5.17 chaas: SEC subtype is not in MCPHD configuration
if (matches(appTypeArray[2],'SEC') && AInfo['Initial Inspection Date'] != null) {
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
// 7.5.17 chaas: SEC subtype is not in MCPHD configuration
if (matches(appTypeArray[2],'SEC') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('SEC Action','In Violation',theDate,'Resulted by Script');
	}
//Healthy Homes - result the Initial Inspection (LHH only)
if (matches(appTypeArray[2],'LHH') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('Initial Lead Inspection','In Violation',theDate,'Resulted by Script');
	}
//Set the address to the Application Name field on the record
HHC_GET_ADDRESS();

// 7.5.17 chaas: SEC subtype is not in MCPHD configuration
if (matches(appTypeArray[2],'VEH','HSG','SEC','TRA','LHH')) {
	updateAppStatus('In Violation','Initial status');
	}

if (areaInspector == null || areaInspector == 'undefined') {
	overrideMessage = 'The EHS Inspector could not be determined. Speak to a System Administrator to resolve the problem.<BR><BR>';
	}

//copy the gis object onto the record so that all gis-related functions work
// try{
//	copyParcelGisObjects(); 
//}catch (err){
//	logDebug("A JavaScript Error occurred: ASA:*/*/*/*: Copy GIS Object: " + err.message);
//	logDebug(err.stack)
//} 
 	