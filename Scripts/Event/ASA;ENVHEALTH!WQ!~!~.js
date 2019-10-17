	if (matches(appTypeArray[2], "File Search", "Life Station", "Archive") || appMatch("EnvHealth/WQ/Pump/Application") || appMatch("EnvHealth/WQ/Sewage/Application") || appMatch("EnvHealth/WQ/Private Well/Application")) {
		newAppName = "";
		if (AInfo["Profile Name"]) {
			newAppName += AInfo["Profile Name"] + " - ";
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
		
		editAppName(newAppName);
	}

	
	if (appMatch("EnvHealth/WQ/Body Art/Application") || appMatch("EnvHealth/WQ/Childcare/Application") || appMatch("EnvHealth/WQ/Pool/Construction Permit") ) {
		newAppName = "";
		if (AInfo["Profile Name"]) {
			newAppName += AInfo["Profile Name"];
			editAppName(newAppName);
		}
		
	}
	
	if (appMatch("EnvHealth/WQ/Pool/Application")  ) {
		newAppName = "";
		if (AInfo["Facility Name"]) {
			newAppName += AInfo["Facility Name"];
			editAppName(newAppName);
		}
		
	}