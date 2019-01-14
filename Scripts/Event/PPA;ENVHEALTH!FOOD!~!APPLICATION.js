//lwacht: 181003: #647: Auto Schedule Initial Inspection
try{
	if(balanceDue==0 && !checkInspectionResult("Initial","Scheduled")){
		 scheduleInspectDate("Initial", nextWorkDay(dateAdd(null,14)));
	}
}catch(err){
	logDebug("A JavaScript Error occurred: PPA:EnvHealth/Food/*/Application: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181003: #647: end