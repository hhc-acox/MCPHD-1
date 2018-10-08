//lwacht: 181008: #2: Keeping applicant informed
try{
	if(inspResult.indexOf("Violation")>-1 && inspResult!="No Violations Found"){
		emailNotifContact("TBD", false, "", "Responsible Party", true, "no_reply@accela.com");
		emailNotifContact("TBD", false, "", "Management Company", true, "no_reply@accela.com");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/WQ/Complaint/Pool: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181008: #2: end