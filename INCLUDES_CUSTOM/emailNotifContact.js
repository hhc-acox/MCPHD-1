function emailNotifContact(notName, emailRpt, rptName, contactType, respectPriChannel) {
try{
	// create a hashmap for report parameters
	var rptParams = aa.util.newHashMap();
	for (var i = 6; i < arguments.length; i = i + 2) {
		rptParams.put(arguments[i], arguments[i + 1]);
	}
	if(emailRpt && matches(rptName,"",null,"undefined")){
		logDebug("A report name is needed when emailRpt param is 'true'.");
		return false;
	}
	var emailNotif = false;
	//lwacht: defect4810 end
	//var emailDRPReport = false;
	var priContact = getContactObj(capId,contactType);
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(!respectPriChannel || priChannel.indexOf("Email") > -1 || priChannel.indexOf("E-mail") > -1){
				emailNotif = true;
			}else{
				if(respectPriChannel && priChannel.indexOf("Postal") > -1){
					var addrString = "";
					var contAddr = priContact.addresses;
					for(ad in contAddr){
						var thisAddr = contAddr[ad];
						for (a in thisAddr){
							if(!matches(thisAddr[a], "undefined", "", null)){
								if(!matches(thisAddr[a].addressType, "undefined", "", null)){
									addrString += thisAddr[a].addressLine1 + br + thisAddr[a].city + ", " + thisAddr[a].state +  " " + thisAddr[a].zip + br;
								}
							}
						}
					}
					if(addrString==""){
						addrString = "No addresses found.";
					}
					if(!matches(rptName, null, "", "undefined")){
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the report " + rptName + " to : " + br + addrString + "</font>");
					}else{
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the notification " + notName + " to : " + br + addrString + "</font>");
					}
				}
			}
		}else{
			logDebug("No primary channel found.  Defaulting to emailing the notification.");
			emailNotif = true;
		}
		if(emailNotif){
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			var contPhone = priContact.capContact.phone1;
			if(contPhone){
				var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
			}else{
				var fmtPhone = "";
			}
			addParameter(eParams, "$$altID$$", capId.getCustomID());
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$status$$", capStatus);
			//lwacht: 171214: end
			//logDebug("eParams: " + eParams);
			//var drpEmail = ""+priContact.capContact.getEmail();
			var priEmail = ""+priContact.capContact.getEmail();
			//var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
			var rFiles = [];
			if(!matches(rptName, null, "", "undefined")){
				var rFile;
				rFile = generateReport(capId,rptName,"Licenses",rptParams);
				if (rFile) {
					rFiles.push(rFile);
				}
			}
			if(emailRpt){
				sendNotification(sysFromEmail,priEmail,"",notName,eParams, rFiles,capId);
			}else{
				rFiles = [];
				sendNotification(sysFromEmail,priEmail,"",notName,eParams, rFiles,capId);
			}
		}
	}else{
		logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
	}
}catch(err){
	logDebug("An error occurred in emailNotifContact: " + err.message);
	logDebug(err.stack);
}}