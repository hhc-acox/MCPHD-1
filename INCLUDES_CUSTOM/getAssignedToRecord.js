function getAssignedToRecord() {
	try {
		cap = aa.cap.getCapDetail(capId).getOutput();
		var capAssignPerson = cap.getAsgnStaff();
		return capAssignPerson;
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAssignedToRecord:  " + err.message);
		logDebug(err.stack);
	}
} 
