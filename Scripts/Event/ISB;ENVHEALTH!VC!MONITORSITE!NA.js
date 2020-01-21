//GQ: Ticket #169
//Blocks Adulticide schedule when already 2 in 7 day period
if(inspType == "Adulticide"){
    var inspArr = aa.inspection.getInspections(capId).getOutput();
    var checkDate = new Date(dateAdd(null,-7));
    var inspFound = 0;
    for (var i in inspArr) {
        var insp = inspArr[i];
        if (String(insp.getInspectionType()) == "Adulticide") {
            if (matches(String(insp.getInspectionStatus()), "Scheduled", "Technician Complete", "In Progress")) {
                var rdt = insp.getInspectionStatusDate();
                if (rdt != null) {
                    var ludt = new Date(dateAdd(rdt, 0));
                    if (ludt > checkDate) {
                        logDebug("Existing in Last 7 days found")
                        inspFound++;
                        if(inspFound >= 2){
                            cancel=true;
                            showMessage=true;
                            comment("2 or more Adulticide(s) already scheduled for this site within last 7 days.");
                            break;
                        }
                    }
                }
            }
        }
    }
}