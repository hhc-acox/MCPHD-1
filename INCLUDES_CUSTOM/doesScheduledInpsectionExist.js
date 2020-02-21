function doesScheduledInpsectionExist(capId) {
    var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
    {
        var inspList = inspResultObj.getOutput();
        for (xx in inspList)
            if (inspList[xx].getInspectionStatus() == 'Scheduled'){
                return true;
            } 
    }
	return false;
}
