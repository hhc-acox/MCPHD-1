function getAdulticideZone(capId) {
	
    var aZone = "";
    var maxZones = 10;

    var zoneNum = getAdulticideZoneNumber(maxZones);
    aZone = buildAdulticideString(zoneNum);

    return aZone;
}
