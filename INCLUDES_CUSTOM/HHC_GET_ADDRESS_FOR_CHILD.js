function HHC_GET_ADDRESS_FOR_CHILD() 
{
	try{

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
					editAppName(strAddress, newChildID);
				    }
				}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_ADDRESS_FOR_CHILD:  " + err.message);
			logDebug(err.stack);
		}
}
