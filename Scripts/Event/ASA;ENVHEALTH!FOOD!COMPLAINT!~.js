//lwacht: 181016: #43: Food Inspection Assignments
try{
	if(matches(appTypeArray[3],"Foodborne","Other")){
		scheduleInspect(capId, "Complaint", 1);
		var inspectId = getScheduledInspId("Complaint");
		if(inspectId){
			autoAssignInspection(inspectId);
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASA:EnvHealth/Food/Complaint/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181016: #64: end