showDebug = true;
showMessage = true;
copyParcelGisObjects4XAPO();
var areaInspector = '';
var zone = getGISInfo("MCPHD", "FoodsDistrict", "district");

//CPS EHS
if (matches(appTypeArray[3],'Application')) {
	areaInspector = hhcgetUserByDiscipline('FoodsApplications');
	assignTask('Application Intake',areaInspector);
	editAppSpecific('District',zone);
	}
