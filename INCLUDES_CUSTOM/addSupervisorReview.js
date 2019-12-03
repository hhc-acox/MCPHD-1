function addSupervisorReview(itemCap, taskType, inspID, taskName, statusName) {

    assignTo = HHC_getMyTeamLeadersUserID(currentUserID);
    logDebug("Assigned To: " + assignTo);

    if (taskType.toUpperCase() == "WORKFLOW") {
        recordTypeToMatch = lookup("SUPERVISOR_REVIEW_WORKFLOW", "" + taskName + "|" + statusName);
        if (recordTypeToMatch && recordTypeToMatch != "") {
            if (appMatch(recordTypeToMatch, itemCap)) {
                if (!isSupervisor(currentUserID)) {
                    addAdHocTask("ADHOC_WORKFLOW", "Supervisor Review Workflow", taskName + "-" + statusName, assignTo);
                    logDebug("Added Supervisor Review Workflow task");
                    activateTask(taskName);
                    updateTask(taskName, "In Progress", "Supervisor Review in progress", "Set by script");
                }
            }
            else {
                logDebug("Record type does not match entry in standard choice SUPERVISOR_REVIEW_WORKFLOW");
            }
        }
        else {
            logDebug("workflow task name and status not found in std choice SUPERVISOR_REVIEW_WORKFLOW");
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
                    recordTypeToMatch = lookup("SUPERVISOR_REVIEW_INSPECTION", inspType);
                    if (appMatch(recordTypeToMatch, itemCap)) {
                        if (!isSupervisor(currentUserID)) {
                            inspDate = "" + iObj.getScheduledDate().getMonth() + iObj.getScheduledDate().getDayOfMonth() + iObj.getInspectionDate().getYear();
                            addAdHocTask("ADHOC_WORKFLOW", "Supervisor Review Inspection", inspDate + "-" + inspType + "-" + iObj.getInspectionStatus() + "-" + iNumber, assignTo);
                            logDebug("Added Supervisor Review Inspection Task");
                        }
                    }
                    else {
                        logDebug("Record type does not match entry in standard choice SUPERVISOR_REVIEW_INSPECTION");
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
