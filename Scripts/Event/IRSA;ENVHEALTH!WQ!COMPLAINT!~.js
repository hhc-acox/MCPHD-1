//lwacht: 181024: #133: Autoschedule WQ recheck inspection
/*
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
*/
//lwacht: 181024: #133: end
//lwacht: 181008: #2: Keeping applicant informed
//lwacht: 190114: record type consolidation, so moved from IRSA:EnvHealth/WQ/Complaint/Pool
try{
	if(inspResult.indexOf("Violation")>-1 && inspResult!="No Violations Found"){
		var arrCapIds = getRelatedCapsByParcel("EnvHealth/WQ/Pool/License");
		for(cap in arrCapIds){
			var thisCapId = arrCapIds[cap];
			var currCap = capId;
			capId = thisCapId.getCapID();
			emailNotifContact("TBD", false, "", "Responsible Party", true, "no_reply@accela.com");
			emailNotifContact("TBD", false, "", "Management Company", true, "no_reply@accela.com");
			capId = currCap;
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/WQ/Complaint/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 190114: end
//lwacht: 181008: #2: end
