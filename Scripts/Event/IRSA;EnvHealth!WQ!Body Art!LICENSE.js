//IRSA;EnvHealth!WQ!Body Art!LICENSE.js
var assignedInspector = HHC_getCapAssignment();
var areaSupervisor = hhcgetUserByDiscipline('WQBodyArtSupv');
var RiskDays = HHC_getRiskDays();
if (matches(inspResult,'Completed')){
	comment('this is the number: '+RiskDays);
	scheduleInspectDate('Routine',nextWorkDay(dateAdd(null,RiskDays)),assignedInspector);
		
}