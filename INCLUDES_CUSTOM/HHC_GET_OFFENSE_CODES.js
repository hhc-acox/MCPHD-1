
function HHC_CREATE_CRT_CASES() {
	try{
		showMessage = true;
		cContactResult = aa.people.getCapContactByCapID(capId);
		if (cContactResult.getSuccess()) {
			cContactAry = cContactResult.getOutput();
		}
		if (cContactAry && cContactAry.length > 0) {
			for (i=0; i<cContactAry.length; i++) {
				thisContact = cContactAry[i];	
				aa.print(thisContact.getCapContactModel().getContactType());
				if (thisContact.getCapContactModel().getContactType() == "Responsible Party") {
					newChildID = createChild('EnvHealth','CRT','NA','NA','');
					copyAppSpecific(newChildID);
					comment('New child app id = '+ newChildID);
					code10or19 = AInfo['Ordinance Chapter'];
					updateAppStatus("Legal Review","",newChildID);
					assignCap('CSANDERS',newChildID);
					editAppSpecific('Parent Case',capIDString,newChildID);				
					if (appMatch('EnvHealth/*/LHH/*')) 	{
						editAppSpecific('Case Type','Lead',newChildID);
						editAppSpecific('EHS Court Day','THURS',newChildID);
						editAppSpecific('EHS Court Time','1:00 PM',newChildID);
					}
					HHC_GET_OFFENSE_CODES(newChildID);	
					//HHC_GET_ADDRESS_FOR_CHILD();
					// remove the contacts createChild put on child record
					var capContactResult = aa.people.getCapContactByCapID(newChildID);
					if (capContactResult.getSuccess()) {
						capContactArray = capContactResult.getOutput();
						if (capContactArray && capContactArray.length > 0) {
							for (var index in capContactArray) {
								childContact = capContactArray[index];
								aa.people.removeCapContact(newChildID, childContact.getCapContactModel().getContactSeqNumber());							}
						}
					}
					// copy this contact to child record
					newContact = thisContact.getCapContactModel();
					newContact.setCapID(newChildID);
					aa.people.createCapContact(newContact);
				}			
			}
		}
	}
	catch(err) {
		logDebug("A JavaScript Error occurred: HHC_CREATE_CRT_CASES:  " + err.message);
		logDebug(err.stack);
	}
}
	