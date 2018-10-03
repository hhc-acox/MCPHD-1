//lwacht: 021018: #49: Auto Scheduling of Routine Inspection
try{
	if(inspResult.indexOf("Violation")>-1 && inspType=="Routine" && parseInt(AInfo["Risk"])>0){
		scheduleInspect(capId, inspType, parseInt(AInfo["Risk"]));
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
//lwacht: 021018: #49: end