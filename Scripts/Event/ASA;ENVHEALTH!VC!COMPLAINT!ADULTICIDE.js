//lwacht: 181016: #64: Adult Spraying
try{
	var startDate = new Date();
	var hh = startDate.getHours().toString();
	var mi = startDate.getMinutes().toString();
	if(hh<17){
		scheduleInspect(capId, "Adulticide Inspection", 0);
	}else{
		scheduleInspect(capId, "Adulticide Inspection", 1);
	}

}catch(err){
	logDebug("A JavaScript Error occurred: ASA:EnvHealth/VC/Complaint/Adulticide: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181016: #64: end