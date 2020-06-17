//lwacht: 270918: #132: Auto Schedule Initial Inspection
try{
	if(wfTask=="Complaint Intake" && wfStatus.indexOf("Accepted")>-1){
		scheduleInspectDate("Complaint",dateAdd(null,1,"Y"));
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Food/Complaint/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 270918: #132: end

var assignToInsp = HHC_getCapAssignment(capId);
if(wfTask == 'Complaint Review' && wfStatus == 'Inspection Required' && (getAppSpecific('Illness Complaint?') == 'No' || getAppSpecific('Illness Complaint?') == 'N') ) {
    //scheduleInspectDate('Non-illness Complaint',nextWorkDay(),assignToInsp);
    scheduleFoodInspectionsByDate('Non-illness Complaint', nextWorkDay(), assignToInsp, capId);
} 
if (wfTask == 'Complaint Review' && wfStatus == 'Inspection Required' && (getAppSpecific('Illness Complaint?') == 'Yes' || getAppSpecific('Illness Complaint?') == 'Y') ){
    //scheduleInspectDate('Illness Complaint',nextWorkDay(),assignToInsp);
    scheduleFoodInspectionsByDate('Illness Complaint', nextWorkDay(), assignToInsp, capId);
}
