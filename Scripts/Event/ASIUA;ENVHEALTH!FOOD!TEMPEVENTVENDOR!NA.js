maintainFoodRelationships();

// Adding fees for Days of Operation
var vCapId = getCapId();
var asitRes = aa.appSpecificTableScript.getAppSpecificTableModel(capId, 'EVENT DAYS OF OPERATION');

if (asitRes.getSuccess()) {
	var deviceTable = asitRes.getOutput().getAppSpecificTableModel();
	var fld = deviceTable.getTableField().toArray();

    var rowNum = fld.length / 4;

    logDebug("Assessing fees for " + rowNum + " event days.");

    if (rowNum > 0){
        // apply first day fee
        //feeSeq = addFee('TEV01', 'EH_TEV', 'FINAL', 1, 'Y');
        // apply additional day fee's
        if (rowNum > 1){
            feeSeq = addFee('TEV02', 'EH_TEV', 'FINAL', rowNum - 1, 'Y');
        }
    }
}
