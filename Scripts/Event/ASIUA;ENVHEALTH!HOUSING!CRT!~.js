//lwacht: 280918: #118: Case status – JUSTIS first, then changes to initial hearing once Cause # is received.
try{
	if(!matches(AInfo["Cause #"],"",null,"undefined") && capStatus=="Justis Pending"){
		updateAppStatus("Initial Hearing", "Updated via ASIUA:EnvHealth/Housing/CRT/*");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASIUA:EnvHealth/Housing/CRT/*: Justis: " + err.message);
	logDebug(err.stack)
}
//lwacht: 280918: #118: end

//lwacht: 280918: #122: Court Date Inspections
try{
	for(row in COURT){
		var dtCourt = new Date(COURT[row]["Date"]);
		var toDay = new Date();
		if(dtCourt>dateAdd(toDay,1) && !checkInspectionResult("Reinspection","Scheduled")){
			var inspUserId = getInspector("Initial Inspection");
			if(inspUserId){
				scheduleInspect(capId,"Reinspection",1,inspUserId);
			}else{
				scheduleInspect(capId,"Reinspection",1);
			}
		}

	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASIUA:EnvHealth/Housing/CRT/*: Court Date Inspection:  " + err.message);
	logDebug(err.stack)
}
//lwacht: 280918: #118: end
