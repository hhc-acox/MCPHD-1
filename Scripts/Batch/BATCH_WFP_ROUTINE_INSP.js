/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_WFP_ROUTINE_INSP.js  Trigger: Batch
| Client: MCPHD - ticket #176
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
    var capCount = 0;


    //Setup the Query
    var cm = aa.cap.getCapModel().getOutput();
    cm.getCapType().setGroup("EnvHealth");
    cm.getCapType().setType("WQ");
    cm.getCapType().setSubType("Wellfield");
    cm.getCapType().setCategory("NA");
    //cm.setCapStatus("Active");


    var getCaps = aa.cap.getCapListByCollection(cm, null, null, null, null, null, []);
    if (getCaps.getSuccess()) {
        var gc = getCaps.getOutput();
        for (x in gc) {
            capId = gc[x].getCapID();
            cap = aa.cap.getCap(capId).getOutput();
            capStatus = cap.getCapStatus();

            //filter sites that are not active
            if (!matches(String(capStatus), "Active", "Site Active", "Active - Non-Exempt", "Active - Exempt")) {
                capFilterStatus++;
                continue;
            }

            logDebug("Found>" + capId.getCustomID());

            var checkCycle = getAppSpecific("Inspection Cycle");
            if (checkCycle == null || checkCycle == "") {
                logDebug("Warning> Missing inspection cycle");
                continue;
            }
            var dt = new Date();
            checkCycle = checkCycle.toUpperCase();
            if (checkCycle.indexOf("3 MONTH") >= 0) {
                dt = dt.setMonth(dt.getMonth() - 3);
            }
            else if (checkCycle.indexOf("6 MONTH") >= 0) {
                dt = dt.setMonth(dt.getMonth() - 6);
            }
            else if (checkCycle.indexOf("1 YEAR") >= 0) {
                dt = dt.setFullYear(dt.getFullYear() - 1);
            }
            else if (checkCycle.indexOf("2 YEAR") >= 0) {
                dt = dt.setFullYear(dt.getFullYear() - 2);
            }
            else if (checkCycle.indexOf("3 YEAR") >= 0) {
                dt = dt.setFullYear(dt.getFullYear() - 3);
            }
            else if (checkCycle.indexOf("4 YEAR") >= 0) {
                dt = dt.setFullYear(dt.getFullYear() - 4);
            }
            else if (checkCycle.indexOf("5 YEAR") >= 0) {
                dt = dt.setFullYear(dt.getFullYear() - 5);
            }
            else if (checkCycle.indexOf("6 YEAR") >= 0) {
                dt = dt.setFullYear(dt.getFullYear() - 6);
            }

            //get inspections
            var inspArr = aa.inspection.getInspections(capId).getOutput();
            var checkDate = new Date(dateAdd(dt, 0));
            var inspFound = false;

            for (var i in inspArr) {
                var insp = inspArr[i];
                if (String(insp.getInspectionType()) == "Routine") {
                	inspStatus = "" + insp.getInspectionStatus();
                	if (inspStatus == "Scheduled") {
                		var sdt = insp.getScheduledDate();
                		if (sdt != null) {
                			sudt = new Date(dateAdd(sdt, 0));
                			if (sudt.getTime() > checkDate.getTime()) {
                				logDebug("Scheduled inspection found within timeframe, skipping...");               			
                				inspFound = true;
                				break;
                			}
                		}
                		
                	}
                	else {               
                		var rdt = insp.getInspectionStatusDate();                  
	                    if (rdt != null) {
	                        var ludt = new Date(dateAdd(rdt, 0));
	                        if (ludt.getTime() > checkDate.getTime()) { //if existing inspection found then mark found and break loop
	                        	logDebug("Resulted inspection found within timeframe, skipping...");	                   
	                            inspFound = true;
	                            break;
	                        }
	                    }
                	}
                }
            }
            //if no routine found in period then schedule and assign to user assigned to record
            if (!inspFound) {
                logDebug("Schedule Routine Inspection");
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
                scheduleInspection("Routine", 0, asgnToUser);
            }
            capCount++;
        }
    }

    logDebug("Total CAPS qualified date range: " + gc.length);
    logDebug("Total CAPS skipped due to status " + capFilterStatus);
    logDebug("Total CAPS processed: " + capCount);
}

