showDebug = true;
showMessage = true;
var areaInspector = '';

//CPS EHS
if (matches(appTypeArray[3],'Application')) {
	areaInspector = hhcgetUserByDiscipline('FoodsApplications');
	assignTask('Application Intake',areaInspector);
	}
