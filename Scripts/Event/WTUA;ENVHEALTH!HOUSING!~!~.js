//lwacht: 181019: #123: New Status for Injunction
try{
	if(wfStatus=="Permanent Injunction"){
		if(parentCapId){
			updateAppStatus("Permanent Injunction","Updated via WTUA:EnvHealth/Housing/*/*", parentCapId);
			var currCap = capId;
			capId = parentCapId;
			if(!isScheduled("Reinspection")){
				scheduleInspect(parentCapId,"Reinspection",180);
			}
			capId= currCap;
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Housing/*/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181019: #123: end