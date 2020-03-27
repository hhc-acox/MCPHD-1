if(wfTask == 'Case Intake' && wfStatus == 'Accepted') {
    var zone = getGISInfo("MCPHD", "EHSMQuadrantDistrict", "Quadrant");
    var assignTo = lookup('GIS - EHSM Inspector',zone); 
    scheduleInspectDate('Evaluate',nextWorkDay(dateAdd(null,0)),assignTo);
}

if (wfTask == 'Billing' && wfStatus == 'Complete Billing Letter' && balanceDue > 0) {
    activateTask('Final Processing');
    updateAppStatus('Close Fees Outstanding','Close Fees Outstanding');
}

if (wfTask == 'Evaluation' && wfStatus == 'Court Order Needed') {
    sendNotificationForEHSMCourtNeeded(currentUserID+"", wfComment);
}

try{
                var TRARec = getParent();

                logDebug("Parent ID " + TRARec.getCustomID());
                var saveID = capId;
                capId = TRARec;

                if(((wfTask=="Final Processing" && wfStatus=="Finaled") || (wfTask=="Evaluation" && wfStatus=="No Work Assignment") || (wfTask == 'Billing' && wfStatus == 'Complete Billing Letter')) && TRARec){
                    logDebug("Trying to close RCP on TRA");
                    closeTask("Request EHSM Clean", "EHSM Cleaned", "Updated by Script", "EHSM Cleaned");
                }
                capId = saveID;
                
}catch(err){

}
