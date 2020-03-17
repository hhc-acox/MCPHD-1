//ASA;ENVHEALTH!VC!MONITORSITE!*.js
//copyParcelGisObjects4XAPO();
var aZone = getVectorZone(capId);
var getLat = "1.0"; //Need to automate to the correct value
var getLong = "1.0"; //Need to automate to the correct value
var techByZone = lookup("GIS - Larvicide Techs", aZone);
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

var vc_conn = new db();
var vc_sql = "SELECT b.B1_ALT_ID " +
    "FROM B1PERMIT b " + 
    "WHERE b.B1_ALT_ID like 'MON-" + zone4cap + "-%' " + 
    "ORDER BY b.B1_ALT_ID DESC";
var ds = vc_conn.dbDataSet(vc_sql, 25);
var dsCapIdString = ds[0]["B1_ALT_ID"]; 
var capStringArr = String(capIDString).split("-");

var dsNewId = capStringArr[1];

if (dsCapIdString) {
    logDebug('Using db-based naming: ' + dsCapIdString);
    var newCapStringArr = String(dsCapIdString).split("-");
    logDebug('Highest Seq: ' + parseInt(newCapStringArr[2]));
    dsNewId = parseInt(newCapStringArr[2]) + 1;

    if (dsNewId < 9) {
        dsNewId = '0' + dsNewId;
    }
}
if (capStringArr.length == 2) {
    var newId = capStringArr[0] + "-" + zone4cap + "-" + dsNewId;
    logDebug("New ID " + newId);
    aa.cap.updateCapAltID(capId, newId);
}
