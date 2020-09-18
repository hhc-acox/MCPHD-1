/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LVC_INSP_LAB
| Client:  MCPHD
|
| Version 1.0 - Base Version. 
|
| 
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

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");


if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
    //var resultDate = sysDate;
    var resultComment = 'Updated by Script';
	var conn = new db();

    // records
    var sql = "SELECT b.B1_PER_ID1, b.B1_PER_ID2, b.B1_PER_ID3, g6.G6_ACT_NUM, FORMAT(G6_COMPL_DD, 'yyyy-MM-dd') as INSPDATE FROM dbo.b1permit b INNER JOIN dbo.g6action g6 ON g6.B1_PER_ID1 = b.B1_PER_ID1 AND g6.B1_PER_ID2 = b.B1_PER_ID2 AND g6.B1_PER_ID3 = b.B1_PER_ID3 AND g6.SERV_PROV_CODE = b.SERV_PROV_CODE INNER JOIN dbo.gguidesheet gd ON gd.G6_ACT_NUM = g6.G6_ACT_NUM AND gd.SERV_PROV_CODE = g6.SERV_PROV_CODE INNER JOIN dbo.ggdsheet_item_asi asi ON asi.GUIDESHEET_SEQ_NBR = gd.GUIDESHEET_SEQ_NBR AND asi.SERV_PROV_CODE = gd.SERV_PROV_CODE WHERE b.b1_per_sub_type = 'LarvicideSite' AND b.serv_prov_code = 'MCPHD' AND g6.g6_status = 'Technician Complete' AND asi.ASI_NAME = 'Sample Collected?' AND asi.asi_comment IN ('Y', 'Yes')";
    var numToProcess = 10;
    var ds = conn.dbDataSet(sql, numToProcess);
    // foreach cap in capid list
    for (var r in ds) {        

        var s_capResult = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"]));

        if (s_capResult.getSuccess()) {
            var tCapId = s_capResult.getOutput();
            capId = tCapId;
            cap = aa.cap.getCap(capId).getOutput();
            
            if (capId) {
                inspId = String(ds[r]["G6_ACT_NUM"]);
                var formattedDate = String(ds[r]["INSPDATE"]);
                logDebug(formattedDate);
                aa.inspection.resultInspection(capId, inspId, 'Waiting on Lab',formattedDate, resultComment, 'ADMIN');

                logDebug('Resulted: ' + inspId);
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
