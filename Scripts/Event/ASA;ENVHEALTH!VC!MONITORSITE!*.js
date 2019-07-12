//ASA;ENVHEALTH!VC!MONITORSITE!*.js
copyParcelGisObjects();
var aZone = getVectorZone(capId);
var getLat = "1.0"; //Need to automate to the correct value
var getLong = "1.0"; //Need to automate to the correct value
var techByZone = 'RMERCADO@HAHPDC1.HHCORP.ORG';
assignCap(techByZone);
editAppSpecific("Zone",aZone);
//editAppSpecific("Latitude",getLat);
//editAppSpecific("Longitude",getLong);
