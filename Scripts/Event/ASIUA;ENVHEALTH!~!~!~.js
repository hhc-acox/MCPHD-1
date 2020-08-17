// ASIUA;ENVHEALTH!~!~!~ 
//This code verifies that the Census Tract, Assigned To and Previous Assigned To are populated if blank for qualifying case types.
copyParcelGisObjects4XAPO();
if (matches(appTypeArray[1],'EHSM','HHECMSC','Housing') && (!matches(appTypeArray[2],'CRT'))) {
	var areaInspector = '';

//Always set the Census Tract on the ASI General Screen
	var censusTract = '';
        censusTract = AInfo['ParcelAttribute.CensusTract'];
        
        if (censusTract && censusTract != '' && (AInfo['Census Tract'] == null || AInfo['Census Tract'] =='')) {
            editAppSpecific('Census Tract',censusTract);
        }

//Housing EHS
			if (matches(appTypeArray[1],'Housing') && (matches(appTypeArray[2],'TRA','HSG','VEH','INV','SEC')) && AInfo['Assigned To'] == null) {
				var aInsp = lookup('Census - Housing EHS',censusTract);
                editAppSpecific('Assigned To',aInsp);
                assignCap(aInsp);
				logDebug('Inspector to Assign: '+aInsp);
            }

            if (matches(appTypeArray[1],'Housing') && (matches(appTypeArray[2],'TRA','HSG','VEH','INV','SEC'))) {
				var aInsp = lookup('Census - Housing EHS',censusTract);

                var recordAssigned = getAssignedToRecord();

                if (!recordAssigned || recordAssigned == '') {
                    assignCap(aInsp);
                }
                
                var inspResultObj = aa.inspection.getInspections(capId);

                var inspectionExists = false;
    
                if (inspResultObj.getSuccess()) {
                    var inspList = inspResultObj.getOutput();
                    for (xx in inspList) {
                        if (inspList[xx].getInspectionType() == 'Initial Inspection') {
                            inspectionExists = true;
                            var inspAssigned = inspList[xx].getInspector();
    
                            if (!inspAssigned || inspAssigned == '') {
                                if (aInsp && aInsp != '')
                                var inspId = inspList[xx].getIdNumber();
                                if (inspId && inspId != '') {
                                    assignInspection(inspId, aInsp);
                                }
                            }
                        }
                    }
                }
    
                if (!inspectionExists) {
                    scheduleInspectDate("Initial Inspection", nextWorkDay(), aInsp);
                }

                renameFullAddress();
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
				areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
				editAppSpecific('Assigned To',areaInspector);
				editAppSpecific('Previous Assigned To',areaInspector);
            }
}
//comment('Vector Zone: ' + getVectorZone(capId));
