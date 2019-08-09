//CTRCA;ENVHEALTH!WQ!POOL!AMENDMENT
//remove contacts from the parent and add the contacts from the amendment record
try{
	var parentCapString = "" + aa.env.getValue("ParentCapID");
	if (parentCapString.length > 0) { parentArray = parentCapString.split("-"); parentCapId = aa.cap.getCapID(parentArray[0], parentArray[1], parentArray[2]).getOutput(); }
	if (!parentCapId) { parentCapId = getParent(); }
	if (!parentCapId) { parentCapId = getParentLicenseCapID(capId); }
	var parCapId = parentCapId;
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
	//aa.sendMail("no_reply@accela.com", "lwacht@septechconsulting.com", "", "Starting: CTRCA:EnvHealth/WQ/Pool/Amendment: Copy contacts to parent: " + startDate, "capId: " + capId + br + debug);
}catch(err){
	logDebug("A JavaScript Error occurred: CTRCA:EnvHealth/WQ/Pool/Amendment: Copy contacts to parent: " + err.message);
	logDebug(err.stack);
	//aa.sendMail("no_reply@accela.com", "lwacht@septechconsulting.com", "", "A JavaScript Error occurred: CTRCA:EnvHealth/WQ/Pool/Amendment: Copy contacts to paren" + startDate, "capId: " + capId + ": " + err.message + ": " + err.stack);
}
