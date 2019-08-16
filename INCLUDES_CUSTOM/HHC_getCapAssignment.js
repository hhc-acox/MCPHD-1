function HHC_getCapAssignment(capId){
	try {
	var theCapAssigned =  = capDetail.getAsgnStaff();
	return theCapAssigned;
	}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHCgetCapAssignment:  " + err.message);
		logDebug(err.stack);
		}
	}
