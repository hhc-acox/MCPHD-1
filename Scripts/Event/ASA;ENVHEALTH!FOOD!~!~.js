showDebug = true;
showMessage = true;
copyParcelGisObjects4XAPO();
var areaInspector = '';
var zone = getGISInfo("MCPHD", "FoodsDistrict", "district");
var zonestr = zone.toString();

//CPS EHS
if (matches(appTypeArray[3],'Application')) {
	areaInspector = hhcgetUserByDiscipline('FoodsApplications');
	assignTask('Application Intake',areaInspector);
	editAppSpecific('District',zonestr);
	}
