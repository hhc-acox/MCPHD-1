function sendNotificationForSupervisorReviewWkfl(userId, tcomment, template, twfTask, twfStatus) {

    if (userId) {
        var email = getEmailByUserID(supervisorId);
        logDebug('Email: ' + email);

        if (email.indexOf("@") > 0) {
            var EMAIL_FROM = "accela-noreply@marionhealth.org";
            var customId = capId.getCustomID();
            logDebug('customId: ' + customId);
            var tid1 = capId.getID1();
            logDebug('tid1: ' + tid1);
            var tid2 = capId.getID2();
            logDebug('tid2: ' + tid2);
            var tid3 = capId.getID3();
            logDebug('tid3: ' + tid3);

            // send notification
            var eParams = aa.util.newHashtable();
            eParams.put("$$CAPID$$", customId);
            eParams.put("$$CAPID1$$", tid1);	
            eParams.put("$$CAPID2$$", tid2);	
            eParams.put("$$CAPID3$$", tid3);
            eParams.put("$$WFTASK$$", twfTask);	
            eParams.put("$$WFSTATUS$$", twfStatus);
            eParams.put("$$WFCOMMENT$$", tcomment + "");
            
            sendNotification(
                EMAIL_FROM
                , String(email)
                , ""
                , template
                , eParams
                , [], capId
            );
        }                 
    }
}
