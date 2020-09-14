/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_VC_ADULT_CASE_TO_SET.js  Trigger: BATCH
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

var setCode = 'VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS'
var setType = 'VC Adulticide'
var setStatus = 'Ready to Process'

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
	var numToProcess = 1000;
	var countTotal = 0;
	var countProcessed = 0;
	var differentEHS = 0;
	var wfReassigned = 0;
	// get all capids
	var conn = new db();
	var sql = "SELECT DISTINCT b.B1_PER_ID1, b.B1_PER_ID2, b.B1_PER_ID3 FROM dbo.B1PERMIT B INNER JOIN dbo.G6ACTION G6A ON G6A.B1_PER_ID1 = B.B1_PER_ID1 AND G6A.B1_PER_ID2 = B.B1_PER_ID2 AND G6A.B1_PER_ID3 = B.B1_PER_ID3 AND G6A.SERV_PROV_CODE = 'MCPHD' AND (G6A.G6_ACT_TYP = 'Adulticide' OR G6A.G6_ACT_TYP = 'Adulticide Inspection') AND G6A.G6_STATUS = 'Scheduled' AND G6A.REC_STATUS = 'A' WHERE B.SERV_PROV_CODE = 'MCPHD' AND B.B1_PER_GROUP = 'EnvHealth' AND B.B1_APP_TYPE_ALIAS IN ('Adulticide Complaint', 'Monitor Site') and b.b1_appl_status != 'Closed'";
	var ds = conn.dbDataSet(sql, numToProcess);
    // foreach cap in capid list
    
    aa.set.removeSetHeader(setCode);  //remove the existing set members if the set exists so you start with a fresh Set.
    aa.set.createSet("VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS","VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS","VC Adulticide","Populated 5:00 PM daily via batch script BATCH_VC_ADULT_CASE_TO_SET");
    // update set type and status
    setScriptResult = aa.set.getSetByPK(setCode);
    //aa.print(setScriptResult);
    if (setScriptResult.getSuccess())
    {
        setScript = setScriptResult.getOutput();
        setScript.setRecordSetType(setType);
        setScript.setSetStatus(setStatus);
        aa.print(setScript.getSetStatus());
        updSet = aa.set.updateSetHeader(setScript).getOutput();
    }
        
	for (var r in ds) {
		//while(recordsProcessed < numToProcess) {
		//var r = recordsProcessed;
        var s_capResult = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"]));
        
		if (s_capResult.getSuccess()) {
			var tCapId = s_capResult.getOutput();
			capId = tCapId;
			cap = aa.cap.getCap(capId).getOutput();
			//exploreObject(tCapId);

			if (cap && capId) {
                var altCapId = aa.cap.getCapID(capId.getID1(),capId.getID2(),capId.getID3()).getOutput(); //assembles the b1Permit_b1_altID
                var capIDModel = aa.cap.getCapIDModel(capId.getID1(),capId.getID2(),capId.getID3()).getOutput(); //needed to add the cap to the set
                var capIDString = altCapId.getCustomID();
                var capAddress = "";
                // This gets the Case Information, we are looking for the Case Status.
                cap = aa.cap.getCap(capId).getOutput();
                aa.set.addCapSetMember(setCode,capIDModel);
						
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


function tcopyLeadViolations(inspId, inspDate) {
    logDebug('Copying for ' + inspId);
	var tconn = new db();
	var tsql = "SELECT G6_ACT_NUM FROM dbo.G6ACTION WHERE SERV_PROV_CODE='{0}' AND B1_PER_ID1='{1}' AND B1_PER_ID2='{2}' AND B1_PER_ID3='{3}' AND G6_ACT_TYP in ('Initial Lead Inspection', 'Reinspection', 'Yearly Lead Inspection') and g6_status = 'In Violation' and rec_status != 'I' and G6_COMPL_DD < dbo.att_to_date('{4}') ORDER BY G6_COMPL_DD DESC";
	tsql = tsql.replace("{0}", String(aa.getServiceProviderCode()))
		.replace("{1}", String(capId.getID1()))
		.replace("{2}", String(capId.getID2()))
        .replace("{3}", String(capId.getID3()))
        .replace("{4}", String(inspDate));
	var tds = tconn.dbDataSet(tsql, 1);

	var lastInsp = null;
	if (tds.length) {
		lastInsp = parseInt(tds[0]["G6_ACT_NUM"], 10);
		logDebug("Found " + lastInsp);
	}
	if (lastInsp == null) {
		logDebug("No prior inspection");
	} else {
        // find LHH_Violations checklist on last inspection.
        var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
        var qf = new com.accela.aa.util.QueryFormat();
        var gs = gsb.getGGuideSheetWithItemsByInspectID(capId, lastInsp,qf);
        if (gs == null) {
            logDebug("No Guidesheets to copy");
        } else {
            var gsa = gs.result.toArray();
            if (gsa.length < 1) {
                logDebug("No Guideitems to copy");
            } else {
                dg = null;
                for (var gsIndex in gsa) {
                    gs = gsa[gsIndex];
                    gsType = gs.getGuideType();
                    if (gsType == "LHH_Violations") {
                        dg = gs;
                        break;
                    }
                }
                if (dg != null) {
                    var guidesheetItemArr = dg.getItems().toArray();
                    var item = null;
                    for (var itemIndex in guidesheetItemArr) {
                        item = guidesheetItemArr[itemIndex];
                        if (item.getGuideItemText() == "Violations") 
                            break;
                    }
                    if (item != null) {
                        //logDebug("Found guideitem to copy from");
                        var gio = new guideSheetObject(dg, item);
                        gio.loadInfoTables();
                        if (gio.validTables) {
                            table = gio.infoTables["VIOLATIONS"];
                            aa.print(table.length); 
                            
                            // get guideitem on the current inspection
                            gs = gsb.getGGuideSheetWithItemsByInspectID(capId, parseInt(inspId), qf);
                            if (gs == null) {
                                logDebug("No Guidesheets to copy to");
                            } else {
                                var gsa = gs.result.toArray();
                                if (gsa.length < 1) {
                                    logDebug("No Guideitems to copy to");
                                } else {
                                    dg = null;
                                    for (var gsIndex in gsa) {
                                        gs = gsa[gsIndex];
                                        gsType = gs.getGuideType();
                                        if (gsType == "LHH_Violations") {
                                            dg = gs;
                                            break;
                                        }
                                    }
                                    if (dg != null) {
                                        var guidesheetItemArr = dg.getItems().toArray();
                                        var newItem = null;
                                        for (var itemIndex in guidesheetItemArr) {
                                            newItem = guidesheetItemArr[itemIndex];
                                            if (newItem.getGuideItemText() == "Violations") 
                                                break;
                                        }
                                        if (newItem != null) {
                                            //logDebug("Adding table to new item");
                                            addToGASIT(newItem, "VIOLATIONS", table);
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

