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
                var newAppId = createChild('EnvHealth','VC','LarvicideSite','NA','');
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

                capId = oldCapId;
			}
    }
	catch(err)
	{
		logDebug("A JavaScript Error occurred: CreateLarvicideSite_IfBreeding:  " + err.message);
		logDebug(err.stack);
	}
}
