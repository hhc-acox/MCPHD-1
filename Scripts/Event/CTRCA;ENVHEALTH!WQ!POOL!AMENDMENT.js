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
		copyLicensedProf(capId, parCapId)
		var arrLPs = getLicensedProfessionalObjectsByRecord(parCapId);
		for(lp in arrLPs){
			var thisCont = arrLPs[lp];
			var rLP = thisCont.refLicModel;
			refContactNum = rLP.licSeqNbr;

			// check to see if public user exists already based on email address
			var getUserResult = aa.publicUser.getPublicUserByEmail(rLP.EMailAddress)
			if (getUserResult.getSuccess() && getUserResult.getOutput()) {
				userModel = getUserResult.getOutput();
				logDebug("CreatePublicUserFromContact: Found an existing public user: " + userModel.getUserID());
			}

			if (!userModel) {
				logDebug("CreatePublicUserFromContact: creating new user based on email address: " + rLP.EMailAddress); 
				var publicUser = aa.publicUser.getPublicUserModel();
				publicUser.setFirstName(contact.getFirstName());
				publicUser.setLastName(contact.getLastName());
				publicUser.setEmail(rLP.EMailAddress);
				publicUser.setUserID(rLP.EMailAddress);
				publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
				publicUser.setAuditID("PublicUser");
				publicUser.setAuditStatus("A");
				publicUser.setCellPhone(contact.getCapContactModel().getPeople().getPhone2());
				var result = aa.publicUser.createPublicUser(publicUser);
				if (result.getSuccess()) {
					logDebug("Created public user " + rLP.EMailAddress + "  sucessfully.");
					var userSeqNum = result.getOutput();
					var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

					// create for agency
					aa.publicUser.createPublicUserForAgency(userModel);

					// activate for agency
					var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
						userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(servProvCode,userSeqNum,"ADMIN");

						// reset password
						var resetPasswordResult = aa.publicUser.resetPassword(rLP.EMailAddress);
						if (resetPasswordResult.getSuccess()) {
							var resetPassword = resetPasswordResult.getOutput();
							userModel.setPassword(resetPassword);
							logDebug("Reset password for " + rLP.EMailAddress + "  sucessfully.");
						} else {
							logDebug("**ERROR: Reset password for  " + rLP.EMailAddress + "  failure:" + resetPasswordResult.getErrorMessage());
						}

					// send Activate email
					aa.publicUser.sendActivateEmail(userModel, true, true);

					// send another email
					aa.publicUser.sendPasswordEmail(userModel);
				}else {
					logDebug("**Warning creating public user " + rLP.EMailAddress + "  failure: " + result.getErrorMessage());
				}
				comment("getUserResult.getSuccess() : " + getUserResult.getOutput() );
				if ( !getUserResult.getOutput()) {
					cancel = true;
					showMessage = true;
					comment("This contact does not have an associated ACA user--please contact this user to set up their ACA account: " + rLP.EMailAddress+".");
				}
			}
			if (refContactNum){
				logDebug("CreatePublicUserFromContact: Linking this public user with LP : " + refContactNum);
				
				var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode, refContactNum);
				var lpsm = lpsmResult.getOutput();
				var resCreate = aa.licenseScript.associateLpWithPublicUser(userModel, lpsm);
			}
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

