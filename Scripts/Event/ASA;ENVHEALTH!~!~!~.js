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
if (matches(appTypeArray[2],'HSG','TRA','VEH','INV'))	
	{
	areaInspector = lookup('Census - Housing EHS',censusTract); 
	logDebug('Census Tract Inspector: '+areaInspector);
	}
if (matches(appTypeArray[2],'HSG','TRA','VEH','INV') && AInfo['Reason for Invest'] == 'Needles') {
	 var areaTeamLeader = lookup('Census - Team Leader',censusTract);
	 var areaTeam = HHC_getTeamByTeamLeaderID(areaTeamLeader);
	 var thisDiscipline = "HS"+areaTeam+"NeedlesEHS";
	 areaInspector = hhcgetUserByDiscipline(thisDiscipline);	
	logDebug('Needles Inspector: '+areaInspector);	 
	}
if(matches(appTypeArray[2],'HSG','TRA','VEH','INV') && (matches, AInfo['Type of Unit'], 'Motel','Hotel')){
	areaInspector = hhcgetUserByDiscipline('HSHotelMotel');	
	logDebug('Motel Inspector: '+areaInspector);	
	}	
if (matches(appTypeArray[2],'HSG','TRA','VEH','INV'))	
	{
	editAppSpecific('Assigned To',areaInspector);
	assignCap(areaInspector);
	logDebug('Inspector to Assign: '+areaInspector);
	}
	
//SEC Assigment
if (matches(appTypeArray[3],'SEC')) {
	areaInspector = lookup('Census - Housing EHS',censusTract); 
	editAppSpecific('Assigned To',areaInspector);
	assignCap(areaInspector);
	logDebug('Inspector to Assign: '+areaInspector);
	}

//Lead EHS	
if (matches(appTypeArray[2],'LHH','LINV')) {
	areaInspector = lookup('Census - Lead EHS',censusTract);
	assignedAreaInspector = String(areaInspector.toUpperCase());
	areaInspector = assignedAreaInspector;
	editAppSpecific('Assigned To',areaInspector);
	editAppSpecific('Previous Assigned To',areaInspector);
	assignCap(areaInspector);
	comment('the Healthy Homes area Inspector: '+areaInspector);
	}

//Asthma EHS
if (matches(appTypeArray[2],'ASP')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCAsthma');
	assignedAreaInspector = String(areaInspector.toUpperCase());
	areaInspector = assignedAreaInspector;
	editAppSpecific('Assigned To',areaInspector);
	editAppSpecific('Previous Assigned To',areaInspector);
	assignCap(areaInspector);
	comment('the Asthma area Inspector is: '+areaInspector);
	}
//BedBugs EHS
if (matches(appTypeArray[2],'BBE')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
	assignedAreaInspector = String(areaInspector.toUpperCase());
	areaInspector = assignedAreaInspector;
	editAppSpecific('Assigned To',areaInspector);
	editAppSpecific('Previous Assigned To',areaInspector);
	assignCap(areaInspector);
	comment('the BedBugs area Inspector is: '+areaInspector);
	}	
//CPS EHS
if (matches(appTypeArray[2],'CPS')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCConsumerProductSafety');
	assignedAreaInspector = String(areaInspector.toUpperCase());
	areaInspector = assignedAreaInspector;
	editAppSpecific('Assigned To',areaInspector);
	editAppSpecific('Previous Assigned To',areaInspector);
	assignCap(areaInspector);
	comment('the CPS area Inspector is: '+areaInspector);
	}	
//Radon EHS
if (matches(appTypeArray[1],'Radon')) {
        var department = HHC_getMyDepartment(currentUserID);
        if (department.indexOf('HHECMSC') > -1) {
                areaInspector = hhcgetUserByDiscipline('HHCESMCRadon');
        } else {
                areaInspector = hhcgetUserByDiscipline('WQRadon');
        }
	updateTask('Radon Intake','Accepted','Updated by Script');
	assignedAreaInspector = String(areaInspector.toUpperCase());
	areaInspector = assignedAreaInspector;
	assignCap(areaInspector);
	comment('the Radon area Inspector is: '+areaInspector);
	}	
//Senior Care EHS
if (matches(appTypeArray[2],'SCM')) {
	areaInspector = hhcgetUserByDiscipline('HHCESMCSeniorCare');
	assignedAreaInspector = String(areaInspector.toUpperCase());
	areaInspector = assignedAreaInspector;
	editAppSpecific('Assigned To',areaInspector);
	editAppSpecific('Previous Assigned To',areaInspector);
	assignCap(areaInspector);
	comment('the Senior Care area Inspector is: '+areaInspector);
	}	

//Food Applications
if (appMatch('EnvHealth/Food/*/Application')) {
	var supportStaff = HHC_getMySupportStaffDepartment(currentUserID);
	updateTask('Application Intake','Application Received','Updated by Script');
	assignTask('Application Intake',supportStaff);
}

//CCC EHMS Supervisor Assignment
if (matches(appTypeArray[2],'CCC')) {
	areaInspector = hhcgetUserByDiscipline('EHSMSupervisor'); //Assigned discipline to Jason Hudson
	editAppSpecific('Assigned To',areaInspector);
	assignCap(areaInspector);
	comment('the CCC Supervisor is: '+areaInspector);
	}	

//TLP EHSM Assignment
if (matches(appTypeArray[2],'TLP')) {
	areaInspector = hhcgetUserByDiscipline('EHSMToolLoan');
	editAppSpecific('Assigned To',areaInspector);
	assignCap(areaInspector);
	comment('the TLP EHSMToolLoan is: '+areaInspector);
	assignCap(areaInspector);					  
	}	
//RCP EHSM Assignment
if (matches(appTypeArray[2],'RCP')) {
	areaInspector = hhcgetUserByDiscipline('EHSMSupervisor'); //Assigned discipline to Jason Hudson
	editAppSpecific('Assigned To',areaInspector);
	assignCap(areaInspector);
	comment('the RCP Person is: '+areaInspector);
	assignTask('Case Intake',areaInspector );
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
	
//Pool/Pump Application
if (matches(appTypeString, 'EnvHealth/WQ/Pump/Application','EnvHealth/WQ/Pool/Construction Permit')) {
var supportStaff = HHC_getMySupportStaffDepartment(currentUserID);
assignTask('Intake',supportStaff );
}

//LINV Initial Inspection Scheduling set for next business day and case assignments.  This logic moved to launch from "Case Intake" on the LINV Workflow 08/12/2019.
if (matches(appTypeArray[2],'LINV')) {
	updateAppStatus('Pending Case Creation','Initial status');
	editAppSpecific('Initial Inspection Date',nextWorkDay());
	scheduleInspectDate('Initial Lead Inspection',nextWorkDay(),areaInspector);
	}
	
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
//LHH Initial Inspection scheduling
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
if (appTypeString.indexOf('Food')<0 && appTypeString.indexOf('WQ')<0)
	{
	HHC_GET_ADDRESS();
	}

if (matches(appTypeArray[2],'VEH','HSG','TRA','LHH')) {
	updateAppStatus('In Violation','Initial Status');
	}
	
if (matches(appTypeArray[3],'SEC')) {
	updateAppStatus('In Violation','Initial Status');
	}

if (areaInspector == null || areaInspector == 'undefined') {
	overrideMessage = 'The EHS Inspector could not be determined. Speak to a System Administrator to resolve the problem.<BR><BR>';
	}

if (!publicUser && !appMatch("EnvHealth/CRT/*/*") && !appMatch("EnvHealth/Housing/*/*")) {
	copyOwnerToContact("Owner", "Responsible Party", capId);
}
