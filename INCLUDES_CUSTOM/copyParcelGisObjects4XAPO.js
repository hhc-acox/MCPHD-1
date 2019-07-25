function copyParcelGisObjects4XAPO() {
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
	if (capParcelResult.getSuccess()) {
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels) {

			var uid = Parcels[zz].getUID();
			if(uid == null){
				logDebug("Warning: no XAPO Id found");
			}
			var ParcelValidatedNumber = uid.substr(uid.indexOf("$*$")+3);
			logDebug("XAPOID = " + ParcelValidatedNumber);
			var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
			if (gisObjResult.getSuccess())
				var fGisObj = gisObjResult.getOutput();
			else { logDebug("**WARNING: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()); return false }

			for (a1 in fGisObj) // for each GIS object on the Cap
			{
				var gisTypeScriptModel = fGisObj[a1];
				var gisObjArray = gisTypeScriptModel.getGISObjects()
				for (b1 in gisObjArray) {
					var gisObjScriptModel = gisObjArray[b1];
					var gisObjModel = gisObjScriptModel.getGisObjectModel();

					var retval = aa.gis.addCapGISObject(capId, gisObjModel.getServiceID(), gisObjModel.getLayerId(), gisObjModel.getGisId());

					if (retval.getSuccess()) { logDebug("Successfully added Cap GIS object: " + gisObjModel.getGisId()) }
					else { logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()); return false }
				}
			}
		}
	}
	else { logDebug("**ERROR: Getting Parcels from Cap.  Reason is: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()); return false }
}
