	if (matches(appTypeArray[2], "File Search", "Lift Station", "Archive") || appMatch("EnvHealth/WQ/Body Art/Application") || appMatch("EnvHealth/WQ/Pool/Facility") || appMatch("EnvHealth/WQ/Pump/NA") || appMatch("EnvHealth/WQ/OWTS/NA") || appMatch("EnvHealth/WQ/Well/NA")) {
        newAppName = "";
        
        if (matches(appTypeArray[3], 'Facility')) {
            newAppName += AInfo["Facility Name"];
        } else {
            if (AInfo["Profile Name"]) {
                newAppName += AInfo["Profile Name"];
            }
        }
		
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
					addr=addressToUse;
                                        strAddress = addr.getHouseNumberStart();
                                        strAddress += (addr.getStreetDirection() != null ? " " + addr.getStreetDirection() : "");
                                        strAddress += (addr.getStreetName() != null ? " " + addr.getStreetName() : "");
                                        strAddress += (addr.getStreetSuffix() != null ? " " + addr.getStreetSuffix() : "");
                                        strAddress += (addr.getUnitType() != null ? " " + addr.getUnitType() : "");
                                        strAddress += (addr.getUnitStart() != null ? " " + addr.getUnitStart() : "");						
				}
			}
		}
		if (strAddress != "") {
			if (newAppName != "")
				newAppName += " - " + strAddress;
			else
				newAppName = strAddress
		}
		
		editAppName(newAppName);
	}

	
	if (appMatch("EnvHealth/WQ/Childcare/Application")) {
		newAppName = "";
		if (AInfo["Profile Name"]) {
			newAppName += AInfo["Profile Name"];
			editAppName(newAppName);
		}
		
	}
	
	if (appMatch("EnvHealth/WQ/Pool/Application")  || appMatch("EnvHealth/WQ/Pool/Construction Permit")) {
		newAppName = "";
		if (AInfo["Facility Name"]) {
			newAppName += AInfo["Facility Name"];
		} else if (AInfo["Profile Name"]){
            newAppName += AInfo["Profile Name"];
        }
        
        if (AInfo["Pool Location"]){
            newAppName += ' - ' + AInfo["Pool Location"];
        }

        if (AInfo["Pool Type"]){
            newAppName += ' - ' + AInfo["Pool Type"];
        }

        if (AInfo["Description"]){
            newAppName += ' - ' + AInfo["Description"];
        }

		editAppName(newAppName);
	}

if (appTypeString == "EnvHealth/WQ/Pump/NA" || appTypeString == "EnvHealth/WQ/Well/NA" || appTypeString == "EnvHealth/WQ/OWTS/NA"){
		var assignedToRecordInspector = getAssignedToRecord();
		var supportStaff = hhcgetUserByDiscipline('WQBodyArtChildCareSupp');
		updateTask('Intake','Pending','Updated by script');
		assignTask('Intake', supportStaff);
	} 

if (appTypeString  == "EnvHealth/WQ/Pool/Application" || appTypeString == "EnvHealth/WQ/Pool/Construction Permit") {
		var assignedToRecordInspector = hhcgetUserByDiscipline('WQPoolsSupp');
		updateTask('Application Review','Pending','Updated by script');
		assignTask('Application Review', assignedToRecordInspector);
        removeAllFees(capId);
}

if (appTypeString == "EnvHealth/WQ/Pool/Construction Permit") {
	updateFee('WQP001','WQ_POOL','FINAL',1,'Y');
}
