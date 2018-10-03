// IRSA;ENVHEALTH!~!~!~ 
try{
	var currDateFix;
	var inspDate;
	var one_day=1000*60*60*24;
	//lwacht: 021018: resolving issues impacting the scripting i'm doing
	//inspDate = inspObj.getInspectionDate().getMonth() + '/' + inspObj.getInspectionDate().getDayOfMonth() + '/' + inspObj.getInspectionDate().getYear();
	inspDate=inspResultDate;
	var currDate=new Date(dateAdd(null,0));
	var futureDate=new Date(dateAdd(null,365));
	currDateFix=Date.parse(currDate);
	var fixinspDate = Date.parse(inspDate);
	var fixfutureDate = Date.parse(futureDate);
	if (((currDateFix - fixinspDate) / one_day > 90)) {
		showMessage = true;
		message = 'The resulted inspection date cannot be more than 90 days in the past.';
		}

	if (fixfutureDate<fixinspDate) {
		showMessage = true;
		message = 'The resulted inspection date cannot be more than a year in the future.';
		}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/*/*/*: " + err.message);
	logDebug(err.stack)
}