//EHSM Quadrants
function getEHSMQuadrant(capId){
	var eQuadrant = "";
	var quadrantNum = "";
	try{
		x = getGISInfo("MCPHD","EHSMQuadrantDistrict","quadrant");
		quadrantNum = x.toString();
		if (x<10){
		eQuadrant = "EHSM Quadrant 0"+quadrantNum;
		}
		else
		{eQuadrant = "EHSM Quadrant "+quadrantNum;}
			return eQuadrant;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getEHSMQuadrant:  " + err.message);
		logDebug(err.stack);
	}
}
