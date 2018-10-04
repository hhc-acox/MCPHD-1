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
aa.env.setValue("lookAheadDays", "-5");
aa.env.setValue("daySpan", "5");
aa.env.setValue("recordGroup", "EnvHealth");
aa.env.setValue("recordType", "Food");
aa.env.setValue("recordSubType", "*");
aa.env.setValue("recordCategory", "Application");
aa.env.setValue("AppStatusArray1", "Accepted,Additional Info Needed,In Review,Inspection Passed");
aa.env.setValue("AppStatusArray2", "No Plan Review Required,Pending,Plan Review Required,Plans Approved");
aa.env.setValue("AppStatusArray3", "Re Inspection Required,Received");
//aa.env.setValue("AppStatusArray1", "");
//aa.env.setValue("AppStatusArray2", "");
//aa.env.setValue("AppStatusArray3", "");
aa.env.setValue("task", "Issuance");
aa.env.setValue("sendEmailNotifications","N");
aa.env.setValue("emailTemplate","");
aa.env.setValue("sendEmailToContactTypes", "");
aa.env.setValue("sysFromEmail", "no_reply@accela.com");
aa.env.setValue("emailAddress", "lwacht@septechconsulting.com");
aa.env.setValue("reportName", "");
aa.env.setValue("setNonEmailPrefix", "");
aa.env.setValue("closeWorkflow", "Y");
aa.env.setValue("newTaskStatus", "Closed");
aa.env.setValue("newAppStatus", "Closed");
 */
 
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var appGroup = getParam("recordGroup");
var appTypeType = getParam("recordType");
var appSubtype = getParam("recordSubType");
var appCategory = getParam("recordCategory");
var chkStatArr = getParam("AppStatusArray1");
if(chkStatArr.length<1){
	var arrAppStatus = null;
}else{
	var arrAppStatusConcat = getParam("AppStatusArray1")+","+getParam("AppStatusArray2")+","+getParam("AppStatusArray3");
	var arrAppStatus = arrAppStatusConcat.split(",");
}
var task = getParam("task");
var sendEmailToContactTypes = getParam("sendEmailToContactTypes");
var emailTemplate = getParam("emailTemplate");
var sendEmailNotifications = getParam("sendEmailNotifications");
var sysFromEmail = getParam("sysFromEmail");
var emailAddress = getParam("emailAddress");			// email to send report
var rptName = getParam("reportName");
var setNonEmailPrefix = getParam("setNonEmailPrefix");
var closeWkFl = getParam("closeWorkflow").substring(0, 1).toUpperCase().equals("Y");
var newTaskStatus = getParam("newTaskStatus");
var newAppStatus = getParam("newAppStatus");

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
var fromDate = dateAdd(null,parseInt(lookAheadDays));
var toDate = dateAdd(null,parseInt(lookAheadDays)+parseInt(daySpan));
fromJSDate = new Date(fromDate);
toJSDate = new Date(toDate);
var dFromDate = aa.date.parseDate(fromDate);
var dToDate = aa.date.parseDate(toDate);
logDebug("fromDate: " + fromDate + "  toDate: " + toDate);

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
	var capFilterBalance = 0;
	var capFilterDateRange = 0;
	var capCount = 0;
	setCreated = false
	var taskItemScriptModel = aa.workflow.getTaskItemScriptModel().getOutput();
	 taskItemScriptModel.setActiveFlag("N");
	 taskItemScriptModel.setCompleteFlag("N");
	taskItemScriptModel.setTaskDescription(task);
	 taskItemScriptModel.setDisposition("noStatus");
	// taskItemScriptModel.setDisposition("noStatus");
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
	logDebug("Found " + myCaps.length + " records to process");
	for (myCapsXX in myCaps) {
    	capId = myCaps[myCapsXX].getCapID();
   		//capId = getCapIdByIDs(thisCapId.getID1(), thisCapId.getID2(), thisCapId.getID3()); 
		altId = capId.getCustomID();
		//logDebug("altId: " + altId);
	}
		
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
		cap = aa.cap.getCap(capId).getOutput();
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(),fileDateObj.getDayOfMonth(),fileDateObj.getYear(),"YYYY-MM-DD");
		appTypeResult = cap.getCapType();	
		appTypeString = appTypeResult.toString();	
		appTypeArray = appTypeString.split("/");
		var capStatus = cap.getCapStatus();
		var capDetailObjResult = aa.cap.getCapDetail(capId);		
		if (!capDetailObjResult.getSuccess()){
			logDebug("Could not get record balance: " + altId);
			continue;
		}else{
			capDetail = capDetailObjResult.getOutput();
			var houseCount = capDetail.getHouseCount();
			var feesInvoicedTotal = capDetail.getTotalFee();
			var balanceDue = capDetail.getBalance();
			//if(balanceDue<=0){
			//	logDebug("Skipping record " + altId + " due to balance due: " + balanceDue);
			//	capFilterBalance++;
			//	continue;
			//}
			//filter by status date
			/*
			statusResult = aa.cap.getStatusHistoryByCap(capId, "APPLICATION", null);
			if (statusResult.getSuccess()) {
				statusArr = statusResult.getOutput();
				if (statusArr && statusArr.length > 0) {
					statusArr.sort(compareStatusDate);
					var ignoreRecd = true;
					for (xx in statusArr) {
						if(ignoreRecd == true) {
							var thisStatus = statusArr[xx];
							//var thisStatusStatus = "" + thisStatus.getStatus();
							//logDebug("thisStatusStatus: " + thisStatusStatus);
							//if (thisStatusStatus == arrAppStatus){
								statusDate = thisStatus.getStatusDate();
								var cStatusDate = convertDate(statusDate);
								stime = cStatusDate.getTime();
								pFtime = fromJSDate.getTime();
								pTtime = toJSDate.getTime();
								if(cStatusDate.getTime()<fromJSDate.getTime() && cStatusDate.getTime()>toJSDate.getTime()){
								//if(stime==ptime) {
									ignoreRecd = false;
								}
							//}
						}
					}
					if(ignoreRecd){
						logDebug("Skipping record " + altId + " due to date range: " + dateAdd(cStatusDate,0));
						capFilterDateRange++;
						continue;
					}
				}
			}else {
				logDebug("Error getting application status history " + statusResult.getErrorMessage());
			}
			*/
			//filter by open date
			var ignoreRecd = true;
			relcap = aa.cap.getCap(capId).getOutput(); //returns CapScriptModel object
			fileDate = convertDate(relcap.getFileDate()); //returns javascript date
			var cFileDate = convertDate(fileDate);
			pFtime = fromJSDate.getTime();
			pTtime = toJSDate.getTime();
			if(cFileDate.getTime()>=fromJSDate.getTime() && cFileDate.getTime()<=toJSDate.getTime()){
				ignoreRecd = false;
			}
			if(ignoreRecd){
				logDebug("Skipping record " + altId + " due to open date: " + dateAdd(cFileDate,0));
				capFilterDateRange++;
				continue;
			}
			capCount++;
			logDebug("----Processing record " + altId + ": " + relcap.getSpecialText() +  br);
			if(closeWkFl){
				taskCloseAllActive(newTaskStatus,"Closed via script BATCH_UPDATE_APPLIC_STATUS");
			}
			if(newAppStatus.length>0){
				updateAppStatus(newAppStatus,"Updated via script BATCH_UPDATE_APPLIC_STATUS");
			}
			if (sendEmailNotifications == "Y" && sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
				var conTypeArray = sendEmailToContactTypes.split(",");
				var	conArray = getContactArray(capId);
				for (thisCon in conArray) {
					var conEmail = false;
					thisContact = conArray[thisCon];
					if (exists(thisContact["contactType"],conTypeArray)){
						pContact = getContactObj(capId,thisContact["contactType"]);
						var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ pContact.capContact.getPreferredChannel());
						if(!matches(priChannel,null,"",undefined) && priChannel.indexOf("Postal") >-1 && setNonEmailPrefix != ""){
							if(setCreated == false) {
							   //Create NonEmail Set
								var vNonEmailSet =  createExpirationSet(setNonEmailPrefix);
								var sNonEmailSet = vNonEmailSet.toUpperCase();
								var setHeaderSetType = aa.set.getSetByPK(sNonEmailSet).getOutput();
								setHeaderSetType.setRecordSetType("License Notifications");
								setHeaderSetType.setSetStatus("New");
								updResult = aa.set.updateSetHeader(setHeaderSetType);          
								setCreated = true;
							}
							setAddResult=aa.set.add(sNonEmailSet,capId);
						//lwacht: 171122: emailing all contacts, regardless of preferred channel
						}
						//}else{
						//lwacht: 171122: end
							conEmail = thisContact["email"];
							if (conEmail) {
								recordId = capId.getCustomID();
								runReportAttach(capId,rptName, "p1value", recordId); 
								emailRptContact("BATCH", emailTemplate, rptName, false, "Pending Payment", capId, thisContact["contactType"],"altId", recordId);
								logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact["contactType"] + " : " + conEmail);
							}
						//lwacht: 171122: emailing all contacts, regardless of preferred channel
						//}
						//lwacht: 171122: end
					}
				}
			}
		}
	}
	if(setCreated){
		aa.sendMail(sysFromEmail, emailAddress, "", sNonEmailSet + " Set Created ", "Records in this set will need to be sent the '" + rptName + "'.");
	}
 	logDebug("Total CAPS qualified : " + myCaps.length);
 	logDebug("Ignored due to balance due: " + capFilterBalance);
 	logDebug("Ignored due to date range: " + capFilterDateRange);
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

function compareStatusDate(a,b) {
	return (a.getStatusDate().getEpochMilliseconds() > b.getStatusDate().getEpochMilliseconds()); 
}
function createExpirationSet( prefix ){
// Create Set
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
		if (!setExist) 
		{
			//var setCreateResult= aa.set.createSet(setName,setDescription);
			//var s = new capSet(setName,prefix,"License Notifications", "Notification records processed by Batch Job " + batchJobName + " Job ID " + batchJobID);
			
			var setCreateResult= aa.set.createSet(setName,prefix,"License Notifications","Created via batch script " + batchJobName);
			if( setCreateResult.getSuccess() )
			{
				logDebug("New Set ID "+setName+" created for CAPs processed by this batch job.<br>");
				return setName;
			}
			else
				logDebug("ERROR: Unable to create new Set ID "+setName+" for CAPs processed by this batch job.");
			return false;
		}
		else
		{
			logDebug("Set " + setName + " already exists and will be used for this batch run<br>");
			return setName;
		}
	}
}

function taskCloseAllActive(pStatus,pComment) {
	// Closes all tasks in on the workflow that are Active
	// Optional task names to exclude
	
	var taskArray = new Array();
	var closeAll = false;
	if (arguments.length > 2) { //Check for task names to exclude
		for (var i=2; i<arguments.length; i++)
			taskArray.push(arguments[i]);
	}
	else
		closeAll = true;

	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
	else 	{ 
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
		return false; 
	}
	var fTask;
	var stepnumber;
	var processID;
	var dispositionDate = aa.date.getCurrentDate();
	var wfnote = " ";
	var wftask;
	for (i in wfObj) {
		fTask = wfObj[i];
		wftask = fTask.getTaskDescription();
		stepnumber = fTask.getStepNumber();
//		processID = fTask.getProcessID();
		if (closeAll) {
			if(fTask.getActiveFlag() == "Y") {
				updateTask(wftask,pStatus,pComment,"");
				deactivateTask(wftask)
				logMessage("Deactivating Workflow Task " + wftask + " with status " + pStatus);
				logDebug("Deactivating Workflow Task " + wftask + " with status " + pStatus);
			}
		}
		else {
			if (!exists(wftask,taskArray)) {
				if(fTask.getActiveFlag() == "Y") {
					updateTask(wftask,pStatus,pComment,"");
					deactivateTask(wftask)
					logMessage("Deactivating Workflow Task " + wftask + " with status " + pStatus);
					logDebug("Deactivating Workflow Task " + wftask + " with status " + pStatus);
				}
			}
		}
	}
}