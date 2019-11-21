//ASA;ENVHEALTH!VC!MONITORSITE!*.js
copyParcelGisObjects4XAPO();
var aZone = getVectorZone(capId);
var getLat = "1.0"; //Need to automate to the correct value
var getLong = "1.0"; //Need to automate to the correct value
var techByZone = hhcgetUserByDiscipline('VCMosquito');
assignCap(techByZone);
editAppSpecific("Zone", aZone);
//editAppSpecific("Latitude",getLat);
//editAppSpecific("Longitude",getLong);

//SET RECORD ID BASED ON ZONE
var zone4cap = "00"; //default zone
var tmpZone = "";
if (AInfo["Zone"] != null && AInfo["Zone"] != "") {
    tmpZone = String(AInfo["Zone"]).replace(/\D/g, '').trim();
    logDebug("Using ASI Zone Info = " + tmpZone);
}
else {
    //if no ASI try GIS
    tmpZone = getGISInfo("MCPHD", "VectorZones", "vectorzone");
    logDebug("Using GIS Zone Info = " + tmpZone);
    tmpZone = String(tmpZone).replace(/\D/g, '').trim();
}
if (tmpZone != "") {
    if (!isNaN(tmpZone)) {
        tmpZone = String(parseInt(tmpZone, 10)); //strip the zeros
    }
    zone4cap = tmpZone;
    zone4cap = zeroPad(zone4cap, 2);
}

var capStringArr = String(capIDString).split("-");
if (capStringArr.length == 2) {
    var newId = capStringArr[0] + "-" + zone4cap + "-" + capStringArr[1];
    logDebug("New ID " + newId);
    aa.cap.updateCapAltID(capId, newId);
}
