//IRSA;ENVHEALTH!HHECMSC!LINV!~.js
if (isTaskActive('Inspection') && matches(inspResult,'Unjustified')) {
	branchTask('Inspection','Unjustified','Updated by Script');
	}

if (isTaskActive('Inspection') && matches(inspResult,'Duplicate')) {
	branchTask('Inspection','Duplicate INV - Case Finaled','Updated by Script');
	}

if (isTaskActive('Inspection') && matches(inspResult,'Pending Order')) {
	branchTask('Inspection','Pending Order - Case Finaled','Updated by Script');
	}

if ((inspType == 'Initial Lead Inspection') && matches(inspResult,'In Violation')) {
	closeTask('Inspection','In Violation','Updated by Script');
	editAppSpecific('Resulted in Violation','Yes');
	updateAppStatus("Pending Case Creation");
	}
try{
	if(inspType=="Reinspection"){
		copyLeadViolations(inspId);
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ISA:EnvHealth/HHECMSC/LINV/NA:  " + err.message);
	logDebug(err.stack)
}
