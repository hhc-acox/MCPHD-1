if (wfTask == 'Case Intake' && wfStatus == 'Accepted') {
    var zone = getGISInfo("MCPHD", "EHSMQuadrantDistrict", "Quadrant");
    var assignTo = lookup('GIS - EHSM Inspector', zone);
    scheduleInspectDate('Evaluate', nextWorkDay(dateAdd(null, 0)), assignTo);
}

if (wfTask == 'Billing' && wfStatus == 'Complete Billing Letter' && balanceDue > 0) {
    activateTask('Final Processing');
    updateAppStatus('Close Fees Outstanding', 'Close Fees Outstanding');
}

if (wfTask == 'Evaluation' && wfStatus == 'Court Order Needed') {
    sendNotificationForEHSMCourtNeeded(currentUserID + "", wfComment);
}

try {
    var TRARec = getParent();

    logDebug("Parent ID " + TRARec.getCustomID());
    var saveID = capId;
    capId = TRARec;

    if (((wfTask == "Final Processing" && wfStatus == "Finaled") || (wfTask == "Evaluation" && wfStatus == "No Work Assignment") || (wfTask == 'Billing' && wfStatus == 'Complete Billing Letter')) && TRARec) {
        logDebug("Trying to close RCP on TRA");
        closeTask("Request EHSM Clean", "EHSM Cleaned", "Updated by Script", "EHSM Cleaned");

        var isPaid = aa.fee.isFullPaid4Renewal(capId).getOutput();
        var ticketActive = false;
        var permanentInj = false;
        var pendingInsp = false;
        var crtCase = childGetByCapType('EnvHealth/CRT/NA/NA', capId);

        var tasks = aa.workflow.getTasks(capId).getOutput();

        for (e in tasks) {
            if (tasks[e].getTaskDescription().indexOf("Ticket") > -1 && tasks[e].getActiveFlag() == "Y") {
                ticketActive = true;
            }

            if (tasks[e].getTaskDescription().indexOf("Final Processing") > -1 && tasks[e].getDisposition() == "Permanent Injunction") {
                permanentInj = true;
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

        if (!ticketActive && !permanentInj && !crtCase && !pendingInsp) {
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
        logDebug('PI Status: ' + permanentInj);
        logDebug('CRT Case: ' + crtCase);
        logDebug('Pending Inspection: ' + pendingInsp);
    }
    capId = saveID;

} catch (err) {

}
