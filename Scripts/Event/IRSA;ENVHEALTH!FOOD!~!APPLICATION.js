//lwacht: 181015: #49/#37: Auto Scheduling of Inspectiona
try{
	if(matches(inspType,"Routine", "Rechecks") && !getScheduledInspId("Rechecks") && parseInt(AInfo["Risk"])>0){
		if(inspResult.indexOf("Violation")>-1){
			scheduleInspect(capId, "Rechecks", parseInt(AInfo["Risk"]));
		}else{
			scheduleInspect(capId, "Routine", parseInt(AInfo["Risk"]));
		}
	}else{
		if(matches(AInfo["Risk"], "",null,"undefined")){
			showMessage = true; 
			comment("Risk field is not populated. Inspection has not been scheduled.");
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/Food/*/Application: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181015: #49: end
