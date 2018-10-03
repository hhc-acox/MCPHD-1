//lwacht: 280918: #118: Case status - JUSTIS first, then changes to initial hearing once Cause # is received.
try{
	if(wfTask=="Application Intake" && matches(wfStatus,"Accepted", " Accepted - No Plan Review")){
		emailNotifContact("TBD", false, "", "Responsible Party", true, "no_reply@accela.com");
		emailNotifContact("TBD", false, "", "Management Company", true, "no_reply@accela.com");
	}
	if(wfTask=="Issuance" && wfStatus=="Issued"){
		emailNotifContact("TBD", false, "", "Responsible Party", true, "no_reply@accela.com");
		emailNotifContact("TBD", false, "", "Management Company", true, "no_reply@accela.com");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/WQ/Pool/Application: " + err.message);
	logDebug(err.stack)
}
//lwacht: 280918: #118: end