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
    
if (inspType == 'Initial Lead Inspection' && inspResult == 'In Violation') {
    logDebug('Attempting to create children cases');
    // Create child cases per Dan Fries here
    var areaInspector = '';
    var censusTract = '';
    censusTract = getAppSpecific('ParcelAttribute.CensusTract');
    areaInspector = lookup('Census - Lead EHS', censusTract);
    //Create Asthma Case
    if (getAppSpecific('ASP') == 'CHECKED') {
        areaInspector = hhcgetUserByDiscipline('HHCESMCAsthma');
        editAppSpecific('ASP Created', dateAdd(null, 0));
        updateAppStatus('Finaled', 'Child Case Created');
        branchTask('Create Case', 'Case Created', 'Action by Script', '');
        newChildID = createChild('EnvHealth', 'HHECMSC', 'ASP', 'NA', '');
        //HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
        
        aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
        copyAppSpecific(newChildID);
        copyOwner(capId, newChildID);
        comment('New child app id = ' + newChildID);
        updateAppStatus('In Violation', 'Created from LINV', newChildID);
        assignCap(areaInspector, newChildID);
        HHC_GET_ADDRESS_FOR_CHILD();

        var tSaveId = capId;
        capId = newChildID;
        scheduleInspectDate('Initial Inspection', nextWorkDay(), areaInspector);
        capId = tSaveId;
    }
    //Create CPS Case
    if (getAppSpecific('CPT') == 'CHECKED') {
        areaInspector = hhcgetUserByDiscipline('HHCESMCConsumerProductSafety');
        editAppSpecific('CPS Created', dateAdd(null, 0));
        updateAppStatus('Finaled', 'Child Case Created');
        branchTask('Create Case', 'Case Created', 'Action by Script', '');
        newChildID = createChild('EnvHealth', 'HHECMSC', 'CPS', 'NA', '');
        //HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
        aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
        copyAppSpecific(newChildID);
        copyOwner(capId, newChildID);
        comment('New child app id = ' + newChildID);
        updateAppStatus('Open', 'Created from LINV', newChildID);
        assignCap(areaInspector, newChildID);
        HHC_GET_ADDRESS_FOR_CHILD();

        var tSaveId = capId;
        capId = newChildID;
        scheduleInspectDate('CP Routine Inspection', nextWorkDay(), areaInspector);
        capId = tSaveId;
    }
    //Create LHH Case
    if (getAppSpecific('LHH') == 'CHECKED') {
        editAppSpecific('LHH Created', dateAdd(null, 0));
        updateAppStatus('Finaled', 'Child Case Created');
        branchTask('Create Case', 'Case Created', 'Action by Script', '');
        newChildID = createChild('EnvHealth', 'HHECMSC', 'LHH', 'NA', '');
        comment('New child app id = ' + newChildID);
        HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
        aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
        copyAppSpecific(newChildID);
        updateAppStatus('In Violation', 'Created from LINV', newChildID);
        copyOwner(capId, newChildID);
        assignCap(areaInspector, newChildID);
        editAppSpecific('INV Case', capIDString, newChildID);
        HHC_GET_ADDRESS_FOR_CHILD();
    }
    //Create BBE Case
    if (getAppSpecific('BBE') == 'CHECKED') {
        areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
        editAppSpecific('BBE Created', dateAdd(null, 0));
        updateAppStatus('Finaled', 'Child Case Created');
        branchTask('Create Case', 'Case Created', 'Action by Script', '');
        newChildID = createChild('EnvHealth', 'HHECMSC', 'BBE', 'NA', '');
        HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
        aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
        copyAppSpecific(newChildID);
        comment('New child app id = ' + newChildID);
        updateAppStatus('In Violation', 'Created from LINV', newChildID);
        copyOwner(capId, newChildID);
        assignCap(areaInspector, newChildID);
        editAppSpecific('INV Case', capIDString, newChildID);
        HHC_GET_ADDRESS_FOR_CHILD();
    }
    //Create Senior Care Case
    if (getAppSpecific('SCM') == 'CHECKED') {
        areaInspector = hhcgetUserByDiscipline('HHCESMCSeniorCare');
        editAppSpecific('SCM Created', dateAdd(null, 0));
        updateAppStatus('Finaled', 'Child Case Created');
        branchTask('Create Case', 'Case Created', 'Action by Script', '');
        newChildID = createChild('EnvHealth', 'HHECMSC', 'SCM', 'NA', '');
        //HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
        
        aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
        copyAppSpecific(newChildID);
        copyOwner(capId, newChildID);
        comment('New child app id = ' + newChildID);
        updateAppStatus('Open', 'Created from LINV', newChildID);
        assignCap(areaInspector, newChildID);
        HHC_GET_ADDRESS_FOR_CHILD();

        var tSaveId = capId;
        capId = newChildID;
        scheduleInspectDate('Initial Inspection', nextWorkDay(), areaInspector);
        capId = tSaveId;
    }
    //Radon Case
    if (getAppSpecific('RAD') == 'CHECKED') {
        areaInspector = hhcgetUserByDiscipline('HHCESMCRadon');
        comment("The area Inspector for RAD is " + areaInspector);
        editAppSpecific('RAD Created', dateAdd(null, 0));
        updateAppStatus('Finaled', 'Child Case Created');
        branchTask('Create Case', 'Case Created', 'Action by Script', '');
        newChildID = createChild('EnvHealth', 'Radon', 'ServiceRequest', 'NA', '');
        //HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
        
        aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
        copyAppSpecific(newChildID);
        copyOwner(capId, newChildID);
        comment('New child app id = ' + newChildID);
        updateAppStatus('Open', 'Created from LINV', newChildID);
        assignCap(areaInspector, newChildID);
        var saveID = capId;
        capId = newChildID;
        updateTask('Radon Intake', 'Accepted', 'Updated by Script');
        capId = saveID;
        HHC_GET_ADDRESS_FOR_CHILD();

        var tSaveId = capId;
        capId = newChildID;
        scheduleInspectDate('Radon Placement - Initial', nextWorkDay(), areaInspector);
        capId = tSaveId;
    }
}

try{
	if(inspType=="Reinspection"){
		copyLeadViolations(inspId);
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/HHECMSC/LINV/NA:  " + err.message);
	logDebug(err.stack)
}
