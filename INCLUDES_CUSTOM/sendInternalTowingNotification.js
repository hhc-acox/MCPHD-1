function sendInternalTowingNotification() {
	var emailParams = aa.util.newHashtable();
	addParameter(emailParams, "$$capID$$", "" + capId.getCustomID());
	addParameter(emailParams, "$$CAPADDRESS$$", hhc_getTheAddress(capId));

	sendNotification(null, "lmorgan@marionhealth.org","", "HOUSING EMAIL TO TOWING EHS", emailParams, null, capId);
}
