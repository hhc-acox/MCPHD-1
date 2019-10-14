function validateForCourt() {
	showMessage = true;
	itemCap = capId
	if (arguments.length > 0)
		itemCap = arguments[0]
	localCancel = false;
	errMess = "";

	cContactResult = aa.people.getCapContactByCapID(capId);
	if (cContactResult.getSuccess()) {
		conArray = cContactResult.getOutput();
		if (conArray && conArray.length > 0) {
			useThisContact = null;
			for (var ci in conArray) {
				thisContact = conArray[ci];
				thisPeop = thisContact.getPeople();
				if (thisPeop.getFlag() == "Y") 
					useThisContact = thisContact;
				break;
			}
			if (useThisContact == null) {
				useThisContact = conArray[0];
			}
			conPeop = useThisContact.getPeople();
			if (!conPeop.getContactTypeFlag() || conPeop.getContactTypeFlag() == "" || conPeop.getContactTypeFlag == "individual") {
				// check fields for individual
				if (!conPeop.getLastName() || conPeop.getLastName() == "" ) {
					errMess += "Individual contact must have last name";
				}
			}
			else {
				//check fields for organization
				if (!conPeop.getBusinessName() || conPeop.getBusinessName() == "") {
					errMess += "Business contact must have business name";
					localCancel = true;
				}
			}
			// check fields for both types
			cAddr = conPeop.getCompactAddress();
			if (!cAddr.getCity() || cAddr.getCity() == "" ) {
				errMess += "Contact address must have a city"; localCancel = true; }
			if (!cAddr.getState() || cAddr.getState() == "" ) {
				errMess += "Contact address must have a state"; localCancel = true; }
			if (!cAddr.getZip() || cAddr.getZip() == "" ) {
				errMess += "Contact address must have a zip"; localCancel = true; }

		}
		else {
			localCancel = true;
			errMess += "Missing court info: At least one contact is required.";
		}
	}
	else {
		logDebug("Error retrieving contacts " + cContactResult.getErrorMessage());
		errMess += "Missing court info: At least one contact is required.";
	}


	var asitModel = aa.env.getValue("AppSpecificTableGroupModel");
	beforeDocTable = loadASITableBeforeEvent("DOCUMENTS", asitModel);
	docTable = loadASITable("DOCUMENTS");
	existingTableEmpty = true; newTableEmpty = true;
	if (docTable && docTable.length > 0) {
		existingTableEmpty = false;	
	}
	if (beforeDocTable && beforeDocTable.length > 0) {
		newTableEmpty = false;
	}

	if (existingTableEmpty && newTableEmpty) {
		errMess += "Missing entry in documents table for court case."; localCancel = true;
	}


	offTable = loadASITable("OFFENSE CODES")
	var asitModel = aa.env.getValue("AppSpecificTableGroupModel");
	beforeOffTable = loadASITableBeforeEvent("OFFENSE CODES", asitModel);
	existingTableEmpty = true; newTableEmpty = true;
	if (offTable && offTable.length > 0) 
		existingTableEmpty = false;
	if (beforeOffTable && beforeOffTable.length > 0)
		newTableEmpty = false;
	if (existingTableEmpty && newTableEmpty) {
		errMess += "Missing offense codes for court case."; localCancel = true;
	}

	if (localCancel) {
		cancel = true;
		comment(errMess);
	}
}

