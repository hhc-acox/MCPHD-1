function addSupervisorReview(itemCap, taskType, inspID, taskName, statusName) {
    if (isSupervisor(currentUserID)) {
        logDebug("User is supervisor");
    } else {
        assignTo = HHC_getMyTeamLeadersUserID(currentUserID);
        logDebug("Supervisor Review for: " + assignTo);

        if (taskType.toUpperCase() == "WORKFLOW") {
            logDebug("Workflow Supervisor Review Triggered");
            var stdWf = getStandardChoiceValues("SUPERVISOR_REVIEW_WORKFLOW");
            for (var e in stdWf) {
                if (appMatch(stdWf[e].value)) {
                    var wfKey = taskName + "|" + statusName;
                    var wfDisposition = taskName + "-" + statusName;
                    if (wfKey == stdWf[e].key || stdWf[e].key == '*') {
                        if (!isSupervisor(currentUserID) && !containsAcceptedOrPendingAdHocTaskForDisposition(capId, wfDisposition)) {

                            if (containsReworkAdHocTaskForDisposition(capId, wfDisposition)) {
                                sendNotificationForSupervisorReviewWkfl(assignTo, wfComment, 'EMSE_SUPREV_WKFL_SUP', taskName, statusName);
                            }

                            addAdHocTask("ADHOC_WORKFLOW", "Supervisor Review Workflow", wfDisposition, assignTo);
                            logDebug("Added Supervisor Review Workflow task");
                            activateTask(taskName);
                            updateTask(taskName, "In Progress", "Set by script", "Supervisor Review In Progress");
                            wfTask = "";
                            wfStatus = "";
                            //cancel = true;
                        }
                    }
                }
            }
        } else {
            if (taskType.toUpperCase() == "INSPECTION") {
                logDebug("Inspection Supervisor Review Triggered");
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
                                    var inspDate = "" + iObj.getScheduledDate().getMonth() + '/' + iObj.getScheduledDate().getDayOfMonth() + '/' + iObj.getInspectionDate().getYear();
                                    var inspKey = inspDate + "-" + inspType + "-" + iObj.getInspectionStatus() + "-" + iNumber;
                                    if (!isSupervisor(currentUserID) && !containsAcceptedOrPendingAdHocTaskForDisposition(capId, inspKey)) {
                                        var tinspComment = "";

                                        if (prefix == 'IRMA') {
                                            tinspComment += inspResultComment;
                                        } else {
                                            tinspComment += inspComment;
                                        }

                                        if (containsReworkAdHocTaskForDisposition(capId, inspKey)) {
                                            sendNotificationForSupervisorReviewInspection(assignTo, tinspComment, 'EMSE_SUPREV_INSP_SUP', iNumber);
                                        }

                                        HHC_addAdHocTask("ADHOC_WORKFLOW", "Supervisor Review Inspection", inspKey, assignTo, tinspComment);
                                        logDebug("Added Supervisor Review Inspection Task");
                                    }
                                }
                            }
                        }
                    } else {
                        logDebug("**ERROR retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage());
                    }
                } else {
                    logDebug("Incorrect parameters");
                }
            } else {
                logDebug("Unknown adhoc task type");
            }
        }
    }
}
