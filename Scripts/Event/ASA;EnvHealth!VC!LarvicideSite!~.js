//ASA;EnvHealth!VC!LarvicideSite!*.js
showDebug = true; 
showMessage = true; 
//assign to Mosquito Control Team Leader
var userID = hhcgetUserByDiscipline('VCMosquito');
assignCap(userID);
updateAppStatus("Assigned");