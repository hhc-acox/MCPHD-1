function copyParcelGisObjects4XAPO() {
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null); //grab all the parcels
	if (capParcelResult.getSuccess()) {
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels) {
	    		var parcel_i = Parcels[zz].getParcelNumber(); //this is parcel_i in MCPHD
	    		var retval = aa.gis.addCapGISObject(capId, "MCPHD", "Parcel", parcel_i); //add the parcel_i as the GIS layer stuff

	    		if (retval.getSuccess()) { logDebug("Successfully added Cap GIS object: " + parcel_i) }
	    		else { logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()); return false }

		}
	}
}
