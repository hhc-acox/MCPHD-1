// ASIUA;ENVHEALTH!HOUSING!INV!~
if (capStatus == 'Pending Case Creation' && AInfo['REQUIRED CASES.VEH'] == 'CHECKED') {
	
//start replaced branch: ES_VEH_CREATE_CHILD_CASE
 {
editAppSpecific('VEH Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('ENVHEALTH','Housing','VEH','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(AInfo['Assigned To'],newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppName(capName,newChildID);

//replaced branch(ES_GET_ADDRESS_FOR_CHILD)
ES_GET_ADDRESS_FOR_CHILD();
validGIS = false;
overrideMessage = '';
copyParcelGisObjects();

if (AInfo['Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Invest','Online Complaint',newChildID);
	}

}
//end replaced branch: ES_VEH_CREATE_CHILD_CASE;
	}

if (capStatus == 'Pending Case Creation' && AInfo['HSG'] == 'CHECKED') {
	
//start replaced branch: ES_HSG_CREATE_CHILD_CASE
 {
editAppSpecific('HSG Created',dateAdd(null,0),capId);
var RFI = AInfo['Reason for Invest'];
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('ENVHEALTH','Housing','HSG','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(AInfo['Assigned To'],newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppSpecific('Emergency','N',newChildID);
editAppSpecific('Ordinance Chapter','10',newChildID);
editAppSpecific('Owner Occupied','N',newChildID);
editAppSpecific('Interior Violations','N',newChildID);
editAppSpecific('Healthy Homes Assessment Completed','N',newChildID);
editAppSpecific('Lead','N',newChildID);
editAppSpecific('Reason for Invest',RFI,newChildID);

//replaced branch(ES_GET_ADDRESS_FOR_CHILD)
ES_GET_ADDRESS_FOR_CHILD();

//replaced branch(ES_HHC_CONTACTS_PROCESS)
ES_HHC_CONTACTS_PROCESS();
if (AInfo['Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Invest','Online Complaint',newChildID);
	}

}
//end replaced branch: ES_HSG_CREATE_CHILD_CASE;
	}

if (capStatus == 'Pending Case Creation' && AInfo['TRA'] == 'CHECKED') {
	
//start replaced branch: ES_TRA_CREATE_CHILD_CASE
 {
editAppSpecific('REQUIRED CASES.TRA Created',dateAdd(null,0),capId);
var RFI = AInfo['Reason for Invest'];
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('ENVHEALTH','Housing','TRA','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(AInfo['Assigned To'],newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppSpecific('Emergency','N',newChildID);
editAppSpecific('Ordinance Chapter','10',newChildID);
editAppSpecific('Reason for Invest',RFI,newChildID);

//replaced branch(ES_GET_ADDRESS_FOR_CHILD)
ES_GET_ADDRESS_FOR_CHILD();

//replaced branch(ES_HHC_CONTACTS_PROCESS)
ES_HHC_CONTACTS_PROCESS();
if (AInfo['INVESTIGATION TYPE.Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Invest','Online Complaint',newChildID);
	}

}
//end replaced branch: ES_TRA_CREATE_CHILD_CASE;
	}
