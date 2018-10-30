//lwacht: 181030: #220: Lift Station Inspections
try{
	if(!checkInspectionResult("Recheck","Scheduled")) {
		var sDate = dateAdd(null,364);
		var schDate = nextWorkDay(sDate);
		scheduleInspectDate("Recheck", schDate);
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/WQ/Lift Station/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181030: #220: end