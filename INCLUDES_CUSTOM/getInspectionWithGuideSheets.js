
function getInspectionWithGuideSheets(pcap, pnbr) {
    var insps = aa.inspection.getInspections(pcap).getOutput();
    var d = null;
    for (var i in insps) {
        if (pnbr == insps[i].getIdNumber())
            return insps[i];
    }
    return null;
}
