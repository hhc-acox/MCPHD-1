function HHC_CONTACTS_PROCESS() 
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
		myComplainer = '';
		cContactResult = aa.people.getCapContactByCapID(newChildID);
			if (cContactResult.getSuccess()) {
				cContactsExist = true;
				}

			if (cContactsExist) {
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				}

			if (cContactsExist) {
				showMesage = true;
				comment('The number of contacts is '+cc);
				}

			if (cContactsExist) 
				{
					for(yy in cContactAry) 

					{
						showMessage=true;
						appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
						appConType = cContactAry[yy].getCapContactModel().getContactType();
						appPhoneNum = cContactAry[yy].getPeople().phone1;
						appSeqNum = cContactAry[yy].getCapContactModel().getPeople().getContactSeqNumber();
						cContactDelete = false;
						
							if (appPhoneNum == '' || appPhoneNum == null){
								appPhoneNum = cContactAry[yy].getPeople().phone2;
							}
							if (appPhoneNum == '' || appPhoneNum == null){
								appPhoneNum = cContactAry[yy].getPeople().phone3;
							}
							if (appConType == 'Complainant') {
								cContactDelete = true; 
								}

							if (cContactDelete) {
								cTempAry[yy] = [[appName],[appConType],[appPhoneNum]];
								}

							if (cContactDelete) {
								comment(cTempAry[yy][1]+' - '+cTempAry[yy][0]+' - '+cTempAry[yy][2]);
								myComplainer = cTempAry[yy][1]+': '+cTempAry[yy][0]+' - '+cTempAry[yy][2];
								}

							if (cContactDelete) {
								cCapContactModel = cContactAry[yy].getCapContactModel();
								}

							if (cContactDelete) {
								cPeopleModel = cCapContactModel.getPeople();
								}

							if (cContactDelete) {
								cContactSeqNumber = parseInt(appSeqNum);
								}

							if (cContactDelete) {
								aa.people.removeCapContact(newChildID, cContactSeqNumber);
								}
						}
					}

			if (cContactsExist) {
				createCapComment(myComplainer,newChildID);
				}

			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CONTACTS_PROCESS:  " + err.message);
			logDebug(err.stack);
		}
}
