/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_UPDATE_APPLIC_STATUS
| Client:  MCPHD
|
| Version 1.0 - Base Version. 
|
| Script to run nightly to update application status, workflow, and send a notice
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 7 * 60;
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/* test parameters 
//aa.env.setValue("lookAheadDays", "-5");
//aa.env.setValue("daySpan", "5");
aa.env.setValue("recordGroup", "EnvHealth");
aa.env.setValue("recordType", "WQ");
aa.env.setValue("recordSubType", "*");
aa.env.setValue("recordCategory", "*");
aa.env.setValue("InspectionToCheck", "Initial");
//aa.env.setValue("CheckListToCheck", "OUTSIDE LAB POOL SAMPLES");
//aa.env.setValue("StatusChecklist", "POOL STATUS");
//aa.env.setValue("InspectionToSchedule", "Routine Inspection");
aa.env.setValue("AppStatusArray", "Active,About to Expire,Closed");
aa.env.setValue("taskToCheck", "Issuance");
aa.env.setValue("sendEmailNotifications","Y");
aa.env.setValue("respectNotifyPrefs","Y");
aa.env.setValue("emailTemplate","FAILED_POOL_INSPECTION_SCHEDULED");
aa.env.setValue("sendEmailToContactTypes", "Responsible Party");
aa.env.setValue("sysFromEmail", "no_reply@accela.com");
aa.env.setValue("emailAddress", "lwacht@septechconsulting.com");
aa.env.setValue("reportName", "");
aa.env.setValue("setNonEmailPrefix", "");
aa.env.setValue("inspectorUserId", "LWACHT");
//aa.env.setValue("newAppStatus", "Closed - Failed Results");
 */
  
//var lookAheadDays = getParam("lookAheadDays");
//var daySpan = getParam("daySpan");
var appGroup = getParam("recordGroup");
var appTypeType = getParam("recordType");
var appSubtype = getParam("recordSubType");
var appCategory = getParam("recordCategory");
var inspToCheck = getParam("InspectionToCheck");
var inspSched = getParam("InspectionToSchedule");
var chklistPool = getParam("CheckListToCheck");
var statusChecklist = getParam("StatusChecklist");
var arrAppStatus = getParam("AppStatusArray").split(",");
var task = getParam("taskToCheck");
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");
var emailTemplate = getParam("emailTemplate");
var sendEmailNotifications = getParam("sendEmailNotifications");
var respectNotifyPrefs = getParam("respectNotifyPrefs");
var sysFromEmail = getParam("sysFromEmail");
var emailAddress = getParam("emailAddress");			// email to send report
var rptName = getParam("reportName");
var setNonEmailPrefix = getParam("setNonEmailPrefix");
var inspUserId = getParam("inspectorUserId");
//var newAppStatus = getParam("newAppStatus");

if(appTypeType=="*") appTypeType="";
if(appSubtype=="*")  appSubtype="";
if(appCategory=="*") appCategory="";

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0,0,0,0);
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
/*
var fromDate = dateAdd(null,parseInt(lookAheadDays));
var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan));
fromJSDate = new Date(fromDate);
toJSDate = new Date(toDate);
var dFromDate = aa.date.parseDate(fromDate);
var dToDate = aa.date.parseDate(toDate);
logDebug("fromDate: " + fromDate + "  toDate: " + toDate);
*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);

if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	var capCount = 0;
	setCreated = false
	var taskItemScriptModel = aa.workflow.getTaskItemScriptModel().getOutput();
	taskItemScriptModel.setActiveFlag("N");
	taskItemScriptModel.setCompleteFlag("N");
	taskItemScriptModel.setTaskDescription("Close");
	taskItemScriptModel.setDisposition("");
	//taskItemScriptModel.setDisposition("noStatus");
	//Setup the cap type criteria
	var capTypeScriptModel = aa.workflow.getCapTypeScriptModel().getOutput();
	capTypeScriptModel.setGroup(appGroup);
	capTypeScriptModel.setType(appTypeType);
	capTypeScriptModel.setSubType(appSubtype);
	capTypeScriptModel.setCategory(appCategory); 
	//Set the date range for the task due date criteria
	//var startDueDate = aa.date.parseDate(dateAdd(null,-2));
	//var endDueDate = aa.date.getCurrentDate();
	//for testing purposes only
	//var startDueDate = aa.date.parseDate(fromDate);
	//var endDueDate = aa.date.parseDate(toDate);
	var appStatusList = [];
	//appStatusList = arrAppStatus;
	//var capResult = aa.workflow.getCapIdsByCriteria(taskItemScriptModel, startDueDate, endDueDate, capTypeScriptModel, appStatusList);
	var capResult = aa.workflow.getCapIdsByCriteria(taskItemScriptModel, null, null, capTypeScriptModel, appStatusList);
	if (capResult.getSuccess()) {
		myCaps = capResult.getOutput();
	}else { 
		logDebug("Error: Getting records, reason is: " + capResult.getErrorMessage()) ;
		return false;
	}
	//need this for updating the app status
	var lastFriday = dateAdd(null,-8);
	lastFriday = new Date(lastFriday);
	for (var dt = 0; dt < 8; dt++) {
		if(lastFriday.getDay()!=5){
			dateAdd(lastFriday,1);
		}else{
			logDebug("lastFriday: " + lastFriday);
			dt=8;
		}
	}
	logDebug("Found " + myCaps.length + " records to process");
	for (myCapsXX in myCaps) {
		if (elapsed() > maxSeconds) { // only continue if time hasn't expired
			logDebug("WARNING: A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
			timeExpired = true ;
			break; 
		}
    	capId = myCaps[myCapsXX].getCapID();
   		//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		altId = capId.getCustomID();
		if (!capId) {
			logDebug("Could not get record capId: " + altId);
			continue;
		}
		logDebug("------------------------------------------------" );
		logDebug("-----Processing record " + altId);
		cap = aa.cap.getCap(capId).getOutput();
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		var addResult = aa.address.getAddressByCapId(capId);
		if (addResult.getSuccess()){
			var aoArray = addResult.getOutput();
		}else{ 
			logDebug("**ERROR: getting address by cap ID: " + addResult.getErrorMessage());
		}
		if (aoArray.length){ 
			var ao = aoArray[0]; 
		}else{
			logDebug("**WARNING: no address for comparison:");
		} 
		var fullAddress = [ao.getHouseNumberStart(),ao.getStreetDirection(),ao.getStreetName(),ao.getStreetSuffix(),,ao.getCity(),,ao.getState(),ao.getZip()].filter(Boolean).join(" ");
		//var inspId = getScheduledInspId("Initial");
		//var inspId = '24238412';
		//var inspId = '24547643';
		var itemCap = capId;
		var r = aa.inspection.getInspections(itemCap);
		if (r.getSuccess()) {
			var inspArray = r.getOutput();
			for (a in inspArray) {
				var inspFullString = ""+inspArray[a].getInspector();
				var firstPos = inspFullString.lastIndexOf("/")+1;
				var lastPos = inspFullString.length;
				var inspName = inspFullString.substr(firstPos,lastPos);
				if (inspArray[a].getInspectionType() == inspToCheck) {
					var inspId = inspArray[a].getIdNumber();
					var fndRes = false;
					var inspModel = inspArray[a].getInspection();
					var gs = inspModel.getGuideSheets();
					if (gs) {
						for(var i=0;i< gs.size();i++) {
							var guideSheetObj = gs.get(i);
							//logDebug("guideSheetObj.getGuideType(): " +guideSheetObj.getGuideType());
							//start copy to GSUA here
							if (guideSheetObj && "LAB SAMPLES" == guideSheetObj.getGuideType().toUpperCase()) {
								var dataJsonArray = [];
								var guidesheetItem = guideSheetObj.getItems();
								for(var j=0;j< guidesheetItem.size();j++) {
									var item = guidesheetItem.get(j);
									var chkStatus = ""+item.getGuideItemStatus();
									if(chkStatus=="Send to LIMS"){
									//if(item.getGuideItemStatus()==item.getGuideItemStatus()){
										var guideItemASITs = item.getItemASITableSubgroupList();
										if (guideItemASITs!=null){
											for(var l = 0; l < guideItemASITs.size(); l++){
												var guideItemASIT = guideItemASITs.get(l);
												//logDebug("guideItemASIT.getTableName(): " +guideItemASIT.getTableName());
												if(guideItemASIT && "SAMPLE SUMMARY" == guideItemASIT.getTableName().toUpperCase()){
													var tableArr = new Array();
													var columnList = guideItemASIT.getColumnList();
													for (var k = 0; k < columnList.size() ; k++ ){
														var column = columnList.get(k);
														var values = column.getValueMap().values();
														var iteValues = values.iterator();
														while(iteValues.hasNext())
														{
															var m = iteValues.next();
															var zeroBasedRowIndex = m.getRowIndex()-1;
															if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
															tableArr[zeroBasedRowIndex][column.getColumnName()] = m.getAttributeValue();
														}
													}
												}
											}
										}
										//return tableArr;
										for(row in tableArr){
											var thisRow = tableArr[row];
											var limsReason = lookup("Sample_Reasons",""+tableArr[row]["Reason"]);
											if(matches(limsReason,null,false,"undefined")){
												limsReason="TOT";
											}
											var jsonResult = {
												"SampleID": ""+tableArr[row]["Sample ID"],
												//"SampleID": "345987",
												"SampleAddress": fullAddress,
												"Reason": limsReason,
												"SampleLocation": [""+tableArr[row]["Sample Location"],tableArr[row]["Sample Other"]].filter(Boolean).join(": "),
												"FieldNotes": ""+tableArr[row]["Field Notes"],
												"InspectorName": inspName,
												"SampleType": ""+tableArr[row]["Sample Type"],
												"InspectionID": ""+inspId,
												"ChecklistID": ""+guideSheetObj.guidesheetSeqNbr,
												"ChecklistItemID": ""+item.guideItemSeqNbr,
												"RecordID": ""+altId
											};
											dataJsonArray.push(jsonResult);
										}
										var nData = {
											"Samples":  dataJsonArray
										};
										var nDataJson = JSON.stringify(nData);
										logDebug("myJSON: " + nDataJson)							
										var postResp = httpClientPut("https://208.88.104.180:95/api/LIMSUpdate/Update", nDataJson, 'application/json', 'utf-8');
										var theResp = postResp.getOutput();
										for(x in theResp){
											if(typeof(theResp[x])!="function"){
												logDebug(x+": "+theResp[x]);
											}
										}
										if(theResp["resultCode"]=="200"){
											item.setGuideItemStatus("In Lab");
											var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
											if (updateResult.getSuccess()) {
												logDebug("Successfully updated " + guideSheetObj.getGuideType() + ".");
											} else {
												logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
											}
										}
									}
								}
							}
						}
					} else {
						// if there are guidesheets
						logDebug("No guidesheets for this inspection");
					}
				}
			}
		}
	}
}catch (err){
	logDebug("ERROR: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}
	
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function getCapIdByIDs(s_id1, s_id2, s_id3)  {
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
    if(s_capResult.getSuccess())
		return s_capResult.getOutput();
    else
       return null;
}
function getInspIdsByStatus(insp2Check,inspStatus){
try{
	var retArray = [];
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess()){
		var inspList = inspResultObj.getOutput();
		for (xx in inspList){
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().toUpperCase().equals(inspStatus.toUpperCase())){
				//only return the last eight weeks because that's all we really care about and we don't want
				//this running for ever.
				var eightWeeksPast = dateAdd(null,-(7*8)-1);
				eightWeeksPast = new Date(eightWeeksPast);
				var inspResultDate = convertDate(inspList[xx].getScheduledDate());
				if(inspResultDate.getTime() > eightWeeksPast.getTime()){
					retArray.push(inspList[xx]);
				}
			}
		}
	}
	if(retArray.length>0){
		return retArray;
	}else{
		return false;
	}
}catch (err){
	logDebug("ERROR: " + err.message + " In getInspIdsByStatus.");
	logDebug("Stack: " + err.stack);
}}

function getGuidesheetASITable(inspId,gName,asitName) {
try{
	//updates the guidesheet ID to nGuideSheetID if not currently populated
	//optional capId
	var itemCap = capId;
	if (arguments > 6) itemCap = arguments[7];
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			if (inspArray[i].getIdNumber() == inspId) {
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					for(var i=0;i< gs.size();i++) {
						var guideSheetObj = gs.get(i);
						if (guideSheetObj && gName.toUpperCase() == guideSheetObj.getGuideType().toUpperCase()) {
							var guidesheetItem = guideSheetObj.getItems();
							for(var j=0;j< guidesheetItem.size();j++) {
								var item = guidesheetItem.get(j);
								var guideItemASITs = item.getItemASITableSubgroupList();
								if (guideItemASITs!=null){
									for(var j = 0; j < guideItemASITs.size(); j++){
										var guideItemASIT = guideItemASITs.get(j);
										if(guideItemASIT && asitName == guideItemASIT.getTableName()){
											var tableArr = new Array();
											var columnList = guideItemASIT.getColumnList();
											for (var k = 0; k < columnList.size() ; k++ ){
												var column = columnList.get(k);
												var values = column.getValueMap().values();
												var iteValues = values.iterator();
												while(iteValues.hasNext())
												{
													var i = iteValues.next();
													var zeroBasedRowIndex = i.getRowIndex()-1;
													if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
													tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue();
												}
											}
										}
									}
								}
								return tableArr;
							}							
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No checklist item found.");
	return false;
}catch(err){
	logDebug("A JavaScript Error occurred: getGuidesheetASIValue: " + err.message);
	logDebug(err.stack);
}}

function createExpirationSet( prefix ){
// Create Set
try{
	if (prefix != ""){
		var yy = startDate.getFullYear().toString().substr(2,2);
		var mm = (startDate.getMonth() +1 ).toString(); //getMonth() returns (0 - 11)
		if (mm.length<2)
			mm = "0"+mm;
		var dd = startDate.getDate().toString();
		if (dd.length<2)
			dd = "0"+dd;
		var hh = startDate.getHours().toString();
		if (hh.length<2)
			hh = "0"+hh;
		var mi = startDate.getMinutes().toString();
		if (mi.length<2)
			mi = "0"+mi;
		//var setName = prefix.substr(0,5) + yy + mm + dd;
		var setName = prefix + "_" + yy + mm + dd;
		setDescription = prefix + " : " + mm + dd + yy;
		setResult = aa.set.getSetByPK(setName);
		setExist = false;
		setExist = setResult.getSuccess();
		if (!setExist) {
			//var setCreateResult= aa.set.createSet(setName,setDescription);
			//var s = new capSet(setName,prefix,"License Notifications", "Notification records processed by Batch Job " + batchJobName + " Job ID " + batchJobID);
			var setCreateResult= aa.set.createSet(setName,prefix,"License Notifications","Created via batch script " + batchJobName);
			if( setCreateResult.getSuccess() ){
				logDebug("New Set ID "+setName+" created for CAPs processed by this batch job.<br>");
				return setName;
			}else{
				logDebug("ERROR: Unable to create new Set ID "+setName+" for CAPs processed by this batch job.");
				return false;
			}
		}else{
			logDebug("Set " + setName + " already exists and will be used for this batch run<br>");
			return setName;
		}
	}
}catch (err){
	logDebug("ERROR: createExpirationSet: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}



function getStatusByDate(dateToCheck) { 
try{
	statusResult = aa.cap.getStatusHistoryByCap(capId, "APPLICATION", null);
	if (statusResult.getSuccess()) {
		statusArr = statusResult.getOutput();
		if (statusArr && statusArr.length > 0) {
			statusArr.sort(compareStatusDate);
			var prevStatus = false;
			for (var xx=0; xx<statusArr.length; xx++) {
				var thisStatus = statusArr[xx];
				for(zz in thisStatus){
					if(typeof(thisStatus[zz])!="function"){
						//logDebug(zz + ": " + thisStatus[zz]);
					}
				}
				if(xx==0){
					if(thisStatus.getStatusDate().getEpochMilliseconds() < dateToCheck.getEpochMilliseconds() ){
						var thisStatusStatus = "" + thisStatus.status;
						return thisStatusStatus;
					}
				}else{
					if(thisStatus.getStatusDate().getEpochMilliseconds() < dateToCheck.getEpochMilliseconds() && dateToCheck.getEpochMilliseconds() > prevStatus.getStatusDate().getEpochMilliseconds()){
						var thisStatusStatus = "" + prevStatus.status;
						return thisStatusStatus;
					}
				}
				prevStatus = statusArr[xx==0?0:xx-1];
			}
		}
	}else {
		logDebug("Error getting application status history " + statusResult.getErrorMessage());
	}
}catch (err){
	logDebug("ERROR: getStatusByDate: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}

function compareStatusDate(a,b) {
try{
    return (a.getStatusDate().getEpochMilliseconds() > b.getStatusDate().getEpochMilliseconds()); 
}catch (err){
	logDebug("ERROR: getMostRecentAppStatus: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}

function getMostRecentAppStatus() { // optional statuses to exclude
try{
	var ignoreArray = new Array();
	if (arguments.length > 0) {
		for (var i=0; i<arguments.length;i++) 
			ignoreArray.push(arguments[i]);
	}
	statusResult = aa.cap.getStatusHistoryByCap(capId, "APPLICATION", null);
	if (statusResult.getSuccess()) {
		statusArr = statusResult.getOutput();
		if (statusArr && statusArr.length > 0) {
			statusArr.sort(compareStatusDate);
			for (xx in statusArr) {
				var thisStatus = statusArr[xx];
				var thisStatusStatus = "" + thisStatus.getStatus();
				if (!exists(thisStatusStatus, ignoreArray))
					return thisStatusStatus;
			}
		}
	}
	else {
		logDebug("Error getting application status history " + statusResult.getErrorMessage());
	}
}catch (err){
	logDebug("ERROR: getMostRecentAppStatus: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}