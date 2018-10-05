//lwacht: 270918: #29: Auto schedule the Food Complaint Inspections for next business day after complaint is received
try{
	if(wfTask=="Complaint Intake" && wfStatus.indexOf("Accepted")>-1){
		scheduleInspectDate("Complaint",dateAdd(null,1,"Y"));
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Food/Complaint/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 270918: #29: end