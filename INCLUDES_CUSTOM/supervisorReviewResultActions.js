function supervisorReviewResultActions(taskName, tNote) {
	if(taskName == "Supervisor Review Workflow") {
		var pieces = tNote.split("-");
		if (pieces && pieces.length == 2) {
			aa.print("activating task " + pieces[0]);
			activateTask("" + pieces[0]);
			updateTask("" + pieces[0], "Rework", "set by script");
		}
	}
	if (taskName == "Supervisor Review Inspection") {
		var pieces = note.split("-");
		if (pieces && pieces.length == 4) {
			inspID = pieces[3];
			var inspResultObj = aa.inspection.getInspection(capId, inspID);
			if (inspResultObj.getSuccess()) {
				var inspScriptModel = inspResultObj.getOutput();
				if (inspScriptModel != null) {
					insp = inspScriptModel.getInspection();
					insp.setInspectionStatus("Rework");
					editResult = aa.inspection.updateInspectionForSuperVisor(insp);
					if (editResult.getSuccess()) { logDebug("Editing inspection " + inspId); }
				   else { logDebug("Error editing the inspection " + editResult.getErrorMessage()); }
				}
			}
		}
	}
}