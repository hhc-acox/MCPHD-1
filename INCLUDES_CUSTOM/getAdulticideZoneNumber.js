function getAdulticideZoneNumber(maxZones) {
	try {
		for (i = 1; i <= maxZones; i++) {
			if (getGISInfo("MCPHD", "fogging" + i, "foggingname")) {
				return i;
			}
		}
	} catch (err) {
		logDebug("A JavaScript Error occurred: getAdulticideZone:  " + err.message);
		logDebug(err.stack);
	}
}
