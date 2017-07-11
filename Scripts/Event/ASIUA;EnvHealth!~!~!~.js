// ASIUA;EnvHealth!~!~!~ 

//if (capName == '') {
	//replaced branch(ES_GET_ADDRESS)
	//ES_GET_ADDRESS();
//}

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

}
