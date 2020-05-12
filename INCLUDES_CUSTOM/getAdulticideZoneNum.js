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
		z6 = getGISInfo("MCPHD","fogging6","foggingname");
		z7 = getGISInfo("MCPHD","fogging7","foggingname");
		z8 = getGISInfo("MCPHD","fogging8","foggingname");
		z9 = getGISInfo("MCPHD","fogging9","foggingname");
		z10 = getGISInfo("MCPHD","fogging10","foggingname");
		
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
		if (z7 == 7){
					aZone = z7;
		}
		if (z8 == 8){
					aZone = z8;
		}
		if (z9 == 9){
					aZone = z9;
		}
		if (z10 == 10){
					aZone = z10;
		}
			return aZone;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAdulticideZone:  " + err.message);
		logDebug(err.stack);
	}
}
