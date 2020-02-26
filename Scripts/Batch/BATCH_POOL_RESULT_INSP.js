/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_POOL_RESULT_INSP.js  Trigger: Batch
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


    //Setup the Query for EnvHealth/VC/MonitorSite/NA
    var cm = aa.cap.getCapModel().getOutput();
    cm.getCapType().setGroup("EnvHealth");
    cm.getCapType().setType("WQ");
    cm.getCapType().setSubType("Pool");
    cm.getCapType().setCategory("License");
    //cm.setCapStatus("Active");

    var dt = new Date();
    var May = new Date("05/31/" + dt.getFullYear());
    var Sept = new Date("09/01/" + dt.getFullYear());
    var lastWeekMay = getDateOccuranceByDate(May, -1, "sunday", 1);
    logDebug("Last Week May " + lastWeekMay);
    var secWeekSept = getDateOccuranceByDate(Sept, 1, "friday", 2);
    logDebug("Second Week Sept " + secWeekSept);

    var getCaps = aa.cap.getCapListByCollection(cm, null, null, null, null, null, []);
    if (getCaps.getSuccess()) {
        var gc = getCaps.getOutput();
        for (x in gc) {
            capId = gc[x].getCapID();
            cap = aa.cap.getCap(capId).getOutput();
            capStatus = cap.getCapStatus();
            /*if (!matches(String(capStatus), "Active", "Site Active")) {
                capFilterStatus++;
            }}*/

            var st = String(taskStatus("Issuance"));
            if (matches(String(capStatus).toUpperCase(), "EXPIRED", "INACTIVE", "REVOKED", "RAZED")) {
                capFilterStatus++;
                continue;
            }
            var licType = getAppSpecific("Pool License Type");
            if (String(licType) == "Summer") {
                if (dt.getTime() < lastWeekMay.getTime() || dt.getTime() > secWeekSept.getTime()) {
                    capFilterDate++
                    continue;
                }
            }
            var asgnToUser = null;
            var capDetailObjResult = aa.cap.getCapDetail(capId);
            if (capDetailObjResult.getSuccess()) {
                capDetail = capDetailObjResult.getOutput();
                var cd = capDetailObjResult.getOutput();
                if (cd.getAsgnStaff() != null) {
                }
            }
            if (capDetailObjResult.getSuccess()) {
                var cd = capDetailObjResult.getOutput();
                if (cd.getAsgnStaff() != null) {
                    asgnToUser = cd.getAsgnStaff();
                    logDebug("Found Record Assignment " + asgnToUser);
                }
            }
            scheduleInspection("Pool Test Results", 0, asgnToUser);

            capCount++;
        }
    }

    logDebug("Total CAPS qualified date range: " + gc.length);
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
