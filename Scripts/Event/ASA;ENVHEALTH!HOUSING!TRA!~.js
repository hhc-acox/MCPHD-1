// ASA;EnvHealth!Housing!TRA!~ 
// 7.5.17 chaas: H_TRA.GENERAL.Mosquito Control is missing from MCPHD configuration
if (AInfo['GENERAL.Mosquito Control'] == 'Yes') {
	scheduleInspectDate('Initial Inspection',AInfo['GENERAL.Initial Inspection Date'],'LLOBDELL');
	}

if (AInfo['GENERAL.Mosquito Control'] == 'Yes') {
	theDate = AInfo['GENERAL.Initial Inspection Date'].substring(6,10) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(0,2) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}

if (AInfo['GENERAL.Mosquito Control'] == 'Yes') {
	resultInspection('Initial Inspection','In Violation',theDate,'Resulted by Script');
	}

if (AInfo['GENERAL.Mosquito Control'] == 'Yes') {
	// area Inspector LLOBDELL is not setup in MCPHD configuration
	assignCap('LLOBDELL');
	}
