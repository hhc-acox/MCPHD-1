// ASA;EnvHealth!HHECMSC!BBE!~ 
// 7.5.17 chaas: the user LLOBDELL below is not yet setup in MCPHD configuration
areaInspector = 'LLOBDELL';
var complInitInsp = false;
var InspSwitch = false;
cContactResult = AInfo[''];
cContactsExist = false;
cContactAry = new Array();
masterArray = new Array();
elementArray = new Array();
editAppSpecific('GENERAL.Assigned To',areaInspector);
assignCap(areaInspector);

// 7.5.17 chaas: no custom fields in any of the GEENERAL custom field subgroups for Inspection Needed 
if (AInfo['GENERAL.Inspection Needed'] == 'Yes') {
	InspSwitch = true;
	}

if (!matches(AInfo['GENERAL.Initial Inspection Date'],null,'',' ')) {
	complInitInsp = true;
	}

if (InspSwitch && complInitInsp) {
	scheduleInspectDate('Initial Inspection',AInfo['GENERAL.Initial Inspection Date'],'LLOBDELL');
	}

if (InspSwitch && complInitInsp) {
	theDate = AInfo['GENERAL.Initial Inspection Date'].substring(6,10) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(0,2) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(3,5);
	comment('The new date is ' + theDate);
	}

if (InspSwitch && complInitInsp) {
	resultInspection('Initial Inspection','Completed',theDate,'Resulted by Script');
	deactivateTask('Initial Processing','Completed','Updated by Script'); //verified task/status
	}

if (InspSwitch && complInitInsp == false) {
	scheduleInspectDate('Initial Inspection',nextWorkDay(dateAdd(null,2)),'LLOBDELL');
	editAppSpecific('GENERAL.Initial Inspection Date', nextWorkDay(dateAdd(null,2)));
	}

if (AInfo['GENERAL.Inspection Needed'] == 'Yes') {
	editAppSpecific('GENERAL.Inspection Needed','No');
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
//replaced branch(ES_SEND_BBE_EMAILS)
ES_SEND_BBE_EMAILS();
	}

if (cContactsExist) {
	addASITable('TYPE OF CONTACT',masterArray,capId); //verified ASIT
	}
