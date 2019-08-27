//IRSA;EnvHealth!WQ!Body Art!LICENSE.js
var assignedInspector = HHC_getCapAssignment();
var areaSupervisor = hhcgetUserByDiscipline('WQBodyArtSupv');
var RiskDays = HHC_getRiskDays();
//get 12 months ago
var Past12Months = dateAdd(null,-364);
Past12Months = new Date(Past12Months);
Past12Months = Past12Months.getTime();
var InspFailedTimes = 0;
var arrInspIds = getInspIdsByStatus("Spore Test","Not Received");
	if(arrInspIds.length>0){
		for (ins in arrInspIds){
			var thisInspec = arrInspIds[ins];
			var inspResultDate = convertDate(thisInspec.getScheduledDate());	
			if(inspResultDate > Past12Months){
				InspFailedTimes++
			}
		}
	}
If (InspFailedTimes == 2){
	//Create Notice of Violation
	//Create citation
	scheduleInspectDate('Routine',nextWorkDay(dateAdd(null,0)),assignedInspector);
}
If (InspFailedTimes == 3){
	scheduleInspectDate('Routine',nextWorkDay(dateAdd(null,0)),assignedInspector);
}	
			
if (matches(inspResult,'Completed')){
	comment('this is the number: '+RiskDays);
	scheduleInspectDate('Routine',nextWorkDay(dateAdd(null,RiskDays)),assignedInspector);
}

if (matches(inspType,'Spore Test') && matches(inspResult,'Positive')) {
	scheduleInspectDate('Routine',nextWorkDay(dateAdd(null,0)),assignedInspector);
}
