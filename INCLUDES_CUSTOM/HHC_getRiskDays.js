function HHC_getRiskDays() {
	try{
		var iRisk = AInfo['Risk'];
		var idays = 0;
			if (parseInt(iRisk) == 1) {
				idays = 364;
		}
			if (parseInt(iRisk) == 2) {
				idays = 179;
		}
			if (parseInt(iRisk) == 3) {
				idays = 89;
		}
		return idays;
	}
		catch(err)
	{
			logDebug("A JavaScript Error occurred: HHC_getRiskDays:  " + err.message);
			logDebug(err.stack);
	}
}
