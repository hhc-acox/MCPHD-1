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
                    zone4cap = zeroPad(zone4cap, 2);
                }

                var capStringArr = String(capIDString).split("-");
                if (capStringArr.length == 2) {
                    var newId = capStringArr[0] + "-" + zone4cap + "-" + capStringArr[1];
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
