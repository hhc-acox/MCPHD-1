//lwacht: 181019: #123: New Status for Injunction
try{
	if(wfStatus=="Permanent Injunction"){
		var parCapId = false;
		if(parentCapId){
			parCapId = parentCapId;
		}else{
			var parAltId = AInfo["Parent Case"];
			parCapId = getApplication(parAltId);
		}
		if(parCapId){
			updateAppStatus("Permanent Injunction","Updated via WTUA:EnvHealth/Housing/*/*", parCapId);
			if(!checkInspectionResult("Reinspection","Scheduled")){
				var currCap = capId;
				capId = parCapId;
				var inspUserId = getInspector("Initial Inspection");
				capId = currCap;
				if(inspUserId){
					scheduleInspect(parCapId,"Reinspection",180,inspUserId);
				}else{
					scheduleInspect(parCapId,"Reinspection",180);
				}
			}
		}else{
			logDebug("No parent record found.  No reinspection scheduled.");
		}			
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Housing/CRT/*: Permanent Injunction: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181019: #123: end

//lwacht: 181022: #143: Fee Assessments
try{
	if(wfTask=="Reinspection" && wfStatus.indexOf("Ticket Issued")>-1){
		updateFee("H_T100", "H_TRA", "FINAL", 1, "Y", "Y");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/CRT/*/*: Fee assessments: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181022: #143: end

//lwacht: 181030: #124: Efficiencies when closing Injunction
try{
	if(matches(wfStatus,"Cause Dismiss","Compliance","Contempt","Dismissed")){
		var parCapId = false;
		if(parentCapId){
			parCapId = parentCapId;
		}else{
			var parAltId = AInfo["Parent Case"];
			parCapId = getApplication(parAltId);
		}
		if(parCapId){
			updateAppStatus("Active","Updated via WTUA:EnvHealth/Housing/*/*", parCapId);
			if(checkInspectionResult("Reinspection","Scheduled")){
				resultInspection("Reinspection", "Cancelled", sysDate, "Updated via WTUA:EnvHealth/Housing/*/*") 
			}
		}else{
			logDebug("No parent record found.  No updates made.");
		}			
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/CRT/*/*: Closing Injunction: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181030: #124: end