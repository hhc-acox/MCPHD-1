function HHC_SEND_BBE_EMAILS() {
	try{
		
		var vioAddress = hhc_getTheAddress(capId);
		appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
		appConType = cContactAry[yy].getCapContactModel().getContactType();
		appEmail = cContactAry[yy].getPeople().getEmail();
		var br = '<BR>';
		var emailDan = 'dfries@marionhealth.org';
		var emailLarry = 'llobdell@marionhealth.org';
		var sendALetter = false;
		var hsgEmailSubject = 'A Bed Bug Case was Created by Housing';
		var bbeEmailSubject = 'A Bed Bug Case was Created';
		var appDate = dateAdd(null,0);
		var appTOC = 'Personal';
		var appCOM = '';
		var appTOD = 'Information Packet';
		sendAnEmail = false;
		var cType = false;
		var emailSubject = bbeEmailSubject;
		var emailDContent = 'An email was sent to '+appName+' ('+appEmail+') '+'regarding bed bugs found at '+vioAddress+' with the recommended informational packet attached. '+br+br+'A copy of this email also went to Larry Lobdell.'+br+br+'Sincerely,'+br+br+"Accela's Automated Email Distribution";
		var emailLContent = 'An email was sent to '+appName+' ('+appEmail+') '+'regarding bed bugs found at '+vioAddress+' with the recommended informational packet attached. '+br+br+'A copy of this email also went to Dan Fries.'+br+br+'Sincerely,'+br+br+"Accela's Automated Email Distribution";
		var mailDContent = 'A letter was sent to '+appName+' regarding bed bugs found at '+vioAddress+' with the recommended informational packet included. '+br+br+'A copy of this letter also went to Larry Lobdell.'+br+br+'Sincerely,'+br+br+"Accela's Automated Email Distribution";
		var mailLContent = 'A letter was sent to '+appName+' regarding bed bugs found at '+vioAddress+' with the recommended informational packet included. '+br+br+'A copy of this letter also went to Dan Fries.'+br+br+'Sincerely,'+br+br+"Accela's Automated Email Distribution";
		var emailContentToOwner = 'Dear '+appName+', '+br+br+'A recent inspection conducted at '+vioAddress+' revealed that evidence of bed bugs was found at this address.  This email contains information about steps you can take to eliminate bed bugs from your home.  Please read the recommended informational packet attached. '+br+br+'If you have questions about this situation, please call our Bed Bug Hotline at (317) 221-7454.  '+br+br+'Thank you,'+br+br+'Marion County Public Health Department';
		var emailSubjectToOwner = 'Information Regarding a Recent Inspection';
			if (matches(appConType, 'DH/Owner', 'Occupant','Property Owner','Tenant')) {
				cType = true;
				}

			if (!matches(appEmail, null,'',' ')) {
				sendAnEmail = true;
				}

			if (cType && sendAnEmail) {
				email(emailDan, 'rvoller@hhcorp.org',emailSubject,emailDContent);
				email(emailLarry, 'rvoller@hhcorp.org',emailSubject,emailLContent);
				email(appEmail,emailDan,emailSubjectToOwner,emailContentToOwner);
				elementArray['Date'] = appDate;
				elementArray['Type of Contact'] = appTOC;
				elementArray['Contact Name'] = appName;
				elementArray['Comments'] = appCOM;
				elementArray['Types of Documents'] = appTOD;
				elementArray['Method'] = 'Email';
				masterArray.push(elementArray);
				elementArray = new Array();
				}

			if (cType && sendAnEmail == false) {
				email(emailDan, 'rvoller@hhcorp.org',emailSubject,mailDContent);
				email(emailLarry, 'rvoller@hhcorp.org',emailSubject,mailLContent);
				email(appEmail,emailDan,emailSubjectToOwner,emailContentToOwner);
				elementArray['Date'] = appDate;
				elementArray['Type of Contact'] = appTOC;
				elementArray['Contact Name'] = appName;
				elementArray['Comments'] = appCOM;
				elementArray['Types of Documents'] = appTOD;
				elementArray['Method'] = 'Mail';
				masterArray.push(elementArray);
				elementArray = new Array();
				}

		}
}