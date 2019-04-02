//ASA;ENVHEALTH!~!~!~ 
//lwacht: 151016: updating so it doesn't throw an error
var areaInspector = '';
//lwacht: 151016: end
//Always set the Census Tract on the ASI General Screen
var censusTract = '';
censusTract = AInfo['ParcelAttribute.CensusTract'];
editAppSpecific('Census Tract',censusTract);

//Getting and Setting the EHS - to the Assigned To field and the Cap.

//The rest of the departments will have to be added to this section if they use the Census Tract method to assign Work.
//Also, new Census Tract tables need to be created for additional departments.
//Manually Entered EHS during case creation.  Method used if department has not been setup.
if (AInfo['Assigned To'] != null) {
	areaInspector = AInfo['Assigned To'];
	}
//Housing EHS
if (matches(appTypeArray[1],'EHSM','HHECMSC','HOUSING') && (!matches(appTypeArray[2],'LHH','BBE','CRT'))) {
	areaInspector = lookup('Census - Housing EHS',censusTract); 
	editAppSpecific('Assigned To',areaInspector);
	logDebug('Inspector to Assign: '+areaInspector);
	}

//Healthy Homes EHS
	comment('the LHH area: '+censusTract);	
if (matches(appTypeArray[2],'LHH')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	editAppSpecific('Assigned To',areaInspector);
	}
comment('the LHH area Inspector: '+areaInspector);
//BedBugs EHS
if (matches(appTypeArray[2],'BBE')) {
	// 7.5.17 chaas: the user LLOBDELL below is not yet setup in MCPHD configuration
	areaInspector = 'LLOBDELL';
	}
editAppSpecific('Assigned To',areaInspector);
//lwacht: 151016: updating so it doesn't throw an error
//assignCap(areaInspector);
if(areaInspector) assignCap(areaInspector);
//lwacht: 151016: end

//Inspection Scheduling  - based on Inspection Type.  Resulted with the assumption that violations exist for Housing case types.
// 7.5.17 chaas: no custom fields in any of these three GENERAL custom field subgroups for Mosquito Control
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
//Housing - result the Initial Inspection
if (matches(appTypeArray[2],'VEH','HSG','TRA') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('Initial Inspection','In Violation',theDate,'Resulted by Script');
	}
// 7.5.17 chaas: SEC subtype is not in MCPHD configuration
if (matches(appTypeArray[2],'SEC') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('SEC Action','In Violation',theDate,'Resulted by Script');
	}
//Healthy Homes - result the Initial Inspection
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
	copyParcelGisObjects(); 	