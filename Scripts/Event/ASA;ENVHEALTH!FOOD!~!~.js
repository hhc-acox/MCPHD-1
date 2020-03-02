showDebug = true;
showMessage = true;
var areaInspector = '';
var zone = getGISInfo("MCPHD", "FoodsDistrict", "district");

//CPS EHS
if (matches(appTypeArray[3],'Application')) {
	areaInspector = hhcgetUserByDiscipline('FoodsApplications');
	assignTask('Application Intake',areaInspector);
	editAppSpecific('District',zone);
	}
