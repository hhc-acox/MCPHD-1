function getInspectorByInspID(inspNum)
{
	var inspResultObj = aa.inspection.getInspection(capId,inspNum);
	if (inspResultObj.getSuccess())
    	{
		var inspObj = inspResultObj.getOutput();
		
        // have to re-grab the user since the id won't show up in this object.
        inspUserObj = aa.person.getUser(inspObj.getInspector().getFirstName(),inspObj.getInspector().getMiddleName(),inspObj.getInspector().getLastName()).getOutput();
        return inspUserObj.getUserID();
    	}
	return false;
}
