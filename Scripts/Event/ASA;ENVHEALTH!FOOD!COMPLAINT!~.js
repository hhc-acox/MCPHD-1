//lwacht: 181016: #43: Food Inspection Assignments
try{
	if(matches(appTypeArray[3],"Foodborne","Other")){
		var insDate = dateAdd(null, 1, "Y");
		scheduleInspectDate("Complaint", 1,insDate);
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASA:EnvHealth/Food/Complaint/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181016: #64: end