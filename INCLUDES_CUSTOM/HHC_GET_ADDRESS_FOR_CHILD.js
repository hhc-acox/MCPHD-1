function HHC_GET_ADDRESS_FOR_CHILD() 
{
	try{

		var addrResult = aa.address.getAddressByCapId(capId);
		var addrArray = new Array();
		var addrArray = addrResult.getOutput();
		var streetName = addrArray[0].getStreetName();
		var hseNum = addrArray[0].getHouseNumberStart();
		var streetSuffix = addrArray[0].getStreetSuffix();
		var streetDir = addrArray[0].getStreetDirection();
			if (streetSuffix == null || streetSuffix == '' || streetSuffix == 'undefined') {
				streetSuffix = ' ';
				}

			if (streetDir == null || streetDir == '' || streetDir == 'undefined') {
				streetDir == ' ';
				}

			comment ('The Address is: '+hseNum+' '+streetDir+' '+streetName+' '+streetSuffix);
			if (streetDir == null) {
				editAppName(hseNum+' '+streetName+' '+streetSuffix,newChildID);
				comment('The Child ID is: '+newChildID);
				}

			if (streetDir != null) {
				editAppName(hseNum+' '+streetDir+' '+streetName+' '+streetSuffix,newChildID);
				comment('The Child ID is: '+newChildID);
				}
				}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_ADDRESS_FOR_CHILD:  " + err.message);
			logDebug(err.stack);
		}
}