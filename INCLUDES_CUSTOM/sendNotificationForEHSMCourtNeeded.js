function sendNotificationForEHSMCourtNeeded(userId, tcomment) {

    if (userId) {
        var email = "";

        if (isSupervisor(userId)) {
            logDebug('User is Supervisor');
            email = getEmailByUserID(userId);
        } else {
            logDebug('User is not Supervisor');
            var supervisorId = HHC_getMyTeamLeadersUserID(userId);
            email = getEmailByUserID(supervisorId);
        }

        logDebug('Email: ' + email);

        if (email.indexOf("@") > 0) {
            var tparentCapId = getParent();
            logDebug('Got parent');
            if (tparentCapId) {
                var EMAIL_FROM = "accela-noreply@marionhealth.org";
                var customId = tparentCapId.getCustomID();
                logDebug('customId: ' + customId);
                var oldCustomId = capId.getCustomID();
                logDebug('oldCustomId: ' + oldCustomId);
                var tid1 = tparentCapId.getID1();
                logDebug('tid1: ' + tid1);
                var tid2 = tparentCapId.getID2();
                logDebug('tid2: ' + tid2);
                var tid3 = tparentCapId.getID3();
                logDebug('tid3: ' + tid3);
    
                // send notification
                var eParams = aa.util.newHashtable();
                eParams.put("$$CAPID$$", customId);
                eParams.put("$$CAPID1$$", tid1);	
                eParams.put("$$CAPID2$$", tid2);	
                eParams.put("$$CAPID3$$", tid3);
                eParams.put("$$OLDCAPID$$", oldCustomId);	
                eParams.put("$$WFCOMMENT$$", tcomment + "");
                
                sendNotification(
                    EMAIL_FROM
                    , String(email)
                    , ""
                    , "EMSE_RCP_COURT_NEEDED"
                    , eParams
                    , [], capId
                );
            }
        }                        
    }
}
