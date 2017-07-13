// ASIUA;ENVHEALTH!HOUSING!INV!~
if (capStatus == 'Pending Case Creation' && AInfo['REQUIRED CASES.VEH'] == 'CHECKED') {
	
//start replaced branch: ES_VEH_CREATE_CHILD_CASE
 {
editAppSpecific('REQUIRED CASES.VEH Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('HHC','VEH','NA','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(AInfo['GENERAL.Assigned To'],newChildID);
editAppSpecific('GENERAL.INV Case',capIDString,newChildID);
editAppName(capName,newChildID);

//replaced branch(ES_GET_ADDRESS_FOR_CHILD)
ES_GET_ADDRESS_FOR_CHILD();
validGIS = false;
overrideMessage = '';
copyParcelGisObjects();

if (AInfo['INVESTIGATION TYPE.Online Complaint'] == 'CHECKED') {
	editAppSpecific('GENERAL.Reason for Invest','Online Complaint',newChildID);
	}

}
//end replaced branch: ES_VEH_CREATE_CHILD_CASE;
	}

if (capStatus == 'Pending Case Creation' && AInfo['REQUIRED CASES.HSG'] == 'CHECKED') {
	
//start replaced branch: ES_HSG_CREATE_CHILD_CASE
 {
editAppSpecific('REQUIRED CASES.HSG Created',dateAdd(null,0),capId);
var RFI = AInfo['GENERAL.Reason for Invest'];
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('HHC','HSG','NA','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(AInfo['GENERAL.Assigned To'],newChildID);
editAppSpecific('GENERAL.INV Case',capIDString,newChildID);
editAppSpecific('GENERAL.Emergency','N',newChildID);
editAppSpecific('GENERAL.Ordinance Chapter','10',newChildID);
editAppSpecific('GENERAL.Owner Occupied','N',newChildID);
editAppSpecific('GENERAL.Interior Violations','N',newChildID);
editAppSpecific('GENERAL.Healthy Homes Assessment Completed','N',newChildID);
editAppSpecific('GENERAL.Lead','N',newChildID);
editAppSpecific('GENERAL.Reason for Invest',RFI,newChildID);

//replaced branch(ES_GET_ADDRESS_FOR_CHILD)
ES_GET_ADDRESS_FOR_CHILD();

//replaced branch(ES_HHC_CONTACTS_PROCESS)
ES_HHC_CONTACTS_PROCESS();
if (AInfo['INVESTIGATION TYPE.Online Complaint'] == 'CHECKED') {
	editAppSpecific('GENERAL.Reason for Invest','Online Complaint',newChildID);
	}

}
//end replaced branch: ES_HSG_CREATE_CHILD_CASE;
	}

if (capStatus == 'Pending Case Creation' && AInfo['REQUIRED CASES.TRA'] == 'CHECKED') {
	
//start replaced branch: ES_TRA_CREATE_CHILD_CASE
 {
editAppSpecific('REQUIRED CASES.TRA Created',dateAdd(null,0),capId);
var RFI = AInfo['GENERAL.Reason for Invest'];
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('HHC','TRA','NA','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(AInfo['GENERAL.Assigned To'],newChildID);
editAppSpecific('GENERAL.INV Case',capIDString,newChildID);
editAppSpecific('GENERAL.Emergency','N',newChildID);
editAppSpecific('GENERAL.Ordinance Chapter','10',newChildID);
editAppSpecific('GENERAL.Reason for Invest',RFI,newChildID);

//replaced branch(ES_GET_ADDRESS_FOR_CHILD)
ES_GET_ADDRESS_FOR_CHILD();

//replaced branch(ES_HHC_CONTACTS_PROCESS)
ES_HHC_CONTACTS_PROCESS();
if (AInfo['INVESTIGATION TYPE.Online Complaint'] == 'CHECKED') {
	editAppSpecific('GENERAL.Reason for Invest','Online Complaint',newChildID);
	}

}
//end replaced branch: ES_TRA_CREATE_CHILD_CASE;
	}
