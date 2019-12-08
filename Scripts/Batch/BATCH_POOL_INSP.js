/*----------------------------------------------------------------------------------------------------------------------/
| Program:  BATCH_POOL_INSP.js
| Trigger:  Batch
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
var showDebug = true;
//eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
//eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM"));

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
	vSearchCapTypeModel.setSubType('Pool');
	vSearchCapTypeModel.setCategory('License');

//Convert to days	
var daysBehind = -1;
var daysAhead = -1;
/* Convert to a date format */
var fromDate = new Date(new Date().getFullYear(), 0, 1);
var clFromDate = aa.date.parseDate(fromDate.getMonth() + 1 + '/' + fromDate.getDate() + '/' + fromDate.getFullYear());   
var today = new Date();                        
var clToDate = aa.date.parseDate(today.getMonth() + 1 + '/' + today.getDate() + '/' + today.getFullYear());

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
logMessage("START","Start of Pool Inspection Scheduling Batch Job.");
//Get count of records updated
var updatedRecordsCount = SchedulePoolInspections();
//Message to Log output
logMessage("INFO","Total Records Updated: " + updatedRecordsCount + ".");
logMessage("INFO","End of batch Job");

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
function SchedulePoolInspections()
{
	var capCount = 0;
			//Retrieve records by date range
			var collectionList = aa.cap.getCapListByCollection(vSearchCapModel, null, null, clFromDate, clToDate , null, new Array());
		
	if (!collectionList.getSuccess()){
			logMessage("**ERROR","Retreiving records by Renewal Licenses Expiration Date and Status. Reason is: " + collectionList.getErrorType() + ":" + collectionList.getErrorMessage());
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
	var today = new Date();
    var eom = new Date(today.getFullYear(), today.getMonth()+2, 0);
	var endOfNextMonth = eom.getMonth() + 1 + '/' + eom.getDate() + '/' + eom.getFullYear();
	thisCapCollection = Collection;
	
	for (i in thisCapCollection)
	{
		thisCollection = thisCapCollection[i];
		altID = thisCollection.getCapModel().getAltID(); // Get Record ID
		myCapID = aa.cap.getCapID(altID).getOutput();		// Get capID
		var wfTask = aa.workflow.getTask(myCapID, 'Issuance'); // Get wfTask
		
		if(wfTask.getSuccess()) {
			var wfOut = wfTask.getOutput();
			var assignedToRecord = getAssignedToStaff(myCapID);
			
			aa.print("Disposition: " + wfOut.disposition);
			
			if(wfOut.disposition == 'Active') {
				if(assignedToRecord != null) {
					scheduleInspectDate('Routine',endOfNextMonth,assignedToRecord);
					capCount++;
				} else {
					scheduleInspectDate('Routine',endOfNextMonth);
					capCount++;
				}
				
			}
		}
					
	}//End of Collection loop
	//Script test screen only...
	aa.print("..........................................");
	aa.print("Total CAPS retrieved by collection list:  " + thisCapCollection.length);
	aa.print("Total CAPS processed/updated:             " + capCount);
	aa.print("..........................................");
	
	return capCount; 
	
}

function getAssignedToStaff(capID) 
{
	var itemCap = capID

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ 	aa.print("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
			return false; }
	
	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ 	aa.print("**ERROR: No cap detail script object") ;
			return false; }
		
	cd = cdScriptObj.getCapDetailModel();
	
	//cd.setCompleteDept(iName.getDeptOfUser());
	var returnValue = cd.getAsgnStaff();
	//cdScriptObj.setCompleteDate(sysDate);
	
	aa.print("Returning Assigned To Staff value: " + returnValue);
	
	return returnValue;
}

function getScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	return emseScript.getScriptText() + "";
}

function logMessage(etype,edesc)
{
    aa.eventLog.createEventLog(etype, "Batch Process", 'Pool Inspection Batch Job', sysDate, sysDate,"", edesc,batchJobID);
    
	if (arguments.length == 2) 
		{
		aa.print(etype + " : " + edesc);
		emailBody+=etype + " : " + edesc + "<br />";
			
		}else{
			aa.print(etype + ".");
			emailBody+=etype + "." + "<br />";
		}
	
	
}

function scheduleInspectDate(iType,DateToSched) // optional inspector ID.
// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110)
// DQ - Added Optional 5th parameter inspComm
	{
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3)
		if (arguments[2] != null)
			{
			var inspRes = aa.person.getUser(arguments[2]);
			if (inspRes.getSuccess())
				inspectorObj = inspRes.getOutput();
			}

        if (arguments.length >= 4)
            if(arguments[3] != null)
		        inspTime = arguments[3];

		if (arguments.length >= 5)
		    if(arguments[4] != null)
		        inspComm = arguments[4];

	var schedRes = aa.inspection.scheduleInspection(myCapID, inspectorObj, aa.date.parseDate(DateToSched), inspTime, iType, inspComm)

	if (schedRes.getSuccess())
		aa.print("Successfully scheduled inspection : " + iType + " for " + DateToSched);
	else
		aa.print( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}
