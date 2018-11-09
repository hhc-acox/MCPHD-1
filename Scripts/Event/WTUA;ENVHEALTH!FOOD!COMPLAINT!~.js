//lwacht: 270918: #132: Auto Schedule Initial Inspection
try{
	if(wfTask=="Complaint Intake" && wfStatus.indexOf("Accepted")>-1){
		scheduleInspectDate("Complaint",dateAdd(null,1,"Y"));
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Food/Complaint/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 270918: #132: end