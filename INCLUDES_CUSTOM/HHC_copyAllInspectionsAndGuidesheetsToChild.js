function HHC_copyAllInspectionsAndGuidesheetsToChild(capId){
	try{
	var insps = aa.inspection.getInspections(capId).getOutput();
	for (i in insps) {
		var inspId = insps[i].getInspection();
		var copy = aa.inspection.copyInspectionWithGuideSheet(capId, newChildID, inspId);
			}
		}
catch(err){
	logDebug("A JavaScript Error occurred: copyGuidesheetToChild: " + err.message);
	logDebug(err.stack);
}	
}
