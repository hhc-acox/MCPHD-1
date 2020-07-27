//IRSA;EnvHealth!VC!Complaint!Larvicide.js
showDebug = true; 
showMessage = true;
	
if (matches(inspResult,'Lab Complete')) {
	updateAppStatus("Closed");
}
if (matches(inspResult,'Unable to Inspect','No Access', 'Tech Complete - Not Breeding')) {
	updateAppStatus("Closed");
}
