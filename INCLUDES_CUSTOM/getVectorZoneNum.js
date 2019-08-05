//Vector Zone Number (15 zones)
function getVectorZoneNum(capId){
	var vZone = "";
	var zoneNum = "";
	try{
		x = getGISInfo("MCPHD","VectorZones","vectorzone");
			return x;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getVectorZone:  " + err.message);
		logDebug(err.stack);
	}
}