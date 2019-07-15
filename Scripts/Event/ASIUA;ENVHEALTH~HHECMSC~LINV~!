//ASIUA;ENVHEALTH~HHECMSC~LINV~!
if (AInfo['Assigned To'] != AInfo['Previous Assigned To']) 
	{
		HHC_ASSIGN_NEW_LEHS();
	}
//Create Asthma Case
if (capStatus == 'Pending Case Creation' && AInfo['Asthma'] == 'CHECKED') 
	{
areaInspector = hhcgetUserByDiscipline('HHCESMCAsthma');
editAppSpecific('Asthma Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','HHECMSC','ASP','NA','');
copyAppSpecific(newChildID);
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
newChildID = createChild('EnvHealth','HHECMSC','CPS','NA','');
copyAppSpecific(newChildID);
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
newChildID = createChild('EnvHealth','HHECMSC','LHH','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from LINV',newChildID);
assignCap(AInfo['Assigned To'],newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
HHC_GET_ADDRESS_FOR_CHILD();
}
//Create BBE Case
if (capStatus == 'Pending Case Creation' && AInfo['BBE'] == 'CHECKED') 
	{
areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
editAppSpecific('BBE Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','HHECMSC','BBE','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from LINV',newChildID);
assignCap(areaInspector,newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
HHC_GET_ADDRESS_FOR_CHILD();
	}
//Create Senior Care Case
if (capStatus == 'Pending Case Creation' && AInfo['Senior Care'] == 'CHECKED') 
	{
areaInspector = hhcgetUserByDiscipline('HHCESMCSeniorCare');
editAppSpecific('Asthma Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','HHECMSC','SCM','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('Open','Created from LINV',newChildID);
assignCap(areaInspector,newChildID);
HHC_GET_ADDRESS_FOR_CHILD();
	}
//Radon Case
if (capStatus == 'Pending Case Creation' && AInfo['Radon'] == 'CHECKED') 
	{
saveID = capId;
areaInspector = hhcgetUserByDiscipline('HHCESMCRadon');
editAppSpecific('Radon Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','Radon','ServiceRequest','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('Open','Created from LINV',newChildID);
assignCap(areaInspector,newChildID);
capId = newChildID;
updateTask('Radon Intake','Accepted','Updated by Script');
capId = saveID;
HHC_GET_ADDRESS_FOR_CHILD();
	}
