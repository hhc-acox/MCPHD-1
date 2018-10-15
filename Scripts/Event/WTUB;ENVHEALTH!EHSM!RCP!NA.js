//lwacht: 181015: #113 Send to Court Rules
try{
	if(balanceDue>0 && wfTask=="Additional Processing" && wfStatus!="Court Order Needed"){
		cancel=true;
		showMessage=true;
		comment("Only 'Court Order Needed' can be selected when there is an outstanding balance.")
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUB:EnvHealth/EHSM/RCP/NA: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181015: #113: end
