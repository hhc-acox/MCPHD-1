function addSupervisorReview(itemCap, taskType, inspID, taskName, statusName) {
    assignTo = HHC_getMyTeamLeadersUserID(currentUserID);
    logDebug("Assigned To: " + assignTo);

    if (taskType.toUpperCase() == "WORKFLOW") {
		var stdWf = getStandardChoiceValues("SUPERVISOR_REVIEW_WORKFLOW");
		for (var e in stdWf) {
			if (appMatch(stdWf[e].value)) {
				var wfKey = taskName + "|" + statusName;
				var wfDisposition = taskName + "-" + statusName;
				if (wfKey == stdWf[e].key || stdWf[e].key == '*') {
					if (!isSupervisor(currentUserID) && !containsAcceptedAdHocTaskForDisposition(capId, wfDisposition)) {
						addAdHocTask("ADHOC_WORKFLOW", "Supervisor Review Workflow", wfDisposition, assignTo);
						logDebug("Added Supervisor Review Workflow task");
						activateTask(taskName);
						updateTask(taskName, "In Progress", "Supervisor Review in progress", "Set by script");
					}
				}
			}
		}
    }
    else {
        if (taskType.toUpperCase() == "INSPECTION") {
            if (inspID) {
                iNumber = inspID;
                iObjResult = aa.inspection.getInspection(capId, iNumber);
                if (iObjResult.getSuccess()) {
                    iObj = iObjResult.getOutput();
                    inspType = iObj.getInspectionType();
					var stdInsp = getStandardChoiceValues("SUPERVISOR_REVIEW_INSPECTION");
					for (var e in stdInsp) {
						if (appMatch(stdInsp[e].value)) {
							if (inspType == stdInsp[e].key || stdInsp[e].key == '*') {
                                                                var inspDate = "" + iObj.getScheduledDate().getMonth() + iObj.getScheduledDate().getDayOfMonth() + iObj.getInspectionDate().getYear();
								var inspKey = inspDate + "-" + inspType + "-" + iObj.getInspectionStatus() + "-" + iNumber;
								if (!isSupervisor(currentUserID) && !containsAcceptedAdHocTaskForDisposition(capId, inspKey)) {
									addAdHocTask("ADHOC_WORKFLOW", "Supervisor Review Inspection", inspKey, assignTo);
									logDebug("Added Supervisor Review Inspection Task");
								}
							}
						}
					}
                }
                else {
                    logDebug("**ERROR retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage());
                }
            }
            else {
                logDebug("Incorrect parameters");
            }
        }
        else {
            logDebug("Unknown adhoc task type");
        }
    }
}
