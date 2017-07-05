// ASA;EnvHealth!HHECMSC!LINV!~
// 7.5.17 chaas: H_LINV.Open is missing from this app status configuration in MCPHD
// 7.5.17 chaas: NONE of the area Inspectors are setup as users in MCPHD configuration
// 7.5.17 chaas: H_LINV.[INVESTIGATION TYPE,GENERAL].custom fields all verifed :)
updateAppStatus('Open','Initial status');
editAppSpecific('GENERAL.Initial Inspection Date',nextWorkDay());
if (AInfo['GENERAL.Assigned To'] == null && AInfo['INVESTIGATION TYPE.Bed Bugs'] == 'CHECKED') {
	areaInspector = 'LLOBDELL';
	}

if (AInfo['GENERAL.Assigned To'] == null && AInfo['INVESTIGATION TYPE.Suspect Lead'] == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']);
	}

if (AInfo['GENERAL.Assigned To'] == null && AInfo['INVESTIGATION TYPE.Consumer Product Testing'] == 'CHECKED') {
	areaInspector = 'QWILSON';
	}

if (AInfo['GENERAL.Assigned To'] == null && AInfo['INVESTIGATION TYPE.Recall Compliance'] == 'CHECKED') {
	areaInspector = 'QWILSON';
	}

if (AInfo['GENERAL.Assigned To'] != null) {
	areaInspector = AInfo['GENERAL.Assigned To'];
	}

scheduleInspectDate('Initial Lead Inspection',nextWorkDay(),areaInspector);
if (areaInspector != null||areaInspector != 'undefined') {
	editAppSpecific('GENERAL.Assigned To',areaInspector);
	assignCap(areaInspector);
	editAppSpecific('GENERAL.Previous Assigned To',areaInspector);
	}
