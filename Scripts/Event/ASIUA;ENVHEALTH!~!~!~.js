// ASIUA;ENVHEALTH!~!~!~ 
// SCRIPT DISABLED - ONLY TO BE USED FOR ADMIN PURPOSES
//if (capName == '') {
	//replaced branch(ES_GET_ADDRESS)
	//ES_GET_ADDRESS();
//
//}
/* 
if (matches(appTypeArray[1],'EHSM','HHECMSC','HOUSING')) { //&& currentUserID == "RVOLLER") { //commented to test as CHAAS
	//var newUserID = lookup("Census - Housing EHS",AInfo['ParcelAttribute.CensusTract']);
	logDebug("appTypeArray1 is: " +appTypeArray[1]);
	var newUserID = lookup("Census - Housing EHS",AInfo['Census Tract']);
	logDebug("Census Tract is: " +AInfo['Census Tract']);
	logDebug("New User ID is: "+newUserID);
	if (checkInspectionResult("Initial Inspection", "Scheduled") == true) { inspNum=getScheduledInspId("Initial Inspection"); }
	if (checkInspectionResult("Reinspection", "Scheduled") == true) { inspNum=getScheduledInspId("Reinspection"); }
	editAppSpecific("Assigned To", newUserID);
	assignCap(newUserID);
	if (checkInspectionResult("Initial Inspection", "Scheduled")) { assignInspection(inspNum, newUserID); }
	if (checkInspectionResult("Reinspection", "Scheduled")) { assignInspection(inspNum, newUserID); }
	if (matches(AInfo['CensusTract'],null,"","undefined")) { editAppSpecific("Census Tract", AInfo['ParcelAttribute.CensusTract']); }

} */
//This code verifies that the Census Tract, Assigned To and Previous Assigned To are populated if blank for qualifying case types.

if (matches(appTypeArray[1],'EHSM','HHECMSC','HOUSING') && (!matches(appTypeArray[2],'CRT'))) {
	var areaInspector = '';

//Always set the Census Tract on the ASI General Screen
	var censusTract = '';
		censusTract = AInfo['ParcelAttribute.CensusTract'];
		editAppSpecific('Census Tract',censusTract);

//Housing EHS
			if (matches(appTypeArray[1],'EHSM','HHECMSC','HOUSING') && (!matches(appTypeArray[2],'LHH','BBE','CRT')) && AInfo['Assigned To'] == null) {
				areaInspector = lookup('Census - Housing EHS',censusTract); 
				editAppSpecific('Assigned To',areaInspector);
				editAppSpecific('Previous Assigned To',areaInspector);
				logDebug('Inspector to Assign: '+areaInspector);
					}

//Healthy Homes EHS
				comment('the LHH area: '+censusTract);	
			if (matches(appTypeArray[2],'LHH') && AInfo['Assigned To'] == null) {
				areaInspector = lookup('Census - Lead EHS',censusTract);
				editAppSpecific('Assigned To',areaInspector);
				editAppSpecific('Previous Assigned To',areaInspector);
					}
				comment('the LHH area Inspector: '+areaInspector);
//BedBugs EHS
			if (matches(appTypeArray[2],'BBE') && AInfo['Assigned To'] == null) {
				areaInspector = 'LLOBDELL';
				editAppSpecific('Assigned To',areaInspector);
				editAppSpecific('Previous Assigned To',areaInspector);
					}
					}