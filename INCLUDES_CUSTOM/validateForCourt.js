function validateForCourt() {
    showMessage = true;
    itemCap = capId
    if (arguments.length > 0) itemCap = arguments[0]
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
            // check fields for individual
            var individualValid = true;
            var businessValid = true;

            if ((!conPeop.getFirstName() || conPeop.getFirstName() == "") || (!conPeop.getLastName() || conPeop.getLastName() == "")) {
                logDebug('Individual Invalid');
                individualValid = false;
                //localCancel = true;
            }
            //check fields for organization
            if (!conPeop.getBusinessName() || conPeop.getBusinessName() == "") {
                logDebug('Business Invalid');
                //errMess += "Business contact must have business name";
                businessValid = false;
                //localCancel = true;
            }

            if (!individualValid && !businessValid) {
                logDebug('Individual contact must have first and last name or a business name');
                errMess += "Individual contact must have first and last name or a business name";
                localCancel = true;
            }
            // check fields for both types
            cAddr = conPeop.getCompactAddress();
            
            if (!cAddr.getCity() || cAddr.getCity() == "") {
                errMess += "Contact address must have a city";
                localCancel = true;
            }
            if (!cAddr.getState() || cAddr.getState() == "") {
                errMess += "Contact address must have a state";
                localCancel = true;
            }
            if (!cAddr.getZip() || cAddr.getZip() == "") {
                errMess += "Contact address must have a zip";
                localCancel = true;
            }
            if (!cAddr.getAddressLine1() || cAddr.getAddressLine1() == "") {
                errMess += "Contact address must have an address";
                localCancel = true;
            } else {
                var strAddress = cAddr.getAddressLine1();
                //comment('Address Below:');
                //comment(strAddress);
                //comment(strAddress.length);
                if (strAddress.length() > 64) {
                    errMess += "Address cannot exceed 64 characters";
                    localCancel = true;
                }
            }
        } else {
            localCancel = true;
            errMess += "Missing court info: At least one contact is required.";
        }
    } else {
        logDebug("Error retrieving contacts " + cContactResult.getErrorMessage());
        errMess += "Missing court info: At least one contact is required.";
    }

    if (typeof(DOCUMENTS) != "object") {
        localCancel = true;
        errMess += "Missing court info: At least one entry in the DOCUMENTS list is required.";
    }
    if (typeof(DOCUMENTS) == "object" && DOCUMENTS.length == 0) {
        localCancel = true;
        errMess += "Missing court info: At least one entry in the DOCUMENTS list is required.";
    }

    if (typeof(OFFENSECODES) != "object") {
        localCancel = true;
        errMess += "Missing court info: At least one entry in the OFFENSE CODES list is required.";
    }
    if (typeof(OFFENSECODES) == "object" && OFFENSECODES.length == 0) {
        localCancel = true;
        errMess += "Missing court info: At least one entry in the OFFENSE CODES list is required.";
    }



    if (localCancel) {
        cancel = true;
        comment(errMess);
    }
}
