// ASA;ENVHEALTH!HHECMSC!BBE!~ 
// See ASA:ENVHEALTH/*/*/*
cContactAry = new Array();
masterArray = new Array();
elementArray = new Array();
areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
var complInitInsp = false;
var InspSwitch = false;
cContactResult = AInfo[''];
cContactsExist = false;
editAppSpecific('Assigned To',areaInspector);
assignCap(areaInspector);

if (!matches(AInfo['Initial Inspection Date'],null,'',' ')) {
	complInitInsp = true;
	}

if (complInitInsp) {
	scheduleInspectDate('Initial Inspection',AInfo['Initial Inspection Date'],areaInspector);
	}

if (complInitInsp) {
	theDate = AInfo['Initial Inspection Date'].substring(6,10) + '-' + AInfo['Initial Inspection Date'].substring(0,2) + '-' + AInfo['Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}

if (complInitInsp) {
	resultInspection('Initial Inspection','Completed',theDate,'Resulted by Script');
	deactivateTask('Initial Processing','Completed','Updated by Script'); 
	}

if (complInitInsp == false) {
	scheduleInspectDate('Initial Inspection',nextWorkDay(dateAdd(null,2)),areaInspector);
	editAppSpecific('Initial Inspection Date', nextWorkDay(dateAdd(null,2)));
	}

cContactResult = aa.people.getCapContactByCapID(capId);
if (cContactResult.getSuccess()) {
	cContactsExist = true;
	}

if (tableHasRows('TYPEOFCONTACT')) {
	var getMyContacts = false;
	} else {
	var getMyContacts = true;
	}

if (getMyContacts && cContactsExist) {
	cContactAry = cContactResult.getOutput();
	for(yy in cContactAry) 

HHC_SEND_BBE_EMAILS();
	}

if (cContactsExist) {
	addASITable('TYPE OF CONTACT',masterArray,capId);
	}
