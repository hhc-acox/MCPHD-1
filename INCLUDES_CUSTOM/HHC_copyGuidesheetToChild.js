HHC_copyGuidesheetToChild(capId){
	try{
	var r = aa.inspection.getInspections(capId);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {	
		var inspModel = inspArray[i].getInspection();
		copyInspectionWithGuideSheet(capId, newChildID, inspModel);
			}
		}
	}
catch(err){
	logDebug("A JavaScript Error occurred: copyGuidesheetToChild: " + err.message);
	logDebug(err.stack);
}	
}