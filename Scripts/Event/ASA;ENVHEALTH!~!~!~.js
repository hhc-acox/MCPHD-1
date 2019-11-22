//ASA;ENVHEALTH!~!~!~
//lwacht: 151016: updating so it doesn't throw an error
showDebug = true;
showMessage = true;
var areaInspector = '';
//lwacht: 151016: end
//Always set the Census Tract on the ASI General Screen
var censusTract = '';
censusTract = AInfo['ParcelAttribute.CensusTract'];
editAppSpecific('Census Tract',censusTract);
comment('the census tract is: '+censusTract);
//Getting and Setting assignments at the record level.  
//The rest of the departments will have to be added to this section in the future.

//Housing EHS (EnvHealth/Housing/XXX/NA)
if (matches(appTypeArray[2],'HSG','TRA','VEH','INV')) {
	areaInspector = lookup('Census - Housing EHS',censusTract); 
	logDebug('Inspector to Assign: '+areaInspector);
	}
	
//SEC Assigment
if (matches(appTypeArray[3],'SEC')) {
	areaInspector = lookup('Census - Housing EHS',censusTract); 
	logDebug('Inspector to Assign: '+areaInspector);
	}

//Healthy Homes EHS	
if (matches(appTypeArray[2],'LHH','LINV')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	assignedAreaInspector = String(areaInspector.toUpperCase());
	areaInspector = assignedAreaInspector;
	comment('the Healthy Homes area Inspector: '+areaInspector);
	}

//Asthma EHS
if (matches(appTypeArray[2],'ASP')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCAsthma');
	comment('the Asthma area Inspector is: '+areaInspector);
	}
	
//BedBugs EHS
if (matches(appTypeArray[2],'BBE')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
	comment('the BedBugs area Inspector is: '+areaInspector);
	}
	
//CPS EHS
if (matches(appTypeArray[2],'CPS')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCConsumerProductSafety');
	comment('the CPS area Inspector is: '+areaInspector);
	}
	
//Radon EHS
if (matches(appTypeArray[1],'Radon')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCRadon');
	updateTask('Radon Intake','Accepted','Updated by Script');
	comment('the Radon area Inspector is: '+areaInspector);
	}	

//Senior Care EHS
if (matches(appTypeArray[2],'SCM')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCSeniorCare');
	comment('the Senior Care area Inspector is: '+areaInspector);
	}	
//CCC EHMS Supervisor Assignment
if (matches(appTypeArray[2],'CCC')) {
	areaInspector = hhcgetUserByDiscipline('EHSMSupervisor'); //Assigned discipline to Jason Hudson
	comment('the CCC Supervisor is: '+areaInspector);
	}	

//TLP EHSM Assignment
if (matches(appTypeArray[2],'TLP')) {
	areaInspector = hhcgetUserByDiscipline('EHSMToolLoan');
	comment('the TLP EHSMToolLoan is: '+areaInspector);
	assignCap(areaInspector);					  
	}	
//RCP EHSM Assignment
if (matches(appTypeArray[2],'RCP')) {
	areaInspector = hhcgetUserByDiscipline('EHSMSupervisor'); //Assigned discipline to Jason Hudson
	comment('the RCP Person is: '+areaInspector);
	}	
	useAppSpecificGroupName == true
//LINV EHS
if (getAppSpecific('Required Cases.Asthma') == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCAsthma');
	editAppSpecific('Asthma Created',dateAdd(null,0));
	updateAppStatus('Finaled','Child Case Created');
	branchTask('Create Case','Case Created','Action by Script','');
	newChildID = createChild('EnvHealth','HHECMSC','ASP','NA','');
	HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
	aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
	copyAppSpecific(newChildID);
	copyOwner(capId, newChildID);
	comment('New child app id = '+ newChildID);
	updateAppStatus('In Violation','Created from LINV',newChildID);
	assignCap(areaInspector,newChildID);
	HHC_GET_ADDRESS_FOR_CHILD();
	comment('the LINV is for Asthma: '+areaInspector);
	}
	
if (getAppSpecific('Required Cases.BBE') == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
	editAppSpecific('BBE Created',dateAdd(null,0));
	updateAppStatus('Finaled','Child Case Created');
	branchTask('Create Case','Case Created','Action by Script','');
	newChildID = createChild('EnvHealth','HHECMSC','BBE','NA','');
	HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
	aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
	copyAppSpecific(newChildID);
	comment('New child app id = '+ newChildID);
	updateAppStatus('In Violation','Created from LINV',newChildID);
	copyOwner(capId, newChildID);
	assignCap(areaInspector,newChildID);
	editAppSpecific('INV Case',capIDString,newChildID);
	HHC_GET_ADDRESS_FOR_CHILD();
	//Create Bed Bug Case
	comment('the LINV is for BedBugs: '+areaInspector);
	}

if (getAppSpecific('Required Cases.LHH') == 'CHECKED') {
	areaInspector = lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']);
	assignedAreaInspector = String(areaInspector.toUpperCase());
	areaInspector = assignedAreaInspector;
	scheduleInspectDate('Initial Lead Inspection',nextWorkDay(dateAdd(null,0)),areaInspector);
	closeTask('Case Intake','Completed');
	comment('the LINV is for Lead: '+areaInspector);
	}

if (getAppSpecific('Required Cases.CPS') == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCConsumerProductSafety');
	editAppSpecific('CPS Created',dateAdd(null,0));
	updateAppStatus('Finaled','Child Case Created');
	branchTask('Create Case','Case Created','Action by Script','');
	newChildID = createChild('EnvHealth','HHECMSC','CPS','NA','');
	HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
	aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
	copyAppSpecific(newChildID);
	copyOwner(capId, newChildID);
	comment('New child app id = '+ newChildID);
	updateAppStatus('Open','Created from LINV',newChildID);
	assignCap(areaInspector,newChildID);
	HHC_GET_ADDRESS_FOR_CHILD();
	//create CPS case
	comment('the LINV is for Consumer Product Safety: '+areaInspector);
	}

if (getAppSpecific('Required Cases.Radon') == 'CHECKED') {
	saveID = capId;
	areaInspector = hhcgetUserByDiscipline('HHCESMCRadon');
	editAppSpecific('Radon Created',dateAdd(null,0));
	updateAppStatus('Finaled','Child Case Created');
	branchTask('Create Case','Case Created','Action by Script','');
	newChildID = createChild('EnvHealth','Radon','ServiceRequest','NA','');
	HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
	aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
	copyAppSpecific(newChildID);
	copyOwner(capId, newChildID);
	comment('New child app id = '+ newChildID);
	updateAppStatus('Open','Created from LINV',newChildID);
	assignCap(areaInspector,newChildID);
	capId = newChildID;
	updateTask('Radon Intake','Accepted','Updated by Script');
	capId = saveID;
	HHC_GET_ADDRESS_FOR_CHILD();
	//Create Radon case
	comment('the LINV is for Radon: '+areaInspector);
	}

	if (getAppSpecific('Required Cases.Senior Care') == 'CHECKED') {
	areaInspector = hhcgetUserByDiscipline('HHCESMCSeniorCare');
	editAppSpecific('Asthma Created',dateAdd(null,0));
	updateAppStatus('Finaled','Child Case Created');
	branchTask('Create Case','Case Created','Action by Script','');
	newChildID = createChild('EnvHealth','HHECMSC','SCM','NA','');
	HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
	aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
	copyAppSpecific(newChildID);
	copyOwner(capId, newChildID);
	comment('New child app id = '+ newChildID);
	updateAppStatus('Open','Created from LINV',newChildID);
	assignCap(areaInspector,newChildID);
	HHC_GET_ADDRESS_FOR_CHILD();
	//create senior care case
	comment('the LINV is for Senior Care: '+areaInspector);
	}
	useAppSpecificGroupName == false
//lwacht: 151016: updating so it doesn't throw an error
if(areaInspector) {
	var aInsp = convertForAssignedTo(areaInspector);
	editAppSpecific('Assigned To',aInsp);
	editAppSpecific('Previous Assigned To',aInsp);
	assignCap(areaInspector);
	}
//WQ Assignments
//Body Art Application Supervisor assignments
if (matches(appTypeArray[2],'Body Art') && matches(appTypeArray[3],'Application')) {
	areaInspector = hhcgetUserByDiscipline('WQBodyArtSupv');
	comment('the BAF Supervisor is: '+areaInspector);
	assignTask('Application Intake', areaInspector);
	assignCap(areaInspector);
	updateTask('Application Intake','Application Received');
	}

//lwacht: 151016: end
//LINV Initial Inspection Scheduling set for next business day and case assignments.  This logic moved to launch from "Case Intake" on the LINV Workflow 08/12/2019.
/*if (matches(appTypeArray[2],'LINV')) {
	updateAppStatus('Open','Initial status');
	editAppSpecific('Initial Inspection Date',nextWorkDay());
	scheduleInspectDate('Initial Lead Inspection',nextWorkDay(),areaInspector);
	}
	*/
//Get the Initial Inspection Date and reformat it for resulting the Initial Inspection
if (matches(appTypeArray[2],'VEH','HSG','SEC','TRA','LHH')) {
	theDate = AInfo['Initial Inspection Date'].substring(6,10) + '-' + AInfo['Initial Inspection Date'].substring(0,2) + '-' + AInfo['Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}
//Get the SEC Initial Inspection Date Information
if (matches(appTypeArray[3],'SEC')) {
	theDate = AInfo['Initial Inspection Date'].substring(6,10) + '-' + AInfo['Initial Inspection Date'].substring(0,2) + '-' + AInfo['Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}
//Housing Initial Inspection scheduling
//INV Initial Inspection scheduling
if (matches(appTypeArray[2],'INV') && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('Initial Inspection',AInfo['Initial Inspection Date'],areaInspector);
	}
if (matches(appTypeArray[2],'INV') && AInfo['Initial Inspection Date'] == null) {
	editAppSpecific('Initial Inspection Date',dateAdd(null,1,'Y'));
	scheduleInspectDate('Initial Inspection',dateAdd(null,1,'Y'),areaInspector);
	}
if (matches(appTypeArray[2],'VEH','HSG','TRA') && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('Initial Inspection',AInfo['Initial Inspection Date'],areaInspector);
	}
if (matches(appTypeArray[3],'SEC') && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('SEC Action',AInfo['Initial Inspection Date'],areaInspector);
	}
if (matches(appTypeArray[3],'DumpsterSurvey')) {
	scheduleInspectDate('Rodent Control Dumpster Survey',nextWorkDay(dateAdd(null,0)),null);
	}								
//Healthy Homes Initial Inspection scheduling
if (matches(appTypeArray[2],'LHH') && AInfo['Initial Inspection Date'] != null) {
	scheduleInspectDate('Initial Lead Inspection',AInfo['Initial Inspection Date'],areaInspector);
	}
//Inspection Resulting - Resulted with the assumption that violations exist for Housing case types.
//Housing - result the Initial Inspection
if (matches(appTypeArray[2],'VEH','HSG','TRA') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('Initial Inspection','In Violation',theDate,'Resulted by Script');
	}
if (matches(appTypeArray[3],'SEC') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('SEC Action','In Violation',theDate,'Resulted by Script');
	}
//Healthy Homes - result the Initial Inspection (LHH only)
if (matches(appTypeArray[2],'LHH') && AInfo['Initial Inspection Date'] != null) {
	resultInspection('Initial Lead Inspection','In Violation',theDate,'Resulted by Script');
	}
//Consumer Product Safety
if (matches(appTypeArray[2],'CPS') && AInfo['Recall']=='Yes') {
	scheduleInspectDate('CP Initial Recall Inspection',nextWorkDay(dateAdd(null,0)),areaInspector);
	}
if (matches(appTypeArray[2],'CPS') && AInfo['Recall']=='No') {
	scheduleInspectDate('CP Routine Inspection',nextWorkDay(dateAdd(null,0)),areaInspector);
	}
//Set the address to the Application Name field on the record
HHC_GET_ADDRESS();

if (matches(appTypeArray[2],'VEH','HSG','TRA','LHH')) {
	updateAppStatus('In Violation','Initial Status');
	}
	
if (matches(appTypeArray[3],'SEC')) {
	updateAppStatus('In Violation','Initial Status');
	}

if (areaInspector == null || areaInspector == 'undefined') {
	overrideMessage = 'The EHS Inspector could not be determined. Speak to a System Administrator to resolve the problem.<BR><BR>';
	}	
