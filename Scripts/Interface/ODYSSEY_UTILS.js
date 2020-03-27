/**********************************************************************************************
 Odyssey Interface EMSE script

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

//test data
//var resultsRecords = [
//    ["154-929-190211", "05/08/2018", "5:14:00 AM", "$FLAME", "Iron", "-0-", "Present < MDL", "Present < MDL", "0.1", "mg/L", "-0-", "-0-", "-0-", "-0-", "-0-", "ZD00477", "-0-"],
 //   ["154-929-190211", "05/08/2018", "5:15:00 AM", "$FLAME", "Sodium", "27.7", "CONC", "CONC 1", "1", "mg/L", "-0-", "-0-", "-0-", "-0-","-0-", "ZD00477", "-0-"]
//];


var operation = String(aa.env.getValue("operation"));
if (operation == "GETSCRIPT") {
    var sName = String(aa.env.getValue("scriptToGet"));
    mess = getScriptText(sName, null, false);
    mess = mess.replace(/[\n\r\t]/g, '')
    if (mess) { 
        successFlag = true;
    }
    else {
        successFlag = false;
        mess = "";
    }
    returnStuff(successFlag, mess);
}
if (operation == "CHECKPARENTWORKFLOW") {
    successFlag = true;
    var sName = String(aa.env.getValue("statusToCheck"));
    var altId = String(aa.env.getValue("courtCase"));
    capId = getApplication(altId);
    if (capId) {
        parentId = getParentByCapId(capId);
        if (parentId) {
            ans = doesStatusExistInTaskHistory(sName, parentId);
            if (ans) message = "STATUSEXIST";
            else message = "STATUSDOESNOTEXIST";
        }
        else {
            successFlag = false;
            logError("No parent found for " + altId);
        }

    }
    else {
        successFlag = false;
        logError("Could not get application " + altId);
    }
    returnStuff(successFlag, message);

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

function doesStatusExistInTaskHistory(tStatus, itemCap) {
	histResult = aa.workflow.getWorkflowHistory(itemCap, null);
	if (histResult.getSuccess()) {
        var taskHistArr = histResult.getOutput();
		for (var xx in taskHistArr) {
			taskHist = taskHistArr[xx];
			if (tStatus.equals(taskHist.getDisposition()))
				return true;
		}
		return false;		
	}
	else {
		logDebug("Error getting task history : " + histResult.getErrorMessage());
	}
	return false;
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
