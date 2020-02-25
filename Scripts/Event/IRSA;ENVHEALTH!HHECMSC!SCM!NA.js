//GQ: Ticket #261
//Schedule Follow-ups 3 months, 3 months, 6 months
if (String(inspType) == "Initial Inspection" && String(inspResult) == "Complete") {
    scheduleInspectDate("Follow-up Inspection", dateAdd(dateAddMonths(null, 3), 0, true), currentUserID);
}

if (String(inspType) == "Follow-up Inspection" && String(inspResult) == "Complete") {
    var inspArr = aa.inspection.getInspections(capId).getOutput();
    var inspFound = 0;
    for (var i in inspArr) {
        var insp = inspArr[i];
        if (String(insp.getInspectionType()) == "Follow-up Inspection") {

            if (matches(String(insp.getInspectionStatus()), "Complete")) {
                inspFound++;
                if (inspFound > 2) {
                    break;
                }
            }
        }
    }
    if(inspFound == 1){
        scheduleInspectDate("Follow-up Inspection", dateAdd(dateAddMonths(null, 3), 0, true), currentUserID);
    }
    if(inspFound == 2){
        scheduleInspectDate("Follow-up Inspection", dateAdd(dateAddMonths(null, 6), 0, true), currentUserID);
    }
}
