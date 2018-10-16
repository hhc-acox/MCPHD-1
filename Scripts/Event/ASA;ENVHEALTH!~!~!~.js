//ASA;ENVHEALTH!~!~!~ 
//lwacht: 151016: updating so it doesn't throw an error
var areaInspector = false;
//lwacht: 151016: end
editAppSpecific('GENERAL.Census Tract',AInfo['ParcelAttribute.CensusTract']);
if (matches(appTypeArray[1],'EHSM','HHECMSC','HOUSING') && (!matches(appTypeArray[2],'LHH','BBE','CRT'))) {
	// 7.5.17 chaas: Bravnish created all lookup tables in MCPHD configuration
	//areaInspector = lookup('Census - Housing EHS',AInfo['ParcelAttribute.CensusTract']); 
	//Appears that Parcel Attributes are not yet configured
	//Manually entered value of 310103 for Census Tract which assigns it to CHAAS for testing purposes (first row of lookup table)
	areaInspector = lookup('Census - Housing EHS',AInfo['GENERAL.Census Tract']); 
	logDebug('Inspector to Assign: '+areaInspector);
	}
	
// 7.5.17 chaas: no custom fields in H_RAD.GENERAL custom field.subgroup for Census Tract OR Assigned To 

if (AInfo['GENERAL.Assigned To'] != null) {
	areaInspector = AInfo['GENERAL.Assigned To'];
	}

// 7.5.17 chaas: added code to accomodate custom field diff for EHSM subtype - Chris to re-check this...
//if (AInfo['GENERAL.Assigned To EHS'] != null && match(appTypeArray[1],'EHSM')) {
//	areaInspector = AInfo['GENERAL.Assigned To EHS'];
//	}	

if (AInfo['GENERAL.Assigned To'] == null && matches(appTypeArray[2],'LHH')) { //appMatch('*/*/LHH/*')){
	areaInspector = lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']);
	}

if (matches(appTypeArray[2],'BBE')) {
	// 7.5.17 chaas: the user LLOBDELL below is not yet setup in MCPHD configuration
	areaInspector = 'LLOBDELL';
	}
editAppSpecific('GENERAL.Assigned To',areaInspector);
//lwacht: 151016: updating so it doesn't throw an error
//assignCap(areaInspector);
if(areaInspector) assignCap(areaInspector);
//lwacht: 151016: end
// 7.5.17 chaas: no custom fields in any of these three GENERAL custom field subgroups for Mosquito Control 
if (matches(appTypeArray[2],'VEH','HSG','TRA') && AInfo['GENERAL.Initial Inspection Date'] != null && AInfo['GENERAL.Mosquito Control'] != 'Yes') {
	scheduleInspectDate('Initial Inspection',AInfo['GENERAL.Initial Inspection Date'],areaInspector);
	}
	
// 7.5.17 chaas: SEC subtype is not in MCPHD configuration
if (matches(appTypeArray[2],'SEC') && AInfo['GENERAL.Initial Inspection Date'] != null) {
	scheduleInspectDate('SEC Action',AInfo['GENERAL.Initial Inspection Date'],areaInspector);
	}
	
// 7.5.17 chaas: SEC subtype is not in MCPHD configuration
if (matches(appTypeArray[2],'VEH','HSG','SEC','TRA','LHH')) {
	theDate = AInfo['GENERAL.Initial Inspection Date'].substring(6,10) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(0,2) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}
	
// 7.5.17 chaas: SEC subtype is not in MCPHD configuration
if (matches(appTypeArray[2],'SEC') && AInfo['GENERAL.Initial Inspection Date'] != null) {
	resultInspection('SEC Action','In Violation',theDate,'Resulted by Script');
	}

if (matches(appTypeArray[2],'VEH','HSG','TRA') && AInfo['GENERAL.Initial Inspection Date'] != null) {
	resultInspection('Initial Inspection','In Violation',theDate,'Resulted by Script');
	}


//replaced branch(ES_GET_ADDRESS)
// 7.5.17 chaas: this function does not yet exist in MDPHD INCLUDES_CUSTOM, so commenting out to test lookup table in this script
//ES_GET_ADDRESS();

// 7.5.17 chaas: SEC subtype is not in MCPHD configuration
if (matches(appTypeArray[2],'VEH','HSG','SEC','TRA')) {
	updateAppStatus('In Violation','Initial status');
	}

if (areaInspector == null || areaInspector == 'undefined') {
	overrideMessage = 'The EHS Inspector could not be determined. Please go to Case Info-->Case, click the yellow Summary button, validate the address and click Save. This will fix the problem.<BR><BR>';
	}
