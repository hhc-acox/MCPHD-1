function CreateLarvicideSite_IfBreeding(capId){
	try{
		gName = "VC_LARVICIDE";
		gItem = "SITE INFORMATION";
		asiGroup = "VC_LVCCKLST";
		asiSubGroup = "LARVICIDE";
		asiLabel = "Is Site Breeding";
		var myResult = getGuidesheetASIValue(inspId,gName,gItem,asiGroup,asiSubGroup, asiLabel);
			if(myResult=="Yes"){
                //Create the Larvicide Site Case
                var newAppId = createParent('EnvHealth','VC','LarvicideSite','NA','');
                // Add Case and Data Fields Info
                copyAppSpecific(newAppId);
                var aZone = getVectorZone(capId);

                var oldCapId = capId;
                capId = newAppId;

                logDebug(capId.getCustomID());

                copyParcelGisObjects4XAPO();
                var techByZone = lookup("GIS - Larvicide Techs",aZone); 

                var inspTime = null;
                var inspComm = "Scheduled via Script";
                var inspectorObj = null;
                var DateToSched = nextWorkDay(dateAdd(null,14));

                var inspRes = aa.person.getUser(techByZone);
                if (inspRes.getSuccess()){
                    inspectorObj = inspRes.getOutput();
                }
            
                aa.inspection.scheduleInspection(newAppId, inspectorObj, aa.date.parseDate(DateToSched), inspTime, "Larvicide", inspComm)
                assignCap(techByZone, newAppId);
                
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
                    //zone4cap = zeroPad(zone4cap, 2);
                }

                var vc_conn = new db();

                var vc_sql = "SELECT SUBSTR(b.B1_ALT_ID, INSTR(b.B1_ALT_ID, '-' ,-1, 1) + 1) as B1_ALT_ID " +
                    "FROM B1PERMIT b " + 
                    "WHERE b.B1_ALT_ID like 'LVC-" + zone4cap + "-%' AND b.SERV_PROV_CODE = 'MCPHD'" + 
                    "ORDER BY TO_NUMBER(SUBSTR(b.B1_ALT_ID, INSTR(b.B1_ALT_ID, '-' ,-1, 1) + 1)) DESC";
                var ds = vc_conn.dbDataSet(vc_sql, 100);
                var dsCapIdString = "0";
                
                if (ds[0]) {
                    dsCapIdString = ds[0]["B1_ALT_ID"];
                    logDebug('Using db-based naming: ' + dsCapIdString);
                } 
                var dsNewId = "0";

                if (dsCapIdString) {
                    logDebug('Highest Seq: ' + parseInt(dsCapIdString));
                    dsNewId = parseInt(dsCapIdString) + 1;


                    if (dsNewId < 9) {
                        dsNewId = '0' + dsNewId;
                    }
                }

                if (dsNewId) {
                    var newId = "LVC-" + zone4cap + "-" + dsNewId;

                    logDebug("New ID " + newId);
                    aa.cap.updateCapAltID(capId, newId);
                }

                capId = oldCapId;
			}
    }
	catch(err)
	{
		logDebug("A JavaScript Error occurred: CreateLarvicideSite_IfBreeding:  " + err.message);
		logDebug(err.stack);
	}
}
