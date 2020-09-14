/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_REDISTRICT_FOODS.js  Trigger: BATCH
| Description: This script is designed to be run in Accela - Batch Engine to redistrict foods records and assign the new inspector by GIS
|
| Version 1.0 - Initial - Jake Cox
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
debug = "";
message = "";
br = "<br>";
capId = null;
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0;
var useCustomScriptFile = true; // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM

//add include files
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));
eval(getScriptText("INCLUDES_BATCH", null, false));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode) servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;
var useAppSpecificGroupName = false;
if (String(aa.env.getValue("showDebug")).length > 0) {
	showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
}

showDebug = true;
showMessage = true;

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) {
	batchJobID = batchJobResult.getOutput();
	//logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
} else {
	//logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//var fromDate = getParam("fromDate"); // Hardcoded dates.   Use for testing only
//var toDate = getParam("toDate"); // ""
//var dFromDate = aa.date.parseDate(fromDate); //
//var dToDate = aa.date.parseDate(toDate); //
//var pFrequency = getParam("Frequency");
var lookAheadDays = aa.env.getValue("lookAheadDays"); // Number of days from today
var daySpan = aa.env.getValue("daySpan"); // Days to search (6 if run weekly, 0 if daily, etc.)
var emailTemplate = aa.env.getValue("emailTemplate");
var testEmail = aa.env.getValue("testEmail");
var emailFrom = aa.env.getValue("emailFrom");

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();

var startTime = startDate.getTime(); // Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput(); // run as admin

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

//logDebug("Start of Job");

try {
	mainProcess();
} catch (err) {
	logDebug("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
aa.print(debug);
//if (emailAddress.length)
//	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
	var numToProcess = 150000;
	var countTotal = 0;
	var countProcessed = 0;
	var differentEHS = 0;
    var wfReassigned = 0;
    var numTotal = 0;
	// get all capids
	var conn = new db();
	var sql = "select b.B1_PER_ID1, b.B1_PER_ID2, b.B1_PER_ID3 from dbo.b1permit b where b.serv_prov_code = 'MCPHD' and b.b1_per_type = 'WQ' and b.b1_per_sub_type != 'Pool'";
	var ds = conn.dbDataSet(sql, numToProcess);
    // foreach cap in capid list
    numTotal = ds.length;
	for (var r in ds) {
		//while(recordsProcessed < numToProcess) {
		//var r = recordsProcessed;
        var s_capResult = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"]));
        
        //var s_capResult = aa.cap.getCapID('17HIS','00000','042CO');

		if (s_capResult.getSuccess()) {
			var tCapId = s_capResult.getOutput();
			capId = tCapId;
			cap = aa.cap.getCap(capId).getOutput();
			//exploreObject(tCapId);

			if (cap && capId) {
                var docListResult = aa.document.getCapDocumentList(capId,'ADMIN');

                if (docListResult.getSuccess()) {		
                    var docListArray = docListResult.getOutput();

                    for (x in docListArray) {
                        var doc = docListArray[x];
                        var description = doc.getDocDescription();
                        if (description && description != '') {
                            if (description.indexOf('_') > -1) {
                                if (description.indexOf('_') + 1 < description.lastIndexOf('_')) {
                                    var newDes = description.substring(description.indexOf('_') + 1, description.lastIndexOf('_'));
                                    doc.setDocDescription(newDes);
                                    aa.document.updateDocument(doc);
                                    //logDebug(doc.getDocDescription() + '-' + newDes);
                                    countTotal++;
                                }
                            }
                        }
                    }
                    //editAppName(newAppName);             
                      
                    logDebug('Updated: ' + countProcessed + ' of ' + numTotal + ' - ' + capId.getCustomID());

                }
                countProcessed++;
			}
		}
	}
	logDebug('Processed: ' + countProcessed);
	logDebug('Updated: ' + countTotal);
	//logDebug('Different EHS: ' + differentEHS);
	//logDebug('WF Reassigned: ' + wfReassigned);
	logDebug('');
}

function db() {
	this.version = function() {
		return 1.0;
	}

	/**
	 * Executes a sql statement and returns rows as dataset
	 * @param {string} sql 
	 * @param {integer} maxRows 
	 * @return {string[]}
	 */
	this.dbDataSet = function(sql, maxRows) {
		var dataSet = new Array();
		if (maxRows == null) {
			maxRows = 100;
		}
		try {
			var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
			var ds = initialContext.lookup("java:/MCPHD");
			var conn = ds.getConnection();
			var sStmt = aa.db.prepareStatement(conn, sql);
			sStmt.setMaxRows(maxRows);
			var rSet = sStmt.executeQuery();
			while (rSet.next()) {
				var row = new Object();
				var maxCols = sStmt.getMetaData().getColumnCount();
				for (var i = 1; i <= maxCols; i++) {
					row[sStmt.getMetaData().getColumnName(i)] = rSet.getString(i);
				}
				dataSet.push(row);
			}
			rSet.close();
			conn.close();
		} catch (err) {
			throw ("dbDataSet: " + err);
		}
		return dataSet;
	}

	/**
	 * Executes a sql statement and returns nothing
	 * @param {string} sql 
	 */
	this.dbExecute = function(sql) {
		try {
			var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
			var ds = initialContext.lookup("java:/MCPHD");
			var conn = ds.getConnection();
			var sStmt = aa.db.prepareStatement(conn, sql);
			sStmt.setMaxRows(1);
			var rSet = sStmt.executeQuery();
			rSet.close();
			conn.close();
		} catch (err) {
			throw ("deExecute: " + err);
		}
	}

	/**
	 * Returns first row first column of execute statement
	 * @param {string} sql
	 * @returns {object}  
	 */
	this.dbScalarExecute = function(sql) {
		var out = null;
		try {
			var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
			var ds = initialContext.lookup("java:/MCPHD");
			var conn = ds.getConnection();
			var sStmt = aa.db.prepareStatement(conn, sql);
			sStmt.setMaxRows(1);
			var rSet = sStmt.executeQuery();

			if (rSet.next()) {
				out = rSet.getString(1);
			}
			rSet.close();
			conn.close();
		} catch (err) {
			throw ("dbScalarValue: " + err);
		}
		return out;
	}
	return this;
}

function unassignTask(wfstr) // optional process name
{
	// Assigns the task to a user.  No audit.
	//
	var useProcess = false;
	var processName = "";

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			fTask.setAssignedUser(null);
            var taskItem = fTask.getTaskItem();
            taskItem.setAssignedUser(null);
			var adjustResult = aa.workflow.adjustTask(taskItem);

			//logMessage("Assigned Workflow Task: " + wfstr + " to " + username);
			//logDebug("Assigned Workflow Task: " + wfstr + " to " + username);
		}
	}
}

function lookupNoLog(stdChoice, stdValue) {
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		//logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
	} else {
		//logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
	}
	return strControl;
}

function assignCapNoLog(assignId) // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess()) {
		return false;
	}

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj) {
		return false;
	}

	cd = cdScriptObj.getCapDetailModel();

	iNameResult = aa.person.getUser(assignId);

	if (!iNameResult.getSuccess()) {
		return false;
	}

	iName = iNameResult.getOutput();

	cd.setAsgnDept(iName.getDeptOfUser());
	cd.setAsgnStaff(assignId);

	cdWrite = aa.cap.editCapDetail(cd)
}

function editAppSpecificNoLog(itemName, itemValue) // optional: itemCap
{
	var itemCap = capId;
	var itemGroup = null;

	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap, itemName, itemValue, itemGroup);
}

function scheduleInspectDateNoLog(iType, DateToSched) // optional inspector ID.
// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110)
// DQ - Added Optional 5th parameter inspComm
{
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3)
		if (arguments[2] != null) {
			var inspRes = aa.person.getUser(arguments[2]);
			if (inspRes.getSuccess())
				inspectorObj = inspRes.getOutput();
		}

	if (arguments.length >= 4)
		if (arguments[3] != null)
			inspTime = arguments[3];

	if (arguments.length >= 5)
		if (arguments[4] != null)
			inspComm = arguments[4];

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(DateToSched), inspTime, iType, inspComm)

	if (schedRes.getSuccess()) {
		//logDebug("Successfully scheduled inspection : " + iType + " for " + DateToSched);
	} else {
		logDebug("**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}
}

function getAssignedToRecord() {
	try {
		cap = aa.cap.getCapDetail(capId).getOutput();
		var capAssignPerson = cap.getAsgnStaff();
		return capAssignPerson;
	} catch (err) {
		logDebug("A JavaScript Error occurred: getAssignedToRecord:  " + err.message);
		logDebug(err.stack);
	}
}

function assignInspectionNoLog(iNumber, iName) {
	// optional capId
	// updates the inspection and assigns to a new user
	// requires the inspection id and the user name
	// V2 8/3/2011.  If user name not found, looks for the department instead
	//

	var itemCap = capId
	if (arguments.length > 2)
		itemCap = arguments[2]; // use cap ID specified in args

	iObjResult = aa.inspection.getInspection(itemCap, iNumber);
	if (!iObjResult.getSuccess()) {
		logDebug("**WARNING retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage());
		return false;
	}

	iObj = iObjResult.getOutput();

	iInspector = aa.person.getUser(iName).getOutput();

	if (!iInspector) // must be a department name?
	{
		var dpt = aa.people.getDepartmentList(null).getOutput();
		for (var thisdpt in dpt) {
			var m = dpt[thisdpt]
			if (iName.equals(m.getDeptName())) {
				iNameResult = aa.person.getUser(null, null, null, null, m.getAgencyCode(), m.getBureauCode(), m.getDivisionCode(), m.getSectionCode(), m.getGroupCode(), m.getOfficeCode());

				if (!iNameResult.getSuccess()) {
					logDebug("**WARNING retrieving department user model " + iName + " : " + iNameResult.getErrorMessage());
					return false;
				}

				iInspector = iNameResult.getOutput();
			}
		}
	}

	if (!iInspector) {
		logDebug("**WARNING could not find inspector or department: " + iName + ", no assignment was made");
		return false;
	}

	//logDebug("assigning inspection " + iNumber + " to " + iName);

	iObj.setInspector(iInspector);

	if (iObj.getScheduledDate() == null) {
		iObj.setScheduledDate(sysDate);
	}

	aa.inspection.editInspection(iObj)
}

function isTL(tuser) {
	if (tuser == 'DWEBSTER' || tuser == 'PPIPHER' || tuser == 'PWPARKER' || tuser == 'SCRUM' || tuser == 'AWHITMIR' || tuser == 'ADOERFLEIN' || tuser == 'BWEHRMEI' || tuser == 'LMORGAN' || tuser == 'TDEWELL') {
		return true;
	}
	return false;
}

function assignTaskNoLog(wfstr, username) // optional process name
{
	// Assigns the task to a user.  No audit.
	//
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}

	var taskUserResult = aa.person.getUser(username);
	if (taskUserResult.getSuccess())
		taskUserObj = taskUserResult.getOutput(); //  User Object
	else {
		logMessage("**ERROR: Failed to get user object: " + taskUserResult.getErrorMessage());
		return false;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			fTask.setAssignedUser(taskUserObj);
			var taskItem = fTask.getTaskItem();
			var adjustResult = aa.workflow.assignTask(taskItem);

			//logMessage("Assigned Workflow Task: " + wfstr + " to " + username);
			//logDebug("Assigned Workflow Task: " + wfstr + " to " + username);
		}
	}
}

function activateTaskNoLog(wfstr) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		//logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess) {
				aa.workflow.adjustTask(capId, stepnumber, processID, "Y", "N", null, null)
			} else {
				aa.workflow.adjustTask(capId, stepnumber, "Y", "N", null, null)
			}
			//logMessage("Activating Workflow Task: " + wfstr);
			//logDebug("Activating Workflow Task: " + wfstr);
		}
	}
}
