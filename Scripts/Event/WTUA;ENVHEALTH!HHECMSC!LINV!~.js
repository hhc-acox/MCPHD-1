//lwacht: 280918: #93: need a 30 day recheck, Auto scheduled from date the NOV is mailed.
try{
	if(wfTask=="Inspection" && wfStatus=="In Violation"){
		scheduleInspectDate("Reinspection",dateAdd(null,30));
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/HHECMSC/LINV/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 280918: #93: end