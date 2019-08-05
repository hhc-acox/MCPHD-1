//ASA;ENVHEALTH!VC!MONITORSITE!*.js
copyParcelGisObjects4XAPO();
var aZone = getVectorZone(capId);
var getLat = "1.0"; //Need to automate to the correct value
var getLong = "1.0"; //Need to automate to the correct value
var techByZone = hhcgetUserByDiscipline('VCMosquito');
assignCap(techByZone);
editAppSpecific("Zone",aZone);
//editAppSpecific("Latitude",getLat);
//editAppSpecific("Longitude",getLong);
