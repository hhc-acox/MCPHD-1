//Adulticide Zone Number (6 zones) 
function getAdulticideZoneNum(capId){
	var aZone = "";
	
	try{
		z1 = getGISInfo("MCPHD","fogging1","foggingname");
		z2 = getGISInfo("MCPHD","fogging2","foggingname");
		z3 = getGISInfo("MCPHD","fogging3","foggingname");
		z4 = getGISInfo("MCPHD","fogging4","foggingname");
		z5 = getGISInfo("MCPHD","fogging5","foggingname");
		z6 = getGISInfo("MCPHD","fogging6","foggingname");
				if (z1 == 1){
					aZone = z1;	
		}
				if (z2 == 2){
					aZone = z2;
		}
				if (z3 == 3){
					aZone = z3;
		}
				if (z4 == 4){
					aZone = z4;
		}
				if (z5 == 5){
					aZone = z5;
		}
				if (z6 == 6){
					aZone = z6;
		}
			return aZone;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAdulticideZone:  " + err.message);
		logDebug(err.stack);
	}
}