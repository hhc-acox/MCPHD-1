/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LIFT_STATION_TO_SET.js  Trigger: Batch
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

var setCode = 'WQ_LIFT_ROUTINE_INSPECTIONS'
var setType = 'LIFT Routines'
var setStatus = 'Ready to Process'

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
    var capCount = 0;

    aa.set.removeSetHeader(setCode);  //remove the existing set members if the set exists so you start with a fresh Set.
    aa.set.createSet(setCode,setCode,setType,"Populated 12:30 AM daily via batch script BATCH_CCF_ROUTINE_TO_SET");
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


    //Setup the Query for EnvHealth/VC/MonitorSite/NA
    var cm = aa.cap.getCapModel().getOutput();
    cm.getCapType().setGroup("EnvHealth");
    cm.getCapType().setType("WQ");
    cm.getCapType().setSubType("Lift Station");
    cm.getCapType().setCategory("NA");
    //cm.setCapStatus("Active");

    var getCaps = aa.cap.getCapListByCollection(cm, null, null, null, null, null, []);
    if (getCaps.getSuccess()) {
        var gc = getCaps.getOutput();
        for (x in gc) {
            capId = gc[x].getCapID();
            cap = aa.cap.getCap(capId).getOutput();
            var capIDModel = aa.cap.getCapIDModel(capId.getID1(),capId.getID2(),capId.getID3()).getOutput();
            capStatus = cap.getCapStatus();
            /*if (!matches(String(capStatus), "Active", "Site Active")) {
                capFilterStatus++;
            }}*/

            var st = String(taskStatus("Site Status"));
            if (matches(String(capStatus).toUpperCase(), "CASE CLOSED", "INACTIVE")) {
                capFilterStatus++;
                continue;
            }
            
            aa.set.addCapSetMember(setCode,capIDModel);
            capCount++;
        }
    }

    logDebug("Total CAPS qualified date range: " + gc.length);
    logDebug("Total CAPS skipped due to status " + capFilterStatus);
    logDebug("Total CAPS processed: " + capCount);
}
