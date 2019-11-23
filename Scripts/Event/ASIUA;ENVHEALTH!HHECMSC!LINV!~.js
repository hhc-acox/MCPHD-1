//ASIUA;ENVHEALTH!HHECMSC!LINV!~.js

var areaInspector = '';
var censusTract = '';
censusTract = AInfo['ParcelAttribute.CensusTract'];
areaInspector = lookup('Census - Lead EHS',censusTract);
//Create Asthma Case
if (capStatus == 'Pending Case Creation' && AInfo['ASP'] == 'CHECKED') 
	{
areaInspector = hhcgetUserByDiscipline('HHCESMCAsthma');
editAppSpecific('ASP Created',dateAdd(null,0));
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
	}
//Create CPS Case
if (capStatus == 'Pending Case Creation' && AInfo['CPS'] == 'CHECKED') 
	{
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
	}
//Create LHH Case
if (capStatus == 'Pending Case Creation' && AInfo['LHH'] == 'CHECKED') 
{
editAppSpecific('LHH Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
branchTask('Create Case','Case Created','Action by Script','');
newChildID = createChild('EnvHealth','HHECMSC','LHH','NA','');
comment('New child app id = '+ newChildID);
HHC_copyAllInspectionsAndGuidesheetsToChild(capId);
aa.cap.copyRenewCapDocument(capId, newChildID, "ADMIN");
copyAppSpecific(newChildID);
updateAppStatus('In Violation','Created from LINV',newChildID);
copyOwner(capId, newChildID);
assignCap(areaInspector,newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
HHC_GET_ADDRESS_FOR_CHILD();
}
//Create BBE Case
if (capStatus == 'Pending Case Creation' && AInfo['BBE'] == 'CHECKED') 
	{
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
	}
//Create Senior Care Case
if (capStatus == 'Pending Case Creation' && AInfo['SCM'] == 'CHECKED') 
	{
areaInspector = hhcgetUserByDiscipline('HHCESMCSeniorCare');
editAppSpecific('SCM Created',dateAdd(null,0));
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
	}
//Radon Case
if (capStatus == 'Pending Case Creation' && AInfo['RAD'] == 'CHECKED') 
	{
saveID = capId;
areaInspector = hhcgetUserByDiscipline('HHCESMCRadon');
editAppSpecific('RAD Created',dateAdd(null,0));
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
	}
