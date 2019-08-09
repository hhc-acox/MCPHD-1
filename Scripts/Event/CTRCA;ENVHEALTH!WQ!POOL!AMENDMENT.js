//CTRCA;ENVHEALTH!WQ!POOL!AMENDMENT
//remove contacts from the parent and add the contacts from the amendment record
try{
	var parCapId = getParent();
	if(parCapId){
		var arrContacts = aa.people.getCapContactByCapID(parCapId).getOutput();
		for (var i in arrContacts){
			var thisContact = arrContacts[i].getCapContactModel().getPeople();
			aa.people.removeCapContact(parCapId,thisContact.getContactSeqNumber());		
		}
		copyContacts(capId,parCapId);
		var arrContact = getContactArray();
		for (cn in arrContact){
			thisContact = arrContact[cn].contactType;
			createPublicUserFromContact(thisContact);
		}
		updateAppStatus("Closed","Contacts have been processed");
	}else{
		logDebug("Error finding the parent record.");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: CTRCA:EnvHealth/WQ/Pool/Amendment: Copy contacts to parent: " + err.message);
	logDebug(err.stack)
}
