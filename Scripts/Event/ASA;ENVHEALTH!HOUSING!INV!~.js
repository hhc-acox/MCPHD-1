// ASA;EnvHealth!Housing!INV!~
// 7.5.17 chaas: NONE of the area Inspectors are setup as users in MCPHD configuration
updateAppStatus('Open','Initial status'); // verified app status
editAppSpecific('GENERAL.Initial Inspection Date',dateAdd(null,1,'Y'));
// 7.5.17 chaas: Custom field H_INV.GENERAL.Mosquito Control is missing in MCPHD configuration
if (AInfo['GENERAL.Mosquito Control'] == 'Yes') {
	areaInspector = 'LLOBDELL';
	}
// 7.5.17 chaas: Custom field H_INV.GENERAL.Tire Program is missing in MCPHD configuration
if (AInfo['GENERAL.Tire Program'] == 'Yes') {
	areaInspector = 'BMESSICK';
	}
// 7.5.17 chaas: Custom field H_INV.GENERAL.Consumer Product is missing in MCPHD configuration
if (AInfo['GENERAL.Consumer Product'] == 'Yes') {
	areaInspector = 'QWILSON';
	}
// 7.5.17 chaas: Custom field H_INV.GENERAL.Hotel/Motel is missing in MCPHD configuration
if (AInfo['GENERAL.Hotel/Motel'] == 'Yes') {
	areaInspector = 'TSITLER';
	}

scheduleInspectDate('Initial Inspection',dateAdd(null,1,'Y'),areaInspector);
if (areaInspector != null || areaInspector != 'undefined') {
	editAppSpecific('GENERAL.Assigned To',areaInspector);
	assignCap(areaInspector);
	}
