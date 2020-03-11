if (wfTask == "Issuance" && wfStatus == "Issued") {
	pId = getParent();	// created by earlier script
	logDebug("Parent id = " + pId);	// this is the SKU license
	
	if (pId) {
		comInfo = loadASITable("COMMISSARY INFORMATION");
		if (comInfo && comInfo.length > 0) {
			for (eachRow in comInfo) {
				licNum = comInfo[eachRow]["Commissary License"];
                                if(licNum && licNum != "") {
				    logDebug("Commissary :" + licNum);
				    licCapId = getApplication("" + licNum);
				    if (licCapId) {				
					var result = aa.cap.createAppHierarchy(licCapId, pId); 
					if (result.getSuccess()){
						logDebug("Parent application successfully linked");
					}else{
						logDebug("Could not link applications");
					}
				     }
                                }
			}
		}
	}
}
