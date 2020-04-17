/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LARVICIDE_SITES.js  
| Trigger: Batch
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

// params here

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
	var capCount = 0;

	//TODO: NEED TO CONFIRM SQL AND LIMIT RECORD
	var conn = new db();

	var sql = "SELECT DISTINCT b.b1_per_id1, b.b1_per_id2, b.b1_per_id3 FROM b1permit b INNER JOIN gguidesheet gd ON gd.b1_per_id1 = b.B1_PER_ID1 AND gd.b1_per_id2 = b.B1_PER_ID2 AND gd.b1_per_id3 = b.B1_PER_ID3 AND gd.serv_prov_code = b.serv_prov_code INNER JOIN g6action g6 ON g6.G6_ACT_NUM = gd.G6_ACT_NUM AND g6.b1_per_id1 = gd.B1_PER_ID1 AND g6.b1_per_id2 = gd.B1_PER_ID2 AND g6.b1_per_id3 = gd.B1_PER_ID3 AND g6.serv_prov_code = gd.serv_prov_code INNER JOIN gguidesheet_item gdi ON gdi.GUIDE_TYPE = gd.GUIDE_TYPE AND gdi.GUIDESHEET_SEQ_NBR = gd.GUIDESHEET_SEQ_NBR AND gdi.SERV_PROV_CODE = gd.SERV_PROV_CODE INNER JOIN ggdsheet_item_asi asi ON asi.GUIDESHEET_SEQ_NBR = gdi.GUIDESHEET_SEQ_NBR AND asi.SERV_PROV_CODE = gdi.SERV_PROV_CODE LEFT JOIN xapp2ref xb ON b.B1_PER_ID1 = xb.B1_PER_ID1 AND b.B1_PER_ID2 = xb.B1_PER_ID2 AND b.B1_PER_ID3 = xb.B1_PER_ID3 AND b.serv_prov_code = xb.serv_prov_code LEFT JOIN b1permit par ON par.B1_PER_ID1 = xb.B1_MASTER_ID1 AND par.B1_PER_ID2 = xb.B1_MASTER_ID2 AND par.B1_PER_ID3 = xb.B1_MASTER_ID3 AND par.serv_prov_code = xb.serv_prov_code WHERE gd.guide_type = 'VC_Larvicide' AND b.serv_prov_code = 'MCPHD' AND asi.asi_name = 'Is Site Breeding' AND asi.ASI_COMMENT IN ('Y', 'Yes') AND b.b1_per_sub_type = 'Complaint' AND b.b1_per_category = 'Larvicide' AND par.b1_per_sub_type IS NULL and g6.g6_status = 'Tech Complete - New Site'";
	
	//logDebug(sql);
	var ds = conn.dbDataSet(sql, 1000);
	for (var r in ds) {
        var tcapid = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"]));
        
        if(tcapid.getSuccess()){
            var tcapout = tcapid.getOutput();
            capId = tcapout;
            var tAInfo = tloadAppSpecific(capId);
            CreateSite(tcapout, tAInfo);
            capCount++;
        }
	}

	//logDebug("Total CAPS qualified date range: " + gc.length);
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

function CreateSite(capId, appSpecArr){
	try{
        //Create the Larvicide Site Case
        var newAppId = createParent('EnvHealth','VC','LarvicideSite','NA','');
        // Add Case and Data Fields Info
        tcopyAppSpecific(newAppId, appSpecArr);
        var aZone = getVectorZone(capId);

        var oldCapId = capId;
        capId = newAppId;

        logDebug(capId.getCustomID());

        copyParcelGisObjects4XAPO();
        var techByZone = lookup("GIS - Larvicide Techs",aZone); 

        var inspTime = null;
        var inspComm = "Scheduled via Script";
        var inspectorObj = null;
        var DateToSched = nextWorkDay(dateAdd(null,14));

        var inspRes = aa.person.getUser(techByZone);
        if (inspRes.getSuccess()){
            inspectorObj = inspRes.getOutput();
        }
    
        aa.inspection.scheduleInspection(newAppId, inspectorObj, aa.date.parseDate(DateToSched), inspTime, "Larvicide", inspComm)
        assignCap(techByZone, newAppId);
        
        //SET RECORD ID BASED ON ZONE
        var zone4cap = "00"; //default zone
        var tmpZone = "";
        if (appSpecArr["Zone"] != null && appSpecArr["Zone"] != "") {
            tmpZone = String(appSpecArr["Zone"]).replace(/\D/g, '').trim();
            logDebug("Using ASI Zone Info = " + tmpZone);
        }
        else {
            //if no ASI try GIS
            tmpZone = getGISInfo("MCPHD", "VectorZones", "vectorzone");
            logDebug("Using GIS Zone Info = " + tmpZone);
            tmpZone = String(tmpZone).replace(/\D/g, '').trim();
        }
        if (tmpZone != "") {
            if (!isNaN(tmpZone)) {
                tmpZone = String(parseInt(tmpZone, 10)); //strip the zeros
            }
            zone4cap = tmpZone;
            //zone4cap = zeroPad(zone4cap, 2);
        }

        var vc_conn = new db();
        var vc_sql = "SELECT SUBSTR(b.B1_ALT_ID, INSTR(b.B1_ALT_ID, '-' ,-1, 1) + 1) as B1_ALT_ID " +
            "FROM B1PERMIT b " + 
            "WHERE b.B1_ALT_ID like 'LVC-" + zone4cap + "-%' AND b.SERV_PROV_CODE = 'MCPHD'" + 
            "ORDER BY TO_NUMBER(SUBSTR(b.B1_ALT_ID, INSTR(b.B1_ALT_ID, '-' ,-1, 1) + 1)) DESC";
        var ds = vc_conn.dbDataSet(vc_sql, 100);
        var dsCapIdString = "0";
        
        if (ds[0]) {
            dsCapIdString = ds[0]["B1_ALT_ID"];
            logDebug('Using db-based naming: ' + dsCapIdString);
        } 
        var dsNewId = "0";

        if (dsCapIdString) {
            logDebug('Highest Seq: ' + parseInt(dsCapIdString));
            dsNewId = parseInt(dsCapIdString) + 1;

            if (dsNewId < 9) {
                dsNewId = '0' + dsNewId;
            }
        }
        if (dsNewId) {
            var newId = "LVC-" + zone4cap + "-" + dsNewId;
            logDebug("New ID " + newId);
            aa.cap.updateCapAltID(capId, newId);
        }

        logDebug('Created: ' + newId);
        logDebug('');

        capId = oldCapId;
    }
	catch(err)
	{
		logDebug("A JavaScript Error occurred: CreateSite:  " + err.message);
		logDebug(err.stack);
	}
}

function getVectorZone(capId){
	var vZone = "";
	var zoneNum = "";
	try{
		x = getGISInfo("MCPHD","VectorZone","vectorzone");
		zoneNum = x.toString();
		if (x<10){
		vZone = "Vector Zone 0"+zoneNum;
		}
		else
		{vZone = "Vector Zone "+zoneNum;}
			return vZone;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getVectorZone:  " + err.message);
		logDebug(err.stack);
	}
}

function copyParcelGisObjects4XAPO() {
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
	if (capParcelResult.getSuccess()) {
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels) {

			var uid = Parcels[zz].getUID();
			if(uid == null){
				logDebug("Warning: no XAPO Id found");
			} else {
				var ParcelValidatedNumber = uid.substr(uid.indexOf("$*$")+3);
				logDebug("XAPOID = " + ParcelValidatedNumber);
				var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
				if (gisObjResult.getSuccess())
					var fGisObj = gisObjResult.getOutput();
				else { logDebug("**WARNING: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()); return false }

				for (a1 in fGisObj) // for each GIS object on the Cap
				{
					var gisTypeScriptModel = fGisObj[a1];
					var gisObjArray = gisTypeScriptModel.getGISObjects()
					for (b1 in gisObjArray) {
						var gisObjScriptModel = gisObjArray[b1];
						var gisObjModel = gisObjScriptModel.getGisObjectModel();

						var retval = aa.gis.addCapGISObject(capId, gisObjModel.getServiceID(), gisObjModel.getLayerId(), gisObjModel.getGisId());

						if (retval.getSuccess()) { logDebug("Successfully added Cap GIS object: " + gisObjModel.getGisId()) }
						else { logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()); return false }
					}
				}
			}
		}
	}
	else { logDebug("**ERROR: Getting Parcels from Cap.  Reason is: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()); return false }
}

function tcopyAppSpecific(newCap, tAInfo) // copy all App Specific info into new Cap, 1 optional parameter for ignoreArr
{
	for (asi in tAInfo){
		//Check list
		editAppSpecific(asi,tAInfo[asi],newCap);
	}
}

function tloadAppSpecific(tcapId) {
	// 
	// Returns an associative array of App Specific Info
	// Optional second parameter, cap ID to load from
    //
    var arr = new Array();
	
    var itemCap = tcapId;
    
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
    {
    var fAppSpecInfoObj = appSpecInfoResult.getOutput();

    for (loopk in fAppSpecInfoObj)
        {
        if (useAppSpecificGroupName)
            arr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
        else
            arr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
        }
    }
    return arr;
}
