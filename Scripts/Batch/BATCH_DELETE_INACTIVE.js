/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_DELETE_INACTIVE.js  Trigger: BATCH
| Description: This script is designed to be run in Accela - Batch Engine to remove records with a status of Inactive-Error
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
var useCustomScriptFile = true;  			// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM

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
    var numToProcess = 1000;
    var countTotal = 0;
    var countProcessed = 0;
    // get all capids
    var conn = new db();
    var sql = "select distinct b.B1_PER_ID1, b.B1_PER_ID2, b.B1_PER_ID3 from DBO.b1permit b where b.serv_prov_code = 'MCPHD' and b.b1_per_type IN ('Housing', 'CRT') and b.b1_appl_status = 'Inactive-Error' and b.rec_status = 'A'";
    var ds = conn.dbDataSet(sql, numToProcess);
    countTotal = ds.length;
    // foreach cap in capid list
	for (var r in ds) {
    //while(recordsProcessed < numToProcess) {
        //var r = recordsProcessed;
        var s_capResult = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"]));

        if (s_capResult.getSuccess()) {
            var tCapId =  s_capResult.getOutput();
            capId = tCapId;
            cap = aa.cap.getCap(capId).getOutput();
            //exploreObject(tCapId);

            if (cap && capId) {
                if (cap.getCapStatus() == 'Inactive-Error') {
                    var removeResult = aa.cap.removeRecord(capId);

                    if (removeResult.getSuccess()) {
                        logDebug("Removed " + capId.getCustomID());
                        countProcessed++;
                    }
                    else {
                        logDebug("Warning: removing record " + capId.getCustomID() + " was unsuccessful.  The reason is "  + removeResult.getErrorType() + ":" + removeResult.getErrorMessage());
                    }
                } else {
                    logDebug("Warning: removing record " + capId.getCustomID() + " was unsuccessful.  The reason is: Cap Status is not Inactive-Error");
                }
            }
        }
        //logDebug('Processed: ' + countTotal);
        //logDebug('Updated: ' + countProcessed);
    }

    logDebug('Total Records Checked: ' + countTotal);
    logDebug('Total Records Removed: ' + countProcessed);
    logDebug('');
}

function db() {
	this.version = function () {
		return 1.0;
	}

    /**
     * Executes a sql statement and returns rows as dataset
     * @param {string} sql 
     * @param {integer} maxRows 
     * @return {string[]}
     */
	this.dbDataSet = function (sql, maxRows) {
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
		}
		catch (err) {
			throw ("dbDataSet: " + err);
		}
		return dataSet;
	}

    /**
     * Executes a sql statement and returns nothing
     * @param {string} sql 
     */
	this.dbExecute = function (sql) {
		try {
			var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
			var ds = initialContext.lookup("java:/MCPHD");
			var conn = ds.getConnection();
			var sStmt = aa.db.prepareStatement(conn, sql);
			sStmt.setMaxRows(1);
			var rSet = sStmt.executeQuery();
			rSet.close();
			conn.close();
		}
		catch (err) {
			throw ("deExecute: " + err);
		}
	}

    /**
     * Returns first row first column of execute statement
     * @param {string} sql
     * @returns {object}  
     */
	this.dbScalarExecute = function (sql) {
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
		}
		catch (err) {
			throw ("dbScalarValue: " + err);
		}
		return out;
	}
	return this;
}
