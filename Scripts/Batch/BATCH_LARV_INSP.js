//aa.env.setValue("Zone", "Vector Zone 01,01,1");
//aa.env.setValue("inspZone", "1");
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LARV_INSP.js  Trigger: Batch
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
var checkZoneArray = getParam("Zone"); // Hardcoded dates.   Use for testing only
var inspZone = getParam("inspZone");
checkZoneArray = checkZoneArray.split(",");
var checkZone = "";
for(var z in checkZoneArray){
	if(checkZone != ""){
		checkZone += ",";
	}
	checkZone +="'" + String(checkZoneArray[z]).trim() + "'";
}
logDebug("checkZone=("+checkZone+")");


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
	var inspScheduled = 0;

	//Setup the Query for EnvHealth/VC/LarvicideSite/NA

	var oneYear = [];
	var twoYear = [];

	//var getCaps = aa.cap.getCapIDsByAppSpecificInfoField("Zone", checkZone);
	var date = new Date();
	var checkDate1 = dateAdd(date.setMonth(date.getMonth() - 12), 0);
	aa.print("One Year ago = " + checkDate1);
	var date = new Date();
	var checkDate2 = dateAdd(date.setMonth(date.getMonth() - 24), 0);
	aa.print("Two Years ago = " + checkDate2);

	//TODO: NEED TO CONFIRM SQL AND LIMIT RECORD
	var conn = new db();

	var sql = "SELECT a.b1_per_id1, a.b1_per_id2,a.b1_per_id3 FROM G6ACTION A " +
		"INNER JOIN B1PERMIT B1 ON A.SERV_PROV_CODE=B1.SERV_PROV_CODE AND A.B1_PER_ID1=B1.B1_PER_ID1 AND A.B1_PER_ID2=B1.B1_PER_ID2 AND A.B1_PER_ID3=B1.B1_PER_ID3 " +
		"INNER JOIN BCHCKBOX B ON A.SERV_PROV_CODE=B.SERV_PROV_CODE AND A.B1_PER_ID1=B.B1_PER_ID1 AND A.B1_PER_ID2=B.B1_PER_ID2 AND A.B1_PER_ID3=B.B1_PER_ID3 " +
		"WHERE A.SERV_PROV_CODE='{0}' and B.B1_CHECKBOX_DESC='Zone' and b.b1_checklist_comment in ({1}) " +
		"AND B1.B1_PER_GROUP='EnvHealth' and b1.b1_per_type='VC' and b1.b1_per_sub_type='LarvicideSite' and b1_per_category='NA' " +
		"AND TRUNC(G6_ACT_DD) = TO_DATE('{2}','MM/DD/YYYY') " +
		"and exists (SELECT 1 FROM gguidesheet G inner join ggdsheet_item_asi gi on g.serv_prov_code=gi.serv_prov_code and g.guidesheet_seq_nbr=gi.guidesheet_seq_nbr " +
			"where GI.asi_grp_nam='VC_LVCCKLST' AND GI.asi_subgrp_nam='LARVICIDE' and GI.ASI_NAME='Is Site Breeding' and GI.asi_comment='Yes' " +
			"and a.serv_prov_code=g.serv_prov_code and a.b1_per_id1=g.b1_per_id1 and a.b1_per_id2=g.b1_per_id2 and a.b1_per_id3=g.b1_per_id3 and a.g6_act_num=g.g6_act_num)";
	
	sql = sql.replace("{0}", String(aa.getServiceProviderCode()))
		.replace("{1}", String(checkZone))
		.replace("{2}", String(checkDate1));

	//logDebug(sql);
	var ds = conn.dbDataSet(sql, 25);
	for (var r in ds) {
		var tcapid = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"])).getOutput();
		oneYear.push(tcapid);
		logDebug("Found 1yr: " + tcapid.getCustomID());
	}
	if (oneYear.length < 25) {
		var sql = "SELECT a.b1_per_id1, a.b1_per_id2,a.b1_per_id3 FROM G6ACTION A " +
			"INNER JOIN B1PERMIT B1 ON A.SERV_PROV_CODE=B1.SERV_PROV_CODE AND A.B1_PER_ID1=B1.B1_PER_ID1 AND A.B1_PER_ID2=B1.B1_PER_ID2 AND A.B1_PER_ID3=B1.B1_PER_ID3 " +
			"INNER JOIN BCHCKBOX B ON A.SERV_PROV_CODE=B.SERV_PROV_CODE AND A.B1_PER_ID1=B.B1_PER_ID1 AND A.B1_PER_ID2=B.B1_PER_ID2 AND A.B1_PER_ID3=B.B1_PER_ID3 " +
			"WHERE A.SERV_PROV_CODE='{0}' and B.B1_CHECKBOX_DESC='Zone' and b.b1_checklist_comment  in ({1}) " +
			"AND B1.B1_PER_GROUP='EnvHealth' and b1.b1_per_type='VC' and b1.b1_per_sub_type='LarvicideSite' and b1_per_category='NA' " +
			"AND TRUNC(G6_ACT_DD) = TO_DATE('{2}','MM/DD/YYYY') " +
			"and exists (SELECT 1 FROM gguidesheet G inner join ggdsheet_item_asi gi on g.serv_prov_code=gi.serv_prov_code and g.guidesheet_seq_nbr=gi.guidesheet_seq_nbr " +
			"where GI.asi_grp_nam='VC_LVCCKLST' AND GI.asi_subgrp_nam='LARVICIDE' and GI.ASI_NAME='Is Site Breeding' and GI.asi_comment='Yes' " +
			"and a.serv_prov_code=g.serv_prov_code and a.b1_per_id1=g.b1_per_id1 and a.b1_per_id2=g.b1_per_id2 and a.b1_per_id3=g.b1_per_id3 and a.g6_act_num=g.g6_act_num)";
		sql = sql.replace("{0}", String(aa.getServiceProviderCode()))
			.replace("{1}", String(checkZone))
			.replace("{2}", String(checkDate2));
		var ds = conn.dbDataSet(sql, 25);
		for (var r in ds) {
			var tcapid = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"])).getOutput();
			twoYear.push(tcapid);
			logDebug("Found 2yr:" + tcapid.getCustomID());
		}
	}

	var inspUsr = lookup("GIS - Larvicide Techs", "Vector Zone " + String("00" + inspZone).substr(-2));

	for (var i in oneYear) {
		capId = oneYear[i];

		scheduleInspection("Larvicide", 0, inspUsr);
		inspScheduled++;
	}
	for (var i in twoYear) {
		if (inspScheduled >= 25) {
			break;
		}
		capId = twoYear[i];
		scheduleInspection("Larvicide", 0, inspUsr);
		inspScheduled++;
	}

	//logDebug("Total CAPS qualified date range: " + gc.length);
	logDebug("Ignored due to CAP Type: " + capFilterStatus);
	logDebug("Inspections Scheduled: " + inspScheduled);
	logDebug("Total CAPS processed: " + capCount);
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
			var ds = initialContext.lookup("java:/AA");
			var conn = ds.getConnection();
			var sStmt = conn.prepareStatement(sql);
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
			var ds = initialContext.lookup("java:/AA");
			var conn = ds.getConnection();
			var sStmt = conn.prepareStatement(sql);
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
			var ds = initialContext.lookup("java:/AA");
			var conn = ds.getConnection();
			var sStmt = conn.prepareStatement(sql);
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
