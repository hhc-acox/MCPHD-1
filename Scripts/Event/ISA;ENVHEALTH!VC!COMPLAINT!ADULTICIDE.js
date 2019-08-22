//lwacht: 190822: moved to new record type--custom field does not currently exist, so this may not be needed.
//lwacht: 190129: populate the adulticide custom date field when an adulticide inspection is scheduled.
try{
	if(inspType=="Adulticide"){
		editAppSpecific("Adulticide Date", inspSchedDate);
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ISA:EnvHealth/Vector/Complaint/NA: Update Adulticide Date: " + err.message);
	logDebug(err.stack)
}