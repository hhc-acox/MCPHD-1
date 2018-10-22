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
				var inspUserId = getInspector("Initial Inspection");
				if(inspUserId){
					scheduleInspect(capId,"Reinspection",180,inspUserId);
				}else{
					scheduleInspect(capId,"Reinspection",180);
				}
			}
		}else{
			logDebug("No parent record found.  No reinspection scheduled.");
		}			
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Housing/*/*: permanent Injunction: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181019: #123: end

//lwacht: 181022: #143: Fee Assessments
try{
	if(wfTask=="Reinspection" && wfStatus=="In Violation - Ticket Issued"){
		updateFee("H_T100", "H_TRA", "FINAL", 1, "Y", "Y");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Housing/*/*: Fee assessments: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181022: #143: end