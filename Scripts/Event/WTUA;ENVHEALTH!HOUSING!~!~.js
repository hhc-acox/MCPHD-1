//lwacht: 181022: #143: Fee Assessments
try{
	if(wfTask=="Reinspection" && wfStatus.indexOf("Ticket Issued")>-1){
		updateFee("H_T100", "H_TRA", "FINAL", 1, "Y", "Y");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Housing/*/*: Fee assessments: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181022: #143: end