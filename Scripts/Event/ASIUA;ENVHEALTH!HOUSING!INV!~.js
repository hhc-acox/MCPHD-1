// ASIUA;ENVHEALTH!HOUSING!INV!~
var areaInspector = '';
var censusTract = '';
censusTract = AInfo['ParcelAttribute.CensusTract'];
areaInspector = lookup('Census - Housing EHS',censusTract); 
if (capStatus == 'Pending Case Creation' && AInfo['VEH'] == 'CHECKED') {
var saveID = capId;
editAppSpecific('VEH Created',dateAdd(null,0));
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','Housing','VEH','NA','');
copyAppSpecific(newChildID);
copyOwner(saveID, newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(areaInspector,newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppName(capName,newChildID);
HHC_GET_ADDRESS_FOR_CHILD();
HHC_CONTACTS_PROCESS();
validGIS = false;
overrideMessage = '';
copyParcelGisObjects4XAPO();

if (AInfo['Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Invest','Online Complaint',newChildID);
		}
	}

if (capStatus == 'Pending Case Creation' && AInfo['HSG'] == 'CHECKED') {
var saveID = capId;	
editAppSpecific('HSG Created',dateAdd(null,0),capId);
var RFI = AInfo['Reason for Investigation'];
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','Housing','HSG','NA','');
copyOwner(saveID, newChildID);
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(areaInspector,newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppSpecific('Emergency','N',newChildID);
editAppSpecific('Ordinance Chapter','10-Residential',newChildID);
editAppSpecific('Owner Occupied','N',newChildID);
editAppSpecific('Reason for Investigation',RFI,newChildID);
copyParcelGisObjects4XAPO();
HHC_GET_ADDRESS_FOR_CHILD();
HHC_CONTACTS_PROCESS();
if (AInfo['Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Invest','Online Complaint',newChildID);
		}
	}

if (capStatus == 'Pending Case Creation' && AInfo['TRA'] == 'CHECKED') {
var saveID = capId;	
editAppSpecific('TRA Created',dateAdd(null,0),capId);
var RFI = AInfo['Reason for Investigation'];
updateAppStatus('Finaled','Child Case Created');
newChildID = createChild('EnvHealth','Housing','TRA','NA','');
copyOwner(saveID, newChildID);
copyAppSpecific(newChildID);
comment('New child app id = '+ newChildID);
updateAppStatus('In Violation','Created from INV',newChildID);
assignCap(areaInspector,newChildID);
editAppSpecific('INV Case',capIDString,newChildID);
editAppSpecific('Emergency','N',newChildID);
editAppSpecific('Ordinance Chapter','10-Residential',newChildID);
editAppSpecific('Reason for Investigation',RFI,newChildID);
copyParcelGisObjects4XAPO();
HHC_GET_ADDRESS_FOR_CHILD();
HHC_CONTACTS_PROCESS();

if (AInfo['Online Complaint'] == 'CHECKED') {
	editAppSpecific('Reason for Investigation','Online Complaint',newChildID);
		}
	}
