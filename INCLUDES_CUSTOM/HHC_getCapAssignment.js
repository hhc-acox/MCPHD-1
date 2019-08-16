function HHCgetCapAssignment(capId){
	try {
	var itemCap = capId
	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();
	var theAssignStaff = cd.getAsgnStaff();
	var theCapAssigned = theAssignStaff.getOutput();
	return theCapAssigned;
	}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHCgetCapAssignment:  " + err.message);
		logDebug(err.stack);
		}
	}