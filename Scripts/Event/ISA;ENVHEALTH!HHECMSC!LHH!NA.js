
try{
	if(inspType=="Reinspection"){
		copyLeadViolations(inspId);
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ISA:EnvHealth/HHECMSC/LHH/NA:  " + err.message);
	logDebug(err.stack)
}