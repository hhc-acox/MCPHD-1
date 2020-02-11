//IRSA;ENVHEALTH!HHECMSC!LINV!~.js
if (matches(inspType, 'Initial Lead Inspection','Reinspection') && matches(inspResult,'Unjustified')) {
	closeTask('Closed','Complete','Unjustified - Updated by Script');
	updateAppStatus('Finaled');
	}

if (matches(inspType, 'Initial Lead Inspection','Reinspection') && matches(inspResult,'In Violation')) {
	closeTask('Closed','Complete','In Violation - Updated by Script');
	editAppSpecific('Resulted in Violation','Yes');
	updateAppStatus('Pending Case Creation');
	}
try{
	if(inspType=="Reinspection"){
		copyLeadViolations(inspId);
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ISA:EnvHealth/HHECMSC/LINV/NA:  " + err.message);
	logDebug(err.stack)
}
