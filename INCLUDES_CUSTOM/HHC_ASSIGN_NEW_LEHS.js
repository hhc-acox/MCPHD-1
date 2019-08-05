function HHC_ASSIGN_NEW_LEHS() {
	try{
		var ctLead = AInfo['ParcelAttribute.CensusTract'];
		var newUserIDfull = lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']);
			newUserID = convertForAssignedTo(newUserIDfull);
			if (AInfo['Assigned To'] != null && AInfo['Assigned To'] != AInfo['Previous Assigned To']) {
				var newUserID = AInfo['Assigned To'];
				}

			if (checkInspectionResult('Initial Lead Inspection', 'Scheduled') == true) {
				inspNum=getScheduledInspId('Initial Lead Inspection');
				}

			if (checkInspectionResult('Reinspection', 'Scheduled') == true) {
				inspNum=getScheduledInspId('Reinspection');
				}
				editAppSpecific('Previous Assigned To', newUserID);
				editAppSpecific('Assigned To', newUserID);
				editAppSpecific('Census Tract', ctLead);
				assignCap(newUserIDfull);
				
			if (checkInspectionResult('Initial Lead Inspection', 'Scheduled')) {
				assignInspection(inspNum, newUserIDfull);
				}

			if (checkInspectionResult('Reinspection', 'Scheduled')) {
				assignInspection(inspNum, newUserIDfull);
				}

		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP_COURT:  " + err.message);
		logDebug(err.stack);
	}
}