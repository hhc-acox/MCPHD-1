//ASIUA;ENVHEALTH!HHECMSC!BBE!~.js
//Not sending emails - need to setup Workflow for printing NOV and Reinspection Letters.
var complInitInsp = false;
var InspSwitch = false;
cContactResult = AInfo[''];
cContactsExist = false;
cContactAry = new Array();
masterArray = new Array();
elementArray = new Array();
areaInspector = hhcgetUserByDiscipline('HHCESMCBedBugs');
var schedInitial = true;
var schedRein = true;
if (AInfo['Inspection Needed'] == 'Yes') {
	InspSwitch = true;
	}

if (!matches(AInfo['Initial Inspection Date'],null,'',' ')) {
	complInitInsp = true;
	}

if (isScheduled('Initial Inspection')) {
	schedInitial = false;
	}

if (checkInspectionResult('Reinspection','Scheduled')) {
	schedRein = false;
	}

if (InspSwitch && complInitInsp && schedInitial) {
	scheduleInspectDate('Initial Inspection',AInfo['Initial Inspection Date'],areaInspector);
	}

if (InspSwitch && complInitInsp == false && schedInitial) {
	scheduleInspectDate('Initial Inspection',nextWorkDay(dateAdd(null,2)),areaInspector);
	editAppSpecific('Initial Inspection Date', nextWorkDay(dateAdd(null,2)));
	}

if (InspSwitch && schedInitial == false && schedRein) {
	scheduleInspectDate('Reinspection',nextWorkDay(dateAdd(null,2)),areaInspector);
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

//if (getMyContacts && cContactsExist) {
//	cContactAry = cContactResult.getOutput();
//	for(yy in cContactAry) 
//HHC_SEND_BBE_EMAILS();
//Not sending emails - need to setup Workflow for printing NOV and Reinspection Letters.
//	}

if (cContactsExist) {
	addASITable('TYPE OF CONTACT',masterArray,capId);
	}

if (AInfo['Inspection Needed'] == 'Yes') {
	editAppSpecific('Inspection Needed','No');
	}

if (matches(AInfo['Assigned To'], null, '')) {
	editAppSpecific('Assigned To', areaInspector);
	assignCap('LLOBDELL');
	}

if (matches(AInfo['Census Tract'], null, '')) {
	editAppSpecific('Census Tract', AInfo['ParcelAttribute.CensusTract']);
HHC_GET_ADDRESS();
	}

