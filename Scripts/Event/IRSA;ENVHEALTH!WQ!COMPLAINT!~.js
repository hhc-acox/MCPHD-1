//lwacht: 181024: #133: Autoschedule WQ recheck inspection
try{
	if(!checkInspectionResult("Recheck","Scheduled") && inspResult=="Violations Found") {
		if(AInfo["Complaint Type"]=="Emergency"){
			scheduleInspectDate("Recheck", dateAdd(null, 1,"Y"));
		}else{
			scheduleInspectDate("Recheck", dateAdd(null, 10,"Y"));
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/WQ/Complaint/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181024: #133: end