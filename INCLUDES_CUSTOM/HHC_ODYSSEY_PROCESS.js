function HHC_ODYSSEY_PROCESS() 
{
	try{
		cContactResult = AInfo[''];
		cContactsExist = false;
		cContactAry = new Array();
		y = 0;
		addCourtCase = false;
		prevName = 'Start';
		cTempAry = new Array();
		nextNameArr = new Array();
		saveID = capId;
		cContactResult = aa.people.getCapContactByCapID(capId);
			if (cContactResult.getSuccess()) {
				cContactsExist = true;
				}

			if (cContactsExist) {
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				}

			if (cContactsExist) {
				for(yy in cContactAry) 

			HHC_SORT_CONTACTS();
				}

			if (cContactsExist) {
				for(yy in cContactAry) 

			HHC_CheckContact();
				}

			if (cContactsExist) {
				for(yy in nextNameArr) nextNameArr.sort();
				}

			if (cContactsExist) 
			{
				comment(nextNameArr.length+' - '+y);
				}
		}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_ODYSSEY_PROCESS:  " + err.message);
			logDebug(err.stack);
		}
}