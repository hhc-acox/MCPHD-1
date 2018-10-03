//lwacht: 280918: #93: need a 30 day recheck, Auto scheduled from date the NOV is mailed.
try{
	if(wfTask=="Initial Processing" && wfStatus=="Complete Notice of Violation"){
		scheduleInspectDate("Reinspection",dateAdd(null,30));
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/HHECMSC/LHH/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 280918: #93: end