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
/* test parameters  */
//aa.env.setValue("lookAheadDays", "-5");
//aa.env.setValue("daySpan", "5");
aa.env.setValue("recordGroup", "EnvHealth");
aa.env.setValue("recordType", "WQ");
aa.env.setValue("recordSubType", "Pool");
aa.env.setValue("recordCategory", "License");
aa.env.setValue("InspectionToCheck", "Pool Test Results");
aa.env.setValue("CheckListToCheck", "OUTSIDE LAB POOL SAMPLES");
aa.env.setValue("StatusChecklist", "POOL STATUS");
aa.env.setValue("InspectionToSchedule", "Routine Inspection");
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

  
//var lookAheadDays = getParam("lookAheadDays");
//var daySpan = getParam("daySpan");
var appGroup = getParam("recordGroup");
var appTypeType = getParam("recordType");
var appSubtype = getParam("recordSubType");
var appCategory = getParam("recordCategory");
var inspPool = getParam("InspectionToCheck");
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
	taskItemScriptModel.setActiveFlag("Y");
	taskItemScriptModel.setCompleteFlag("N");
	taskItemScriptModel.setTaskDescription(task);
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
	appStatusList = arrAppStatus;
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
		capStatus = cap.getCapStatus();
		//var inspId = getScheduledInspId(inspPool);
		//process any inspections with a scheduled status.  update the status as failed if the results are in the failing range
		var arrInspIds = getInspIdsByStatus(inspPool,"Scheduled");
		if(arrInspIds.length>0){
			for (ii in arrInspIds){
				var tblResults = [];
				var thisInspec = arrInspIds[ii];
				var inspId = thisInspec.getIdNumber();
				var inspResultDate = convertDate(thisInspec.getScheduledDate());
				tblResults = getGuidesheetASITable(inspId,inspPool,chklistPool);
				//don't pass or fail if there are no results
				var resFailed = "false";
				if(tblResults){
					if(tblResults.length<1){
						resFailed = "no action";
					}else{
						for(row in tblResults){
							var tNbr = row;
							var thisRow = tblResults[row];
							//check for failed results
							//logDebug("results: " + typeof(""+thisRow["Valid Results"]));
							//logDebug("results: " + thisRow["E. Coli Results"]);
							//logDebug("results: " + thisRow["Coliform Results"]);
							//logDebug("results: " + thisRow["HPC"]);
							if(""+thisRow["Valid Results"]=="No" || ""+thisRow["E. Coli Results"]=="Present" || ""+thisRow["Coliform Results"]=="Present" || ""+thisRow["HPC"]!="< 200"){
								 resFailed="true";
							}
						}
					}
				}
				//for some reason, when resFailed is set to false (not 'false'), resFailed=='no action' resolves to true, so doing this instead
				if(resFailed=="true"){
					resultInspection(inspPool, "Unsatisfactory", sysDate, "Updated by pool self-reporting interface");
				}else{				
					if(resFailed=="no action"){
						 logDebug("No lab results submitted--not updating inspection status");
					}else{
						resultInspection(inspPool, "Satisfactory", sysDate, "Updated by pool self-reporting interface");
					}
				}
				//if the field "Pool status" does not match the app status, then update it
				//only use first row for this and only the inspection for this week
				tblResults = getGuidesheetASITable(inspId,inspPool,statusChecklist);
				if(tblResults.length>0){
					if(inspResultDate>lastFriday.getTime()){
						var poolStatus = row[0]["Pool Status"];
						if(poolStatus=="Open" && capStatus=="Closed"){
							var lastStatus = getMostRecentAppStatus("Closed");
							updateAppStatus(lastStatus, "Updated via pool interface batch job.");
							capStatus = lastStatus;
						}else{
							if(poolStatus=="Closed" && capStatus!="Closed"){
								updateAppStatus("Closed", "Updated via pool interface batch job.");
								capStatus = "Closed";
							}
						}
					}
				}
			}
		}
		 //get all failed results for past two weeks and past six weeks
		var cntFailedTwoWeeks = 0;
		var cntFailedSixWeeks = 0;
		var processFailed = false;
		var arrInspIds = getInspIdsByStatus(inspPool,"Unsatisfactory");
		if(arrInspIds.length>0){
			processFailed= true;
			var sixWeeksPast = dateAdd(null,-(7*6)-1);
			sixWeeksPast = new Date(sixWeeksPast);
			sixWeeksPast = sixWeeksPast.getTime();
			var twoWeeksPast = dateAdd(null,-13);
			twoWeeksPast = new Date(twoWeeksPast);
			twoWeeksPast = twoWeeksPast.getTime();
			for (ins in arrInspIds){
				var thisInspec = arrInspIds[ins];
				var inspResultDate = convertDate(thisInspec.getScheduledDate());
				if(inspResultDate > twoWeeksPast){
					cntFailedTwoWeeks++;
					cntFailedSixWeeks++;
				}else{
					if(inspResultDate > sixWeeksPast){
						cntFailedSixWeeks++;
					}
				}
			}
		}
		//now check for scheduled inspections more than two weeks old, count as failed if the pool was 
		//not closed, since they have not been updated
		var arrInspIds = getInspIdsByStatus(inspPool,"Scheduled");
		if(arrInspIds.length>0){
			processFailed = true;
			var sixWeeksPast = dateAdd(null,-(7*6)-1);
			sixWeeksPast = new Date(sixWeeksPast);
			sixWeeksPast = sixWeeksPast.getTime();
			var twoWeeksPast = dateAdd(null,-13);
			twoWeeksPast = new Date(twoWeeksPast);
			twoWeeksPast = twoWeeksPast.getTime();
			for (ins in arrInspIds){
				var thisInspec = arrInspIds[ins];
				var recdStatus = getStatusByDate(thisInspec.getScheduledDate());
				var inspResultDate = convertDate(thisInspec.getScheduledDate());
				if(recdStatus!="Closed" && inspResultDate < twoWeeksPast && inspResultDate > sixWeeksPast){
					cntFailedSixWeeks++;
				}
			}
		}
		if(processFailed && capStatus!="Closed" ){
			//if pool fails, schedule inspection, notify contacts
			if(cntFailedTwoWeeks>1 || cntFailedSixWeeks>2){
				logDebug(altId + " has a failing grade and will be assigned an inspection.");
				var inspDate = dateAdd(null, 7);
				if(inspUserId){
					scheduleInspectDate(inspSched,inspDate,inspUserId);
				}else{
					scheduleInspectDate(inspSched,inspDate);
				}
				if (sendEmailNotifications == "Y" && sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
					var conTypeArray = sendEmailToContactTypes.split(",");
					var sendAllContacts = conTypeArray.indexOf("ALL") >= 0 || conTypeArray.indexOf("All") >= 0 || conTypeArray.indexOf("all") >= 0;
					var sendPrimaryContact = conTypeArray.indexOf("PRIMARY") >= 0 || conTypeArray.indexOf("Primary") >= 0 || conTypeArray.indexOf("primary") >= 0;
					// create an array of contactObjs
					var conArray = [];
					var capContactResult = aa.people.getCapContactByCapID(capId);
					if (capContactResult.getSuccess()) {
						var capContactArray = capContactResult.getOutput();
					}
					if (capContactArray) {
						for (var yy in capContactArray) {
							conArray.push(new contactObj(capContactArray[yy]));
						}
					}
					// filter based on business rules in params
					var sendArray = [];
					for (thisCon in conArray) {
						var c = conArray[thisCon];  
						//if ((c.primary && sendPrimaryContact) || sendAllContacts) {
						//logDebug("c.people.getFlag(): " + c.people.getFlag());
						if ((c.people.getFlag()=="Y" && sendPrimaryContact) || sendAllContacts) {
							sendArray.push(c); 
						}
						if (conTypeArray.length > 0) {
							for (thisType in conTypeArray) {
								if (c.type == conTypeArray[thisType]) {
									sendArray.push(c);							
								}
							}
						}
					}
					// process each qualified contact
					//logDebug("sendArray: " + sendArray.length);
					currentUserID = "ADMIN";
					//runReportAttach(capId,rptName, "altId", capId.getCustomID()); 
					var eParams = aa.util.newHashtable(); 
					//add email template notifications params here
					addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
					addParameter(eParams, "$$altID$$", capId.getCustomID());
					addParameter(eParams, "$$capID$$", capId.getCustomID());
					addParameter(eParams, "$$capType$$", appTypeString);
					addParameter(eParams, "$$inspectionType$$", inspSched);
					addParameter(eParams, "$$inspectionDate$$", inspDate);
					var rFiles = [];
					if(!matches(rptName, null, "", "undefined")){
						var rFile;
						var rptParams = aa.util.newHashMap();
						//add report params here
						rFile = generateReport(capId,rptName,"Licenses",rptParams);
						if (rFile) {
							rFiles.push(rFile);
						}
					}
					for (var i in sendArray) {
						//  create set  
						var channel = ("" + lookup("CONTACT_PREFERRED_CHANNEL","" + sendArray[i].capContact.getPreferredChannel())).toUpperCase();
						var email = sendArray[i].capContact.getEmail();
						var cFName = sendArray[i].capContact.firstName;
						var cLName = sendArray[i].capContact.lastName;
						addParameter(eParams, "$$contactFirstName$$", cFName);
						addParameter(eParams, "$$contactFirstName$$", cLName);
						//logDebug("Notification requested for " + sendArray[i] + " preferred channel: " + channel);
						if (!respectNotifyPrefs || sendArray[i].capContact.getPreferredChannel()==0 || (channel.indexOf("EMAIL") >= 0 || channel.indexOf("E-MAIL") >= 0 || channel.indexOf("Email") >= 0)) {
							if (!email) {
								logDebug("Email channel detected but contact has no email address--adding to notification set");
								continue;
							}else {
								sendNotification(sysFromEmail,email,"",emailTemplate,eParams, rFiles,capId);
								logDebug(altId + ": Sent Email template " + emailTemplate + " to " + conTypeArray[thisType] + " : " + email);
							}
						}else{
							logDebug("Preferred channel is ignored, adding to notification set.");
						}
					}
					var inspUser = aa.person.getUser(inspUserId); 
					if(inspUser.getSuccess()){
						var inspUserObj = inspUser.getOutput();
						var inspEmail = inspUserObj.getEmail();
						sendNotification(sysFromEmail,inspEmail,"",emailTemplate,eParams, rFiles,capId);
						logDebug(altId + ": Sent Email template " + emailTemplate + " to Inspector " + inspUserObj.getLastName() + " : " + inspEmail);
					}else{
						logDebug("Failed to get inspector email: " + inspUser.getErrorMessage());
					}
				}
			}else{
				logDebug(altId + " has a passing grade.");
			}
		}
		//schedule the inspection for recording the lab results on friday
		var toDay = new Date();
		if(toDay.getDay()!=6){
			var insFound=false;
			var arrInsps = getInspIdsByStatus(inspPool,"Scheduled");
			for(ii in arrInsps){
				var inspResultDate = convertDate(arrInsps[ii].getScheduledDate());
				if(inspResultDate.getTime() > toDay.getTime()){
					insFound =true;
				}
			}
			if(!insFound){
				var inspDate = dateAdd(null, 7);
				scheduleInspectDate(inspPool,inspDate);
				var arrInsps = getInspIdsByStatus(inspPool,"Scheduled");
				for(ii in arrInsps){
					var inspResultDate = convertDate(arrInsps[ii].getScheduledDate());
					if(inspResultDate.getTime() > toDay.getTime()){
						updatePoolStatus();
					}
				}
			}
		}
		capCount++;
	}
	logDebug("Total CAPS qualified : " + myCaps.length);
	logDebug("Total CAPS processed: " + capCount);
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
											if(uideItemASIT.getTableName()=statusChecklist){
												oldColumnList = guideItemASIT.getColumnList();
											}
											var tableArr = new Array();
											var columnList = guideItemASIT.getColumnList();
											for (var k = 0; k < columnList.size() ; k++ ){
												var column = columnList.get(k);
												var values = column.getValueMap().values();
												var iteValues = values.iterator();
												while(iteValues.hasNext()){
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

function updatePoolStatus(){
try{
	var r = aa.inspection.getInspections(capId);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			var inspModel = inspArray[i].getInspection();
			var gs = inspModel.getGuideSheets();
			if (gs) {
				for(var i=0;i< gs.size();i++) {
					var guideSheetObj = gs.get(i);
					if (guideSheetObj && "POOL TEST RESULTS"== guideSheetObj.getGuideType().toUpperCase()) {
						var guidesheetItem = guideSheetObj.getItems();
						for(var j=0;j< guidesheetItem.size();j++) {
							var item = guidesheetItem.get(j);
							var guideItemASITs = item.getItemASITableSubgroupList();
							if (guideItemASITs!=null){
								for(var k = 0; k < guideItemASITs.size(); k++){
									var guideItemASIT = guideItemASITs.get(k);
									for(xx in guideItemASITs){
										if(typeof(guideItemASITs[xx])=='function'){
											//logDebug(xx);
										}
									}
									if(guideItemASIT && statusChecklist == guideItemASIT.getTableName()){
										guideItemASIT.setColumnList(closedColumnList);
										var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
										if (updateResult.getSuccess()) {
											logDebug("Successfully updated " + guideSheetObj.getGuideType() + ".");
										} else {
											logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
										}
									}
									var tableArr = new Array();
									var columnList = guideItemASIT.getColumnList();
									for (var k = 0; k < columnList.size() ; k++ ){
										var column = columnList.get(k);
										var values = column.getValueMap().values();
										var iteValues = values.iterator();
										while(iteValues.hasNext()){
											var i = iteValues.next();
											var zeroBasedRowIndex = i.getRowIndex()-1;
											if(column.getColumnName() == "Pool Status"){
												if(capStatus=="Closed"){
													i.setAttributeValue("Closed");
												}else{
													i.setAttributeValue("Open");
												}
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
						}			
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: updatePoolStatus: " + err.message);
	logDebug(err.stack)
}}	