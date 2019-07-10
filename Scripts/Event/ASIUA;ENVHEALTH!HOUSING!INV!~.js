// ASIUA;ENVHEALTH!HOUSING!INV!~
var areaInspector = '';
var censusTract = '';
censusTract = AInfo['ParcelAttribute.CensusTract'];
areaInspector = lookup('Census - Housing EHS',censusTract); 
if (capStatus == 'Pending Case Creation' && AInfo['VEH'] == 'CHECKED') {

 {
editAppSpecific('VEH Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','Housing','VEH','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(areaInspector,newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppName(capName,newChildID);
HHC_GET_ADDRESS_FOR_CHILD();
HHC_CONTACTS_PROCESS();
validGIS = false;
overrideMessage = '';
copyParcelGisObjects();

if (AInfo['Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Invest','Online Complaint',newChildID);
		}
	}
}

if (capStatus == 'Pending Case Creation' && AInfo['HSG'] == 'CHECKED') {
	
 {
editAppSpecific('HSG Created',dateAdd(null,0),capId);
var RFI = AInfo['Reason for Invest'];
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','Housing','HSG','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(areaInspector,newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppSpecific('Emergency','N',newChildID);
editAppSpecific('Ordinance Chapter','10-Residential',newChildID);
editAppSpecific('Owner Occupied','N',newChildID);
editAppSpecific('Reason for Invest',RFI,newChildID);
copyParcelGisObjects();
HHC_GET_ADDRESS_FOR_CHILD();
HHC_CONTACTS_PROCESS();
if (AInfo['Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Invest','Online Complaint',newChildID);
		}
	}
}

if (capStatus == 'Pending Case Creation' && AInfo['TRA'] == 'CHECKED') {
	
 {
editAppSpecific('REQUIRED CASES.TRA Created',dateAdd(null,0),capId);
var RFI = AInfo['Reason for Invest'];
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','Housing','TRA','NA','');
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(areaInspector,newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppSpecific('Emergency','N',newChildID);
editAppSpecific('Ordinance Chapter','10-Residential',newChildID);
editAppSpecific('Reason for Invest',RFI,newChildID);
copyParcelGisObjects();
HHC_GET_ADDRESS_FOR_CHILD();
HHC_CONTACTS_PROCESS();

if (AInfo['Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Invest','Online Complaint',newChildID);
		}
	}
}
