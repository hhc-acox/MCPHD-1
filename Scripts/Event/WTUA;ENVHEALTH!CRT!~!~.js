//lwacht: 181019: #123: New Status for Injunction
try{
	if(wfStatus=="Permanent Injunction"){
		var parCapId = false;
		if(parentCapId){
			parCapId = parentCapId;
		}else{
			var parAltId = AInfo["Parent Case"];
			parCapId = getApplication(parAltId);
		}
		if(parCapId){
			updateAppStatus("Permanent Injunction","Updated via WTUA:EnvHealth/Housing/*/*", parCapId);
			if(!checkInspectionResult("Reinspection","Scheduled")){
				var currCap = capId;
				capId = parCapId;
				var inspUserId = getInspector("Initial Inspection");
				capId = currCap;
				if(inspUserId){
					scheduleInspect(parCapId,"Reinspection",180,inspUserId);
				}else{
					scheduleInspect(parCapId,"Reinspection",180);
				}
			}
		}else{
			logDebug("No parent record found.  No reinspection scheduled.");
		}			
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Housing/CRT/*: Permanent Injunction: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181019: #123: end

//lwacht: 181022: #143: Fee Assessments
try{
	if(wfTask=="Reinspection" && wfStatus.indexOf("Ticket Issued")>-1){
		updateFee("H_T100", "H_TRA", "FINAL", 1, "Y", "Y");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/CRT/*/*: Fee assessments: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181022: #143: end

//lwacht: 181030: #124: Efficiencies when closing Injunction
try{
	if(matches(wfStatus,"Cause Dismiss","Compliance","Contempt","Dismissed") && wfTask == 'Permanent Injunction'){
		var parCapId = false;
		if(parentCapId){
			parCapId = parentCapId;
		}else{
			var parAltId = AInfo["Parent Case"];
			parCapId = getApplication(parAltId);
		}
		if(parCapId){
			//updateAppStatus("Active","Updated via WTUA:EnvHealth/Housing/*/*", parCapId);
			            
            if (parCapId.getCustomID().indexOf('TRA') > -1) {
                var saveID = capId;
                capId = parCapId;

                logDebug("Trying to close PI on TRA");
                closeTask("Recurring Inspection", "Closed", "Updated by Script", "Closed");

                /*
                var isPaid = aa.fee.isFullPaid4Renewal(capId).getOutput();
                var ticketActive = false;
                var pendingInsp = false;
                var ehsmClean = false;

                var tasks = aa.workflow.getTasks(capId).getOutput();

                for (e in tasks) {
                    if (tasks[e].getTaskDescription().indexOf("Ticket") > -1 && tasks[e].getActiveFlag() == "Y") {
                        ticketActive = true;
                    }

                    if (tasks[e].getTaskDescription().indexOf("Request EHSM Clean") > -1 && tasks[e].getActiveFlag() == "Y") {
                        ehsmClean = true;
                    }
                }

                var inspResultObj = aa.inspection.getInspections(capId);
                if (inspResultObj.getSuccess()) {
                    var inspList = inspResultObj.getOutput();
                    for (xx in inspList) {
                        if (inspList[xx].getInspectionStatus() == 'Scheduled') {
                            pendingInsp = true;
                        }
                    }
                }

                if (pendingInsp) {
                    inspCancelAll();
                }

                if (!ticketActive && !ehsmClean) {
                    if (isPaid) {
                        closeTask("Final Processing", "Finaled", "Updated by Script", "Finaled");
                        updateAppStatus('Finaled', 'Finaled');
                    } else {
                        closeTask("Final Processing", "Closed/Fees Outstanding", "Updated by Script", "Closed/Fees Outstanding");
                        updateAppStatus('Closed/Fees Outstanding', 'Closed/Fees Outstanding');
                    }
                    var workflowResult = aa.workflow.getTasks(capId);

                    if (workflowResult.getSuccess()) {
                        wfObj = workflowResult.getOutput();

                        for (i in wfObj) {
                            fTask = wfObj[i];
                            if (fTask.getActiveFlag().equals("Y")) {
                                deactivateTask(fTask.getTaskDescription());
                            }
                        }
                    }
                }

                logDebug('Is Full Paid: ' + isPaid);
                logDebug('Ticket Status: ' + ticketActive);
                logDebug('Pending Inspection: ' + pendingInsp);
                logDebug('EHSM Clean' + ehsmClean);
                */
                capId = saveID;
            }
		}else{
			logDebug("No parent record found.  No updates made.");
		}			
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/CRT/*/*: Closing Injunction: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181030: #124: end
if (wfTask == 'Court' && matches(wfStatus,'Admin EHSM Clean Up Needed','Cause Dismiss','Compliance','Dismiss for Demo', 'Dismiss for VBE Hearing', 'EC Clean Up', 'EHSM Clean Up')) {
    deactivateTask('Permanent Injunction');
}
