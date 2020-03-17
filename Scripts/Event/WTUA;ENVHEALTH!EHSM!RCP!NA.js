if(wfTask == 'Case Intake' && wfStatus == 'Accepted') {
    var zone = getGISInfo("MCPHD", "EHSMQuadrantDistrict", "Quadrant");
    var assignTo = lookup('GIS - EHSM Inspector',zone); 
    scheduleInspectDate('Evaluate',nextWorkDay(dateAdd(null,0)),assignTo);
}

try{
                var TRARec = getParent();

                logDebug("Parent ID " + TRARec.getCustomID());
                var saveID = capId;
                capId = TRARec;

                if(((wfTask=="Final Processing" && wfStatus=="Finaled") || (wfTask=="Evaluation" && wfStatus=="No Work Assignment")) && TRARec){
                    logDebug("Trying to close RCP on TRA");
                    closeTask("Request EHSM Clean", "EHSM Cleaned", "Updated by Script", "EHSM Cleaned");
                }
                capId = saveID;
                
}catch(err){

}
