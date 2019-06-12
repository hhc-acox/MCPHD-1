// ASIUA;ENVHEALTH!~!~!~ 
//This code verifies that the Census Tract, Assigned To and Previous Assigned To are populated if blank for qualifying case types.
copyParcelGisObjects();
if (matches(appTypeArray[1],'EHSM','HHECMSC','Housing') && (!matches(appTypeArray[2],'CRT'))) {
	var areaInspector = '';

//Always set the Census Tract on the ASI General Screen
	var censusTract = '';
		censusTract = AInfo['ParcelAttribute.CensusTract'];
		editAppSpecific('Census Tract',censusTract);

//Housing EHS
			if (matches(appTypeArray[1],'Housing') && (matches(appTypeArray[2],'TRA','HSG','VEH','INV','SEC')) && AInfo['Assigned To'] == null) {
				areaInspector = lookup('Census - Housing EHS',censusTract);
					var aInsp = convertForAssignedTo(areaInspector);
				editAppSpecific('Assigned To',aInsp);
				editAppSpecific('Previous Assigned To',aInsp);
				logDebug('Inspector to Assign: '+aInsp);
					}

//Healthy Homes EHS
			if (matches(appTypeArray[2],'LHH') && AInfo['Assigned To'] == null) {
				areaInspector = lookup('Census - Lead EHS',censusTract);
				var aInsp = convertForAssignedTo(areaInspector);
				editAppSpecific('Assigned To',aInsp);
				editAppSpecific('Previous Assigned To',aInsp);
				comment('the LHH area: '+censusTract);	
				comment('the LHH area Inspector: '+aInsp);
					}

//BedBugs EHS
			if (matches(appTypeArray[2],'BBE') && AInfo['Assigned To'] == null) {
				areaInspector = 'LLOBDELL';
				editAppSpecific('Assigned To',areaInspector);
				editAppSpecific('Previous Assigned To',areaInspector);
					}
}

		