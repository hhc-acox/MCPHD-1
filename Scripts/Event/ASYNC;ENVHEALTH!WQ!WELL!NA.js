//GQ TICKET 259
var childId = createChild("EnvHealth", "WQ", "Pump", "NA", "Created from " + capIDString);
var asgnToUser = null;
if (capDetailObjResult.getSuccess()) {
    var cd = capDetailObjResult.getOutput();
    if (cd.getAsgnStaff() != null) {
        asgnToUser = String(cd.getAsgnStaff()).toUpperCase();
        logDebug("Found Record Assignment " + asgnToUser);
    }
}
if (asgnToUser != null) {
    assignCap(asgnToUser, childId);
    var tCapId = capId;
    capId = childId;
    var taskUsr = hhcgetUserByDiscipline('WQBodyArtChildCareSupp');
    updateTask('Intake','Pending','Updated by script');
    assignTask("Intake", taskUsr);
    feeSeq = addFee("WQ_PUMP", "WQ_PUMP", "FINAL", 1, "Y");
    invoiceOneNow(feeSeq, "FINAL", capId);
    capId = tCapId;
}
