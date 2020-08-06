if (doesRecordHaveActiveSupervisorReview()) {
	showMessage = true;
	comment("Supervisor Review in process");
	cancel = true;
}

if (matches(wfStatus, "Court", "Court Case", "Refer to Court")) {
    if (!validateContactsForCourt()) {
        cancel = true;
        showMessage = true;
        comment("<font color=red><b>Contact(s) must all have a full name and either a first and last name OR business name to file for court.</b></font>");
        aa.print("Contact(s) must all have a full name and either a first and last name OR business name to file for court.");
    }
}

/*
if (!isSupervisor(currentUserID) && wfTask.indexOf("Supervisor Review > -1")){
        showMessage = true;
	comment("Only Supervisor's can update Supervisor Review tasks");
	cancel = true;
}
*/
