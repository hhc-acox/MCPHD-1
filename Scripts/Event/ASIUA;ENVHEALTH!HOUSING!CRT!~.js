//lwacht: 280918: #118: Case status – JUSTIS first, then changes to initial hearing once Cause # is received.
try{
	if(!matches(AInfo["Cause #"],"",null,"undefined") && capStatus=="Justis Pending"){
		updateAppStatus("Initial Hearing", "Updated via ASIUA:EnvHealth/Housing/CRT/*");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASIUA:EnvHealth/Housing/CRT/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 280918: #118: end