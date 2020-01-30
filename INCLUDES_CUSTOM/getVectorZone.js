//Vector Zone Translation (15 zones)
function getVectorZone(capId){
	var vZone = "";
	var zoneNum = "";
	try{
		x = getGISInfo("MCPHD","VectorZone","vectorzone");
		zoneNum = x.toString();
		if (x<10){
		vZone = "Vector Zone 0"+zoneNum;
		}
		else
		{vZone = "Vector Zone "+zoneNum;}
			return vZone;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getVectorZone:  " + err.message);
		logDebug(err.stack);
	}
}
