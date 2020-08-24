function validateAdditionalViolations() {
    var vWorkflowHistList = aa.workflow.getWorkflowHistory(capId, null).getOutput();
    var dateToUse = null;

    for (var x in vWorkflowHistList) {
        var taskObj = vWorkflowHistList[x];
        var taskStatus = taskObj.disposition;

        if (taskStatus == 'Complete Add Vio Reinspection Ltr')
        var taskDate = taskObj.getStatusDate();

        if (!dateToUse) {
            dateToUse = taskDate;
        } else if (taskDate > dateToUse) {
            dateToUse = taskDate;
        }
    }

    var letterDate = new Date((dateToUse + "").replace(' ', 'T') + "00Z");
    letterDate = new Date(dateAdd(letterDate, 1));

    var srchTable = new Array();
    var dateArr = new Array();
    var dateOfLastViolation = null;
    srchTable = loadASITable('VIOLATIONS');

    if (srchTable) {
        for (x in srchTable) {
            thisRow = srchTable[x];
            if (thisRow["Status"].toString() == "Court" || thisRow["Status"].toString() == "Open") {
                var dateToCheck = new Date(thisRow["Date"]);

                if (!dateOfLastViolation) {
                    dateOfLastViolation = dateToCheck
                } else if (dateToCheck > dateOfLastViolation) {
                    dateOfLastViolation = dateToCheck
                }

                if (!arrayContains(dateArr, thisRow["Date"].toString())) {
                    dateArr.push(thisRow["Date"].toString());
                }
            }
        }
    }

    if (dateArr.length > 1) {
        if (dateOfLastViolation > letterDate || !dateToUse) {
            if (matches(wfStatus, "Court", "Court Case", "Refer to Court")) {
                cancel = true;
                showMessage = true;
                comment("<font color=red><b>Record must have an Additional Violation Reinspection Letter completed before creating CRT.</b></font>");
                aa.print("Record must have an Additional Violation Reinspection Letter completed before creating CRT.");
            }
    
            if (matches(wfStatus, "Reinspection", "Reinspection Letter", "Complete Reinspection Ltr", "Complete Reinspection Letter")) {
                cancel = true;
                showMessage = true;
                comment("<font color=red><b>Record must have an Additional Violation Reinspection Letter completed before creating a reinspection or reinspection letter.</b></font>");
                aa.print("Record must have an Additional Violation Reinspection Letter completed before creating a reinspection or reinspection letter.");
            }
        }    
    }
}
