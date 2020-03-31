//lwacht: 280918: #118: Case status â€“ JUSTIS first, then changes to initial hearing once Cause # is received.
try{
	if(!matches(AInfo["Cause #"],"",null,"undefined") && capStatus=="Justis Pending"){
		updateAppStatus("Initial Hearing", "Updated via ASIUA:EnvHealth/Housing/CRT/*");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASIUA:EnvHealth/Housing/CRT/*: Justis: " + err.message);
	logDebug(err.stack)
}
//lwacht: 280918: #118: end

//lwacht: 280918: #122: Court Date Inspections
try{
	for(row in COURT){
		var dtCourt = new Date(COURT[row]["Date"]);
		var toDay = dateAdd(null,1);
		var toMorrow = new Date(toDay);
		var parCapId = false;
		if(parentCapId){
			parCapId = parentCapId;
		}else{
			var parAltId = AInfo["Parent Case"];
			parCapId = getApplication(parAltId);
		}
		if(parCapId){
			var currCap = capId;
			capId = parCapId;
			if(dtCourt>toMorrow && !checkInspectionResult("Reinspection","Scheduled")){
				var inspDate = dateAdd(dtCourt,-1);
				var inspUserId = getInspector("Initial Inspection");
				logDebug("inspUserId: " + inspUserId);
				if(inspUserId){
					scheduleInspectDate("Reinspection",inspDate,inspUserId);
				}else{
					scheduleInspectDate("Reinspection",inspDate);
				}
			}
			capId = currCap;
		}

	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASIUA:EnvHealth/Housing/CRT/*: Court Date Inspection:  " + err.message);
	logDebug(err.stack)
}
//lwacht: 280918: #122: end

try {
    var newAppName = "";

    if (AInfo["Case Type"]) {
        newAppName += AInfo["Case Type"];
    }	
    
    logDebug('Case Type: ' + AInfo["Case Type"]);
    
    if (AInfo["Emergency"] == 'Y' || AInfo["Emergency"] == 'Yes') {
        if(newAppName != '') {
            newAppName += ' - Emergency';
        } else {
            newAppName = 'Emergency';
        }
    }	
    
    logDebug('Emergency: ' + AInfo["Emergency"]);
    
    var capAddrResult = aa.address.getAddressByCapId(capId);
    var addressToUse = null;
    var strAddress = "";
        
    if (capAddrResult.getSuccess()) {
        var addresses = capAddrResult.getOutput();
        if (addresses) {
            for (zz in addresses) {
                    capAddress = addresses[zz];
                if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y")) 
                    addressToUse = capAddress;
            }
            if (addressToUse == null)
                addressToUse = addresses[0];
    
            if (addressToUse) {
                strAddress = addressToUse.getHouseNumberStart();				
                var addPart = addressToUse.getStreetName();
                if (addPart && addPart != "") 
                    strAddress += " " + addPart;	
                var addPart = addressToUse.getStreetSuffix();
                if (addPart && addPart != "") 
                    strAddress += " " + addPart;					
            }
        }
    }
    if (strAddress != "") {
        if (newAppName != "")
            newAppName += " - " + strAddress;
        else
            newAppName = strAddress
    }
    
    logDebug('New App Name: ' + newAppName);
    editAppName(newAppName);
} catch (err) {
    logDebug("A JavaScript Error occurred: ASIUA:EnvHealth/Housing/CRT/*: CRT Renaming:  " + err.message);
	logDebug(err.stack)
}
