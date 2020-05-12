//Adulticide Zone Translation (6 zones) 
function getAdulticideZone(capId){
	var aZone = "";
	
	try{
		z1 = getGISInfo("MCPHD","fogging1","foggingname");
		z2 = getGISInfo("MCPHD","fogging2","foggingname");
		z3 = getGISInfo("MCPHD","fogging3","foggingname");
		z4 = getGISInfo("MCPHD","fogging4","foggingname");
		z5 = getGISInfo("MCPHD","fogging5","foggingname");
		z6 = getGISInfo("MCPHD","fogging6","foggingname");
		z7 = getGISInfo("MCPHD","fogging7","foggingname");
		z8 = getGISInfo("MCPHD","fogging8","foggingname");
		z9 = getGISInfo("MCPHD","fogging9","foggingname");
		z10 = getGISInfo("MCPHD","fogging10","foggingname");
		
				if (z1 == 1){
		aZone = "Adulticide Zone 01";	
		}
				if (z2 == 2){
		aZone = "Adulticide Zone 02";	
		}
				if (z3 == 3){
		aZone = "Adulticide Zone 03";	
		}
				if (z4 == 4){
		aZone = "Adulticide Zone 04";	
		}
				if (z5 == 5){
		aZone = "Adulticide Zone 05";	
		}
				if (z6 == 6){
		aZone = "Adulticide Zone 06";	
		}
		if (z7 == 7){
			aZone = "Adulticide Zone 07";	
		}
		if (z8 == 8){
			aZone = "Adulticide Zone 08";	
		}
		if (z9 == 9){
			aZone = "Adulticide Zone 09";	
		}
		if (z10 == 10){
			aZone = "Adulticide Zone 10";	
		}
			return aZone;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAdulticideZone:  " + err.message);
		logDebug(err.stack);
	}
}
