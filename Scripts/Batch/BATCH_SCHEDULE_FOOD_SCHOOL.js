/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_SCHEDULE_FOOD_SCHOOL.js  Trigger: BATCH
| Description: This script is designed to be run in Accela
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
    var sql = "select b.B1_PER_ID1, b.B1_PER_ID2, b.B1_PER_ID3, b.B1_PER_TYPE, b.B1_PER_SUB_TYPE, b.B1_PER_CATEGORY, bd.B1_ASGN_STAFF from dbo.b1permit b inner join dbo.bchckbox asi on asi.B1_PER_ID1 = b.B1_PER_ID1 and asi.B1_PER_ID2 = b.B1_PER_ID2 and asi.B1_PER_ID3 = b.B1_PER_ID3 and asi.SERV_PROV_CODE = b.SERV_PROV_CODE and asi.b1_checkbox_desc = 'Type of Establishment' and asi.b1_checklist_comment IN ('School', 'Limited Service School') left join dbo.bpermit_detail bd on bd.B1_PER_ID1 = b.B1_PER_ID1 and bd.B1_PER_ID2 = b.B1_PER_ID2 and bd.B1_PER_ID3 = b.B1_PER_ID3 and bd.SERV_PROV_CODE = b.SERV_PROV_CODE where b.serv_prov_code = 'MCPHD' and b.b1_per_type = 'Food' and b.b1_per_sub_type = 'Establishment' and b.b1_per_category = 'License' and b.b1_appl_status = 'Active'";
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

            var tappTypeArray = ["EnvHealth" , String(ds[r]["B1_PER_TYPE"]), String(ds[r]["B1_PER_SUB_TYPE"]), String(ds[r]["B1_PER_CATEGORY"])];          
            
            if (cap && capId) {
                countProcessed++;
                inspId = String(ds[r]["G6_ACT_NUM"]);
                var assignTo = String(ds[r]["B1_ASGN_STAFF"]);

                logDebug(capId.getCustomID() + ' - ' + countProcessed + ' of ' + countTotal);
                //logDebug(inspId);
                tscheduleFoodInspectionsByDate('Routine', '08/01/2020', assignTo, capId, tappTypeArray);
                //cancelResult = aa.inspection.cancelInspection(capId,inspId);
                //tdoGuidesheetAutomation(inspId, inspTyp, tappTypeArray, capId);
                //logDebug('');
                //logDebug('');
                
            }
        }
        //countTotal++;
        //logDebug('Processed: ' + countTotal);
        //logDebug('Updated: ' + countProcessed);
    }

    logDebug('Total Inspections Checked: ' + countTotal);
    logDebug('Total Inspections Updated: ' + countProcessed);
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

function lookupNoLog(stdChoice,stdValue) 
{
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	
   	if (bizDomScriptResult.getSuccess())
   		{
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		//logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
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

	if (!cdScriptObj){
        return false; 
    }

	cd = cdScriptObj.getCapDetailModel();

	iNameResult  = aa.person.getUser(assignId);

	if (!iNameResult.getSuccess()){ 
        return false; 
    }

	iName = iNameResult.getOutput();

	cd.setAsgnDept(iName.getDeptOfUser());
	cd.setAsgnStaff(assignId);

	cdWrite = aa.cap.editCapDetail(cd)
}

function editAppSpecificNoLog(itemName,itemValue)  // optional: itemCap
{
	var itemCap = capId;
	var itemGroup = null;
  	
   	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);
}

function scheduleInspectDateNoLog(iType,DateToSched) // optional inspector ID.
// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110)
// DQ - Added Optional 5th parameter inspComm
	{
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3)
		if (arguments[2] != null)
			{
			var inspRes = aa.person.getUser(arguments[2]);
			if (inspRes.getSuccess())
				inspectorObj = inspRes.getOutput();
			}

        if (arguments.length >= 4)
            if(arguments[3] != null)
		        inspTime = arguments[3];

		if (arguments.length >= 5)
		    if(arguments[4] != null)
		        inspComm = arguments[4];

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(DateToSched), inspTime, iType, inspComm)

	if (schedRes.getSuccess()){
		//logDebug("Successfully scheduled inspection : " + iType + " for " + DateToSched);
    }
	else{
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
    }
    }
    
function tscheduleFoodInspectionsByDate(iType, dateToSched, inspectorId, tCapId, tappType) {
    var inspRes = tscheduleInspectDateAndReturnId(iType, dateToSched, inspectorId);

    if (inspRes) {
        tdoGuidesheetAutomation(inspRes, iType, tappType, tCapId);
    }
}

    function tscheduleInspectDateAndReturnId(iType,DateToSched) // optional inspector ID.
// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110)
// DQ - Added Optional 5th parameter inspComm
{
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3)
		if (arguments[2] != null)
			{
			var inspRes = aa.person.getUser(arguments[2]);
			if (inspRes.getSuccess())
				inspectorObj = inspRes.getOutput();
			}

        if (arguments.length >= 4)
            if(arguments[3] != null)
		        inspTime = arguments[3];

		if (arguments.length >= 5)
		    if(arguments[4] != null)
		        inspComm = arguments[4];

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(DateToSched), inspTime, iType, inspComm)

	if (schedRes.getSuccess()) {
        //logDebug("Successfully scheduled inspection : " + iType + " for " + DateToSched);
        return schedRes.getOutput();
    }
		
	else{
        logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
        return false;
    }
}

function tdoGuidesheetAutomation(inInspId, inInspType, inAppTypeArr, inCapId) {
    try{
        var tinspId = inInspId;
        var tinspType = inInspType;
        var tappTypeArray = inAppTypeArr;
        var tcapId = inCapId;

        //logDebug('GS Automation - InspId: ' + tinspId + ' InspType: ' + tinspType);
        //logDebug('' + tappTypeArray.join(','));
        //logDebug(tcapId.getCustomID());

        //see if any records are set up--module can be specific or "ALL", look for both
        var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", tappTypeArray[0]);
        if(sepScriptConfig.getSuccess()){
            var sepScriptConfigArr = sepScriptConfig.getOutput();
            if(sepScriptConfigArr.length<1){
                var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
                if(sepScriptConfig.getSuccess()){
                    var sepScriptConfigArr = sepScriptConfig.getOutput();
                }
            }
            if(sepScriptConfigArr.length>0){
                for(sep in sepScriptConfigArr){
                    var cfgCapId = sepScriptConfigArr[sep].getCapID();
                    var sepRules = loadASITable("APPLY DYNAMIC GUIDESHEET",cfgCapId);

                    if (sepRules) {
                        if(sepRules.length>0){
                            for(row in sepRules){
                                if(sepRules[row]["Active"]=="Yes"){
                                    var cInspType = ""+sepRules[row]["Inspection Type"];
    
                                    var appMatch = true;
                                    var excludeApp = false;
                                    var excludeInsp  = false;
                                    var customValid = true;
    
                                    var recdType = ""+sepRules[row]["Record Type"];
                                    var recdTypeArr = "" + recdType;
                                    var arrAppType = recdTypeArr.split("/");
    
                                    var exrecdType = ""+sepRules[row]["Exclude Record Type"];
                                    var exrecdTypeArr = "" + exrecdType;
                                    var exarrAppType = exrecdTypeArr.split(",");
    
                                    var exInspType = ""+sepRules[row]["Exclude Inspection Type"];
                                    var exInspTypeArr = "" + exInspType;
                                    var exarrInspType = exInspTypeArr.split(",");
    
                                    var guideType = ""+sepRules[row]["Include Guidesheet"];
                                    var guideTypeArr = "" + guideType;
                                    var arrGuideType = guideTypeArr.split(",");
    
                                    var cFld = ""+sepRules[row]["Custom Field Name"];
                                    var custFld = cFld.trim();
                                    var cVal = ""+sepRules[row]["Custom Field Value"];
                                    var custVal = cVal.trim();
    
                                    if (!matches(custFld,"",null,"undefined") && !matches(custVal,"",null,"undefined")) {
                                        if (getAppSpecific(custFld, tcapId) != custVal) {
                                            customValid = false;
                                        }
                                    }
    
                                    for(exType in exarrAppType) {
                                        exarrAppType[exType] = exarrAppType[exType].split("/");
                                    }
    
                                    if (arrAppType.length != 4){
                                        logDebug("The record type is incorrectly formatted: " + recdType);
                                        return false;
                                    }else{
                                        for (xx in arrAppType){
                                            if (!arrAppType[xx].equals(tappTypeArray[xx]) && !arrAppType[xx].equals("*")){
                                                appMatch = false;
                                            }
                                        }
    
                                        for (yy in exarrAppType) {
                                            if ((exarrAppType[yy][1] == tappTypeArray[1] || exarrAppType[yy][1] == '*') && (exarrAppType[yy][2] == tappTypeArray[2] || exarrAppType[yy][2] == '*') && (exarrAppType[yy][3] == tappTypeArray[3] || exarrAppType[yy][3] == '*')) {
                                                excludeApp = true;
                                            }
                                        }
    
                                        for (zz in exarrInspType) {
                                            if (exarrInspType[zz] == tinspType) {
                                                excludeInsp = true;
                                            }
                                        }
                                    }
                                    
                                    //var doThis = appMatch && !excludeApp && !excludeInsp && customValid && (cInspType == tinspType || cInspType == 'any' || cInspType == '');
                                    //logDebug('appmatch: ' + appMatch + ' excludeApp : ' + excludeApp + ' excludeInsp : ' + excludeInsp + ' customValid : ' + customValid);
                                    
                                    if(appMatch && !excludeApp && !excludeInsp && customValid && (cInspType == tinspType || cInspType == 'any' || cInspType == '')) {
                                        var tProxy = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness");
    
                                        if (tProxy.getSuccess()) {
                                            var tProxyOut = tProxy.getOutput();
                                            var inspIdInt = parseInt(tinspId);
                                            var guidesheets = tProxyOut.getGGuideSheetByInspectionID(tcapId,inspIdInt);
    
                                            if (guidesheets) {
                                                for (var j = 0; j < guidesheets.size(); j++) {
                                                    var removeGGD = true;
                                                    var tGuideSheet = guidesheets.get(j);
    
                                                    if (tGuideSheet) {
                                                        for (jj in arrGuideType) {
                                                            if (arrGuideType[jj] == tGuideSheet.getGuideType() || tGuideSheet.getGuideType().indexOf('Failed items') > -1) {
                                                                removeGGD = false;
                                                            }
                                                        }
    
                                                        if (removeGGD) {
                                                            //logDebug('Removing: ' + tGuideSheet.getGuideType());
                                                            var res = tProxyOut.removeGGuideSheet(tcapId,tinspId,tGuideSheet.getGuideType(),'ADMIN');
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
            }
        }
    }
        catch(err){
        logDebug("A JavaScript Error occurred: function doGuidesheetAutomation:  " + err.message);
        logDebug(err.stack)
    }
}
