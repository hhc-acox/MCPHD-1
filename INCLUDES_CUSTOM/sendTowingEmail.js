
function sendTowingEmail() {
	rFiles = new Array();
	var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
	if(capDocResult.getSuccess()) {
		if(capDocResult.getOutput().size() > 0) {
	    	for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
				var documentObject = capDocResult.getOutput().get(docInx);
				aa.print(documentObject.getFileName());
				fileName = "" + documentObject.getFileName();
	    		currDocCat = "" + documentObject.getDocCategory();
	    		if (currDocCat == "Contractor Referral") {
	    			// download the document content
					var useDefaultUserPassword = true;
					//If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
					var EMDSUsername = null;
					var EMDSPassword = null;
					var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
					if(downloadResult.getSuccess()) {
						var path = downloadResult.getOutput();
						logDebug("path=" + path);
						rFiles.push(path);
					}
				}
			}
		}
	}
	// Run report Court Ordered Clean Cover Sheet
	if (rFiles.length < 1) {
            reportParams = aa.util.newHashtable();
            reportParams.put("CaseNumber", "" + capId.getCustomID());
	    reportName = "Housing VEH Contractor Referral 18 Day";
	    coverSheet = reportRunSave(reportName, false, false, true, "EnvHealth", reportParams, capId);
	    logDebug(coverSheet);
	    if (coverSheet)
		rFiles.push(coverSheet);
        }
	
	var emailParams = aa.util.newHashtable();
	addParameter(emailParams, "$$capID$$", "" + capId.getCustomID());
	addParameter(emailParams, "$$CAPADDRESS$$", hhc_getTheAddress(capId));
	var censusTract = '';
	censusTract = AInfo['ParcelAttribute.CensusTract'];
	areaTeamLeaderEmail = lookup('Census - Team Leader',censusTract); 
	areaTeamLeader = "";
	if (areaTeamLeaderEmail && areaTeamLeaderEmail != "") {
		areaTeamLeaderEmailPieces = areaTeamLeaderEmail.split("@");
		areaTeamLeader = areaTeamLeaderEmailPieces[0];
	}
	addParameter(emailParams, "REQUESTOR", areaTeamLeader);
	addParameter(emailParams, "REQUESTOREMAIL", areaTeamLeaderEmail);

	sendNotification("lmorgan.marionhealth.org", "rvoller@hhcorp.org","", "HOUSING EMAIL TO TOWING CONTRACTOR", emailParams, rFiles,capId);
	for (var i=0;i<rFiles.length;i++)
		aa.util.deleteFile(rFiles[i]);

}
