/*----------------------------------------------------------------------------------------------------------------------/
| Program:  BATCH_WATERSHED_SITES_TO_SET.js
| Trigger:  BATCH
| Client:   
| Version:  1.0
| Author:   Jake Cox
|
|---------------------------------------------------------------------------------------------------------------------*/

/*--------------------------------------------------------------------------------------------------------------------|
|
|	BATCH: SHOWDEBUG OPTION 
|	Set to "true" for outputing errors and debugging purposes. 
|
|---------------------------------------------------------------------------------------------------------------------*/
var emailText = "";
var errLog = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 7 * 60;
var br = "<br>";
var useAppSpecificGroupName = false;
var publicUser = false;

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

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

/*--------------------------------------------------------------------------------------------------------------------|
|	
|	BATCH: NON-CONFIGURABLE PARAMETERS
|	vSearchCapModel used by class : aa.cap.getCapListByCollection
|
|---------------------------------------------------------------------------------------------------------------------*/
var vSearchCapModel = aa.cap.capModel.getOutput();
var vSearchCapTypeModel = vSearchCapModel.capType;
/*
var paramsOK = true;		 Set to true to run batch job 
var timeExpired = false;	 Variable to identify if batch script has timed out. Defaulted to "false". 
var success = 0;			
var maxSeconds = 5 * 60;	 Max time allowed ~ 15 min run time 
var batchStartDate = new Date();				 System Date 
var batchStartTime = batchStartDate.getTime();	 Start timer 
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var systemUserObj = aa.person.getUser("ADMIN").getOutput();  Used for updating APP status 
var updateStatusResult;
var useAppSpecificGroupName = false;
*/
var useAppSpecificGroupName = false;
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
	
/*--------------------------------------------------------------------------------------------------------------------|
|	BATCH: USER CONFIGURABLE PARAMETERS
|	Assign Record Type to retrieve
|---------------------------------------------------------------------------------------------------------------------*/
//Record type: Enforcement/Solid Waste/Residential/Recycling 
	vSearchCapTypeModel.setServiceProviderCode(aa.serviceProviderCode);
	vSearchCapTypeModel.setGroup('EnvHealth');
	vSearchCapTypeModel.setType('WQ');
	vSearchCapTypeModel.setSubType('Watershed');
	vSearchCapTypeModel.setCategory('NA');

//Convert to days	
var daysBehind = -1;
var daysAhead = -1;
/* Convert to a date format */
var fromDate = new Date(new Date().getFullYear(), 0, 1);
var clFromDate = aa.date.parseDate(fromDate.getMonth() + 1 + '/' + fromDate.getDate() + '/1900');   
var today = new Date();                        
var clToDate = aa.date.parseDate(today.getMonth() + 1 + '/' + today.getDate() + '/' + today.getFullYear());


/* Set variables */
var setCode = 'WATERSHED_SITES'
var setType = 'Watershed Sites'
var setStatus = 'Processed'

/*--------------------------------------------------------------------------------------------------------------------|
|	Convert to a common format (MM/DD/YYYY) and add leading "0"s to all dates 
|---------------------------------------------------------------------------------------------------------------------*/
//Parse all fields/variables to have leading "0" in dates ... e.g. 6/8/2016 = 06/08/2016
//var JSfromDate = addZerosToDate(convertDate(clFromDate));  
//var	JStoDate = addZerosToDate(convertDate(clToDate));
	
/*--------------------------------------------------------------------------------------------------------------------|
|	EMAIL: PARAMETERS  
|---------------------------------------------------------------------------------------------------------------------*/
var senderEmailAddr = "accela@gmail.com";
var toEmailAddress = "acox@hhcorp.org";
var ccEmailAddress = "";
var emailBody = ""; // variable defined and used to store messages
	
/*------------------------------------------------------------------------------------------------------/
|
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/
//if (paramsOK){
logMessage("START","Start of Assign Watershed Site Set Script.");
//Get count of records updated
var updatedRecordsCount = ScheduleWatershedInspections();
//Message to Log output
logMessage("INFO","Total Records Updated: " + updatedRecordsCount + ".");
logMessage("INFO","End of set script");

//if (toEmailAddress.length){
//	aa.sendMail(senderEmailAddr, toEmailAddress, ccEmailAddress, emailSubject, emailBody);
//}

logMessage("INFO","Email Send: Total Batch Job");
//}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
|	FUNCTIONS:
|	<=========== Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function ScheduleWatershedInspections()
{
	var capCount = 0;
			//Retrieve records by date range
			var collectionList = aa.cap.getCapListByCollection(vSearchCapModel, null, null, clFromDate, clToDate , null, new Array());
		
	if (!collectionList.getSuccess()){
			logMessage("**ERROR","Retreiving records. Reason is: " + collectionList.getErrorType() + ":" + collectionList.getErrorMessage());
			return false;
		}

	var capCollection = collectionList.getOutput(); // Script Result object.
	return processRecords(capCollection);
	
	
}//End of function

/*---------------------------------------------------------------------------------------------------------------------
| Function: processRecords(capCollection)
| Arguments: capCollection
| 
---------------------------------------------------------------------------------------------------------------------*/ 

function processRecords(Collection)
{
	var capCount = 0;
	var asiFilter = 0;
	var workflowFilter = 0;
	thisCapCollection = Collection;
	
	aa.set.removeSetHeader(setCode);  //remove the existing set members if the set exists so you start with a fresh Set.
	aa.set.createSet(setCode,setCode,setType,"Populated 5:00 PM daily via batch script BATCH_WATERSHED_SITES_TO_SET");
	// update set type and status
	setScriptResult = aa.set.getSetByPK(setCode);
	//aa.print(setScriptResult);
	if (setScriptResult.getSuccess())
	{
		setScript = setScriptResult.getOutput();
		setScript.setRecordSetType(setType);
		setScript.setSetStatus(setStatus);
		aa.print("Set Status: " + setScript.getSetStatus());
		updSet = aa.set.updateSetHeader(setScript).getOutput();
	}
	
	for (i in thisCapCollection)
	{
		thisCollection = thisCapCollection[i];
		altID = thisCollection.getCapModel().getAltID(); // Get Record ID
		myCapID = aa.cap.getCapID(altID).getOutput();		// Get capID
		capId = myCapID;
		var asiValue = getAppSpecific('Route1', myCapID);
		aa.print("Adding to SET: " + altID);
		aa.set.addCapSetMember(setCode,myCapID);
		capCount++;
	}//End of Collection loop
	//Script test screen only...
	aa.print("..........................................");
	aa.print("Total CAPS retrieved by collection list:  " + thisCapCollection.length);
	aa.print("Total CAPS processed/updated:             " + capCount);
	aa.print("..........................................");
	
	return capCount; 
	
}
