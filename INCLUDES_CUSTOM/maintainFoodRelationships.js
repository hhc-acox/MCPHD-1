function maintainFoodRelationships() {
	listArr = [];
	comInfo = loadASITable("COMMISSARY INFORMATION");
	if (comInfo && comInfo.length > 0) {
		for (eachRow in comInfo) {
			licNum = comInfo[eachRow]["Commissary License"];
			if (licNum != "") {
				listArr.push(licNum);
			}
		}
	}
	// get parent records
	parentArr = getParents("EnvHealth/Food/Establishment/License");
	if (listArr.length == 0 && (parentArr && parentArr.length > 0)) {
		// nothing in the list, parents exist, remove them
	}
	// for any lic in listArr, create a parent relationship if it doesn't exist
	for (lIndex in listArr) {
		thisLic = listArr[lIndex];
		if (!exists(thisLic, parentArr)) {
			licCapId = getApplication("" + thisLic);
			if (licCapId) {				
				var result = aa.cap.createAppHierarchy(licCapId, capId); 
				if (result.getSuccess()){
					logDebug("Parent application successfully linked");
				}else{
					logDebug("Could not link applications");
				}
			}
		}
	}
	// for any parent record, if the altID doesn't exist in the list, remove them
	for (pIndex in parentArr) {
		thisParentCapId = parentArr[pIndex];
		pAltID = thisParentCapId.getCustomID();
		if (!exists(pAltID, listArr)) {
			var result = aa.cap.removeAppHierarchy(thisParentCapId, capId); 
			if (result.getSuccess()){
				logDebug("Parent application successfully unlinked");
			}else{
				logDebug("Could not link applications");
			}
		}
	}
}