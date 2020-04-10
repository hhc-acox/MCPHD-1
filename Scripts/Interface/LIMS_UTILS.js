/**********************************************************************************************
 LIMS Interface EMSE script

 This script will be called by the .NET portion of the interface.

*********************************************************************************************************/
var myCapId = "";
var myUserId = "ADMIN";
var eventName = "NA";
var useProductScript = true; 
var runEvent = false;
debug = "";

/* master script code don't touch */ aa.env.setValue("EventName", eventName); var vEventName = eventName; var controlString = eventName; var tmpID = aa.cap.getCapID(myCapId).getOutput(); if (tmpID != null) { aa.env.setValue("PermitId1", tmpID.getID1()); aa.env.setValue("PermitId2", tmpID.getID2()); aa.env.setValue("PermitId3", tmpID.getID3()); } aa.env.setValue("CurrentUserID", myUserId); var preExecute = "PreExecuteForAfterEvents"; var documentOnly = false; var SCRIPT_VERSION = 3.0; var useSA = false; var SA = null; var SAScript = null; var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { useSA = true; SA = bzr.getOutput().getDescription(); bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT"); if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); } } if (SA) { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript, SA, useProductScript)); } else { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useProductScript)); } eval(getScriptText("INCLUDES_CUSTOM", null, useProductScript)); if (documentOnly) { doStandardChoiceActions2(controlString, false, 0); aa.env.setValue("ScriptReturnCode", "0"); aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed."); aa.abortScript(); } var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName); var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS"; var doStdChoices = true; var doScripts = false; var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0; if (bzr) { var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE"); doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I"; var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT"); doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I"; } function getScriptText(vScriptName, servProvCode, useProductScripts) { if (!servProvCode) servProvCode = aa.getServiceProviderCode(); vScriptName = vScriptName.toUpperCase(); var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput(); try { if (useProductScripts) { var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName); } else { var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN"); } return emseScript.getScriptText() + ""; } catch (err) { return ""; } } logGlobals(AInfo); if (runEvent && typeof (doStandardChoiceActions) == "function" && doStdChoices) try { doStandardChoiceActions(controlString, true, 0); } catch (err) { logDebug(err.message) } if (runEvent && typeof (doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g, "\r"); aa.print(z);
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
debug = "";
var infoLog = [];
var warningLog = [];
var errorLog = [];
var content = [];
var mess = "";

var customId = String(aa.env.getValue("customId"));
var inspectionId = String(aa.env.getValue("inspectionId"));
var sampleId = String(aa.env.getValue("sampleId"));

//var customId = "WQ-CMP20-00103";
//var inspectionId = "31556595";
//var sampleId = "TESTSAMPLEID";
if (inspectionId && sampleId && customId) {
    var capRes = aa.cap.getCapID(customId);

    if (capRes.getSuccess()) {
        capId = capRes.getOutput();

        sendNotificationForSample(inspectionId, sampleId, capId);
        successFlag = true;
    } else {
        successFlag = false;
        mess = "";
    }
    returnStuff(successFlag, mess);
}

function returnStuff(sFlag) {
    if (successFlag)
        aa.env.setValue("success", "true");
    else
        aa.env.setValue("success", "false");
    if (arguments.length == 2)
        aa.env.setValue("message", arguments[1]);
    else 
        aa.env.setValue("message", "Script executed successfully");
    if (content) {
        aa.env.setValue("content", buildResultStructure(content));
    } else {
        aa.env.setValue("content", "");
    }
    if (errorLog) {
        aa.env.setValue("error", buildResultStructure(errorLog));
    } else {
        aa.env.setValue("error", []);
    }
    if (infoLog) {
        aa.env.setValue("info", buildResultStructure(infoLog));
    } else {
        aa.env.setValue("info", []);
    }
    if (warningLog) {
        aa.env.setValue("warning", buildResultStructure(warningLog));
    } else {
        aa.env.setValue("warning", []);
    }
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", debug);
}

function arrayToString(arr) {
    return "[" + (arr ? arr.join("|") : "") + "]";
}
// returns the result as proper JSON structure when called by construct API
function buildResultStructure(value) {
    if (value) {
        if (Object.prototype.toString.call(value) == "[object Object]") {
            value = buildObjectStructure(value);
        } else if (Object.prototype.toString.call(value) === '[object Array]') {
            value = buildArrayStructure(value);
        }
    }
    return value;
}

function buildObjectStructure(obj) {
    var table = aa.util.newHashMap();
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            var value = obj[p];
            table.put(obj[p], buildResultStructure(value));
        }
    }
    return obj;
}

function buildArrayStructure(arr) {
    var arrList = aa.util.newArrayList();
    for (var i = 0; i < arr.length; i++) {
        arrList.add(buildResultStructure(arr[i]));
    }
    return arrList;
}

function logInfo(s) {
    infoLog.push(s);
}

function logWarning(s) {
    warningLog.push(s);
}

function logError(s) {
    errorLog.push(s);
}

function getEmailByUserID(userId) { // optional capId

    if (userId) {
        var userRes = aa.person.getUser(userId);

        if (userRes.getSuccess()) {
            return userRes.getOutput().getEmail();
        }
    }
}

function sendNotificationForSample(inspectionId, sampleId, tcapId) {

    if (inspectionId && tcapId) {
        var inspection = aa.inspection.getInspection(tcapId, inspectionId);

        if (inspection.getSuccess()) {
            var tInsp = inspection.getOutput()

            var inspector = tInsp.getInspector();

            if (inspector) {
                var email = getEmailByUserID(inspector.getUserID());

                if (email.indexOf("@") > 0) {
                    var EMAIL_FROM = "accela-noreply@marionhealth.org";
                    var customId = tcapId.getCustomID();
                    var tid1 = capId.getID1();
                    logDebug('tid1: ' + tid1);
                    var tid2 = capId.getID2();
                    logDebug('tid2: ' + tid2);
                    var tid3 = capId.getID3();
                    logDebug('tid3: ' + tid3);

                    // send notification
                    var eParams = aa.util.newHashtable();
                    eParams.put("$$CAPID$$", customId);
                    eParams.put("$$CAPID1$$", tid1);	
                    eParams.put("$$CAPID2$$", tid2);	
                    eParams.put("$$CAPID3$$", tid3);
                    eParams.put("$$INSPECTIONID$$", inspectionId);
                    eParams.put("$$SAMPLEID$$", sampleId);	
                    
                    sendNotification(
                        EMAIL_FROM
                        , String(email)
                        , ""
                        , "EMSE_LIMS_SAMPLE_RETURNED"
                        , eParams
                        , [], tcapId
                    );
                }                        
            }
        }
    }
}
