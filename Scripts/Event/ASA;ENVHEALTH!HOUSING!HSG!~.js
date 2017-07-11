// ASA;ENVHEALTH!HOUSING!HSG!~ 
leadGrant = 'N';
// 7.5.17 chaas: Bravnish created the lookup tables below in MCPHD configuration
leadGrant = lookup('HHC - Lead Grant User',currentUserID);
comment('Lead Grant Flag = '+leadGrant);
// 7.5.17 chaas: Custom field H_HSG.GENERAL.Lead is missing in MCPHD configuration
if (AInfo['GENERAL.Lead'] == 'Yes' && leadGrant != 'Y') {
	scheduleInspectDate('Initial Lead Inspection',AInfo['GENERAL.Initial Inspection Date'],lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']));
	}

if (AInfo['GENERAL.Lead'] == 'Yes' && leadGrant == 'Y') {
	scheduleInspectDate('Initial Lead Inspection',AInfo['GENERAL.Initial Inspection Date'],currentUserID);
	}

if (AInfo['GENERAL.Lead'] == 'Yes') {
	theDate = AInfo['GENERAL.Initial Inspection Date'].substring(6,10) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(0,2) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}

if (AInfo['GENERAL.Lead'] == 'Yes') {
	resultInspection('Initial Lead Inspection','In Violation',theDate,'Resulted by Script');
	}

if (AInfo['GENERAL.Lead'] == 'Yes') {
	closeTask('Initial Processing','Suspect Lead','Updated by Script'); //verified task/status
	}

if (AInfo['GENERAL.Lead'] == 'Yes' && leadGrant != 'Y') {
	assignCap(lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']));
	editAppSpecific('GENERAL.Assigned To',(lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract'])));
	}

if (AInfo['GENERAL.Lead'] == 'Yes' && leadGrant == 'Y') {
	assignCap(currentUserID);
	editAppSpecific('GENERAL.Assigned To',currentUserID);
	}
// 7.5.17 chaas: Custom field H_HSG.GENERAL.Bed Bugs is missing in MCPHD configuration
if (AInfo['GENERAL.Bed Bugs'] == 'Yes' && AInfo['GENERAL.Bed Bugs Referred'] == null) {
	
//replaced branch(ES_BBE_CREATE_CHILD_CASE)
ES_BBE_CREATE_CHILD_CASE();
	}
