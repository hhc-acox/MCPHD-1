/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_POOL_ROUTINES.js  Trigger: Batch
| Client:
|
| Version 1.0 - Initial
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

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
} else {
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var fromDate = getParam("fromDate"); // Hardcoded dates.   Use for testing only
var toDate = getParam("toDate"); // ""
var dFromDate = aa.date.parseDate(fromDate); //
var dToDate = aa.date.parseDate(toDate); //
var pFrequency = getParam("Frequency");
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
var systemUserObj = aa.person.getUser("ADMIN").getOutput();


/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

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
    var capFilterStatus = 0;
    var capFilterDate = 0;
    var capCount = 0;

    var dt = new Date();
    var May = new Date("05/31/" + dt.getFullYear());
    var Sept = new Date("09/01/" + dt.getFullYear());
    var eom = new Date(dt.getFullYear(), dt.getMonth()+1, 28);
    var endOfNextMonth = eom.getMonth()+1 + '/' + eom.getDate() + '/' + eom.getFullYear();
    var eonm = new Date(endOfNextMonth);
    var lastWeekMay = getDateOccuranceByDate(May, -1, "sunday", 1);
    logDebug("Last Week May " + lastWeekMay);
    var secWeekSept = getDateOccuranceByDate(Sept, 1, "friday", 2);
    logDebug("Second Week Sept " + secWeekSept);

    var numToProcess = 10000;
    // get all capids
    var conn = new db();
    var sql = "with scheduled as ( SELECT b.b1_alt_id, g6.G6_ACT_DD FROM dbo.b1permit b INNER JOIN dbo.g6action g6 ON g6.B1_PER_ID1 = b.B1_PER_ID1 AND g6.B1_PER_ID2 = b.B1_PER_ID2 AND g6.B1_PER_ID3 = b.B1_PER_ID3 AND g6.SERV_PROV_CODE = b.SERV_PROV_CODE WHERE b.serv_prov_code = 'MCPHD' AND b.b1_per_type = 'WQ' AND b.b1_per_sub_type = 'Pool' AND b.b1_per_category = 'License' AND g6.G6_ACT_DD > dbo.att_to_date (CONVERT (varchar(101), EOMONTH (SYSDATETIME()), 101)) AND g6.G6_ACT_DD < DATEADD(d, 1, dbo.att_to_date ( CONVERT (varchar(10), EOMONTH (DATEADD (m, 1, SYSDATETIME())), 101))) AND g6.G6_STATUS = 'Scheduled' AND g6.G6_ACT_TYP = 'Routine' ) select b.B1_PER_ID1, b.B1_PER_ID2, b.B1_PER_ID3, bd.B1_ASGN_STAFF from dbo.b1permit b inner join dbo.bpermit_detail bd on bd.B1_PER_ID1 = b.B1_PER_ID1 and bd.B1_PER_ID2 = b.B1_PER_ID2 and bd.B1_PER_ID3 = b.B1_PER_ID3 and bd.SERV_PROV_CODE = b.SERV_PROV_CODE where b.serv_prov_code = 'MCPHD' and b.b1_per_type = 'WQ' AND b.b1_per_sub_type = 'Pool' AND b.b1_per_category = 'License' and NOT EXISTS (select 1 from scheduled s where s.b1_alt_id = b.b1_alt_id)";
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
            capStatus = cap.getCapStatus();

            var asgnToUser = String(ds[r]["B1_ASGN_STAFF"])

            var st = String(taskStatus("Issuance"));
            if (matches(String(capStatus).toUpperCase(), "EXPIRED", "INACTIVE", "REVOKED", "RAZED")) {
                capFilterStatus++;
                continue;
            }
            var licType = getAppSpecific("Pool License Type");
            if (String(licType) == "Summer") {
                if (eonm.getTime() < lastWeekMay.getTime() || eonm.getTime() > secWeekSept.getTime()) {
                    capFilterDate++
                    continue;
                }
            }

            scheduleInspectDate("Routine",endOfNextMonth,asgnToUser);
            capCount++;
        }
    }

    logDebug("Total CAPS qualified date range: " + ds.length);
    logDebug("Total CAPS skipped due to status " + capFilterStatus);
    logDebug("Total CAPS skipped due to summer " + capFilterDate);
    logDebug("Total CAPS processed: " + capCount);
}

function getDateOccuranceByDate(startDt, direction, day, occurance) {
    var weekday = new Array();
    weekday["sunday"] = 0;
    weekday["monday"] = 1;
    weekday["tuesday"] = 2;
    weekday["wednesday"] = 3;
    weekday["thursday"] = 4;
    weekday["friday"] = 5;
    weekday["saturday"] = 6;

    var diff = 0;
    if (direction > 0) {
        if (startDt.getDay() != weekday[day.toLowerCase()]) {

            if (startDt.getDay() < weekday[day.toLowerCase()]) {
                diff = weekday[day.toLowerCase()] - startDt.getDay();
            }
            else {
                diff = startDt.getDay() - weekday[day.toLowerCase()] + 7;
            }

        }
        startDt = startDt.setDate(startDt.getDate() + diff + ((occurance - 1) * 7));
        return new Date(startDt);
    }
    else {
        if (startDt.getDay() != weekday[day.toLowerCase()]) {

            if (startDt.getDay() > weekday[day.toLowerCase()]) {
                diff = startDt.getDay() - weekday[day.toLowerCase()];
            }
            else {
                diff = weekday[day.toLowerCase()] + startDt.getDay() - 7;
            }

        }
        startDt = startDt.setDate(startDt.getDate() + diff + ((occurance - 1) * -7));
        return new Date(startDt);

    }
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
