function hhc_getTheCensusTract(capId)
{
		try {
	//This section gets the parcel information from the case.  We need the Census Tract to determine the Team Leader for the Case.
	var fcapParcelObj = null; //This holds the parcel information
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
		if (capParcelResult.getSuccess())
		{
			var fcapParcelObj = capParcelResult.getOutput().toArray();
			var thisCensusTract = fcapParcelObj[0].getCensusTract();  //Use the Census Tract to get the Team Leader for the Case.
		}
		else
		{
			logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" +capParcelResult.getErrorMessage());
		}
		
	return thisCensusTract;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getTheCensusTract:  " + err.message);
		logDebug(err.stack);
	}
}