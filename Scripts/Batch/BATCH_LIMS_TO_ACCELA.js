/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LIMS_TO_ACCELA.js  
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

var urlLIMS = "https://208.88.104.180:95/api/LIMSUpdate/Update";

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
	var capFilterStatus = 0;
	var capCount = 0;
	var inspScheduled = 0;

    var caps = [];
	var inspections = [];

	//TODO: NEED TO CONFIRM SQL AND LIMIT RECORD
	var conn = new db();

	var sql = "SELECT b.b1_per_id1, b.b1_per_id2, b.b1_per_id3, g.G6_ACT_NUM FROM b1permit b INNER JOIN g6action g ON b.B1_PER_ID1 = g.B1_PER_ID1 AND b.B1_PER_ID2 = g.B1_PER_ID2 AND b.B1_PER_ID3 = g.B1_PER_ID3 AND b.SERV_PROV_CODE = g.SERV_PROV_CODE INNER JOIN gguidesheet gd ON gd.B1_PER_ID1 = g.B1_PER_ID1 AND gd.B1_PER_ID2 = g.B1_PER_ID2 AND gd.B1_PER_ID3 = g.B1_PER_ID3 AND gd.G6_ACT_NUM = g.G6_ACT_NUM AND gd.SERV_PROV_CODE = g.SERV_PROV_CODE INNER JOIN gguidesheet_item gi ON gi.GUIDESHEET_SEQ_NBR = gd.GUIDESHEET_SEQ_NBR AND gi.SERV_PROV_CODE = gd.SERV_PROV_CODE WHERE B1_PER_TYPE = 'WQ' AND gd.GUIDE_TYPE = 'Lab Samples' AND gi.GUIDE_ITEM_STATUS = 'Send to LIMS' AND b.SERV_PROV_CODE = 'MCPHD'";
	
	//logDebug(sql);
	var ds = conn.dbDataSet(sql, 100);
	for (var r in ds) {
        var tcapid = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"]));
        
        if(tcapid.getSuccess()){
            var tcapout = tcapid.getOutput();

            var inspResultObj = aa.inspection.getInspections(tcapout);
	
            if (inspResultObj.getSuccess())
            {
                var inspList = inspResultObj.getOutput();
                
                for (xx in inspList)
                {
                    if (inspList[xx].getIdNumber() == String(ds[r]["G6_ACT_NUM"]))
                    {
                        logDebug("Found inspection: " + inspList[xx].getIdNumber());

                        var inspModel = inspList[xx].getInspection();
                        var inspector = inspModel.getInspector();
                        var gs = inspModel.getGuideSheets()

                        if (gs)
                        {
                            for(var i=0;i< gs.size();i++) {
                                var guideSheetObj = gs.get(i);
                                if (guideSheetObj.getGuideType() == 'Lab Samples') {
                                    sendToLims(guideSheetObj, inspector);
                                }
                            }
                        } // if there are guidesheets
                        else
                        {
                            logDebug("No guidesheets for this inspection");
                        }
                    }
                }
            }

            caps.push(tcapout)
            logDebug("Found cap: " + tcapout.getCustomID());
        }
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

function sendToLims(guidesheet, currentUser){
    //send inspection data to LIMS
    try{
        if (guidesheet && "LAB SAMPLES" == guidesheet.getGuideType().toUpperCase()) {
            var thisCapId = guidesheet.capID;
            var tCapId = aa.cap.getCapID(thisCapId.ID1,thisCapId.ID2,thisCapId.ID3).getOutput();
            var tAltId = tCapId.getCustomID();
            var addResult = aa.address.getAddressByCapId(thisCapId);
            if (addResult.getSuccess()){
                var aoArray = addResult.getOutput();
            }else{ 
                logDebug("**ERROR: getting address by cap ID: " + addResult.getErrorMessage());
            }
            if (aoArray.length){ 
                var ao = aoArray[0]; 
            }else{
                logDebug("**WARNING: no address for comparison:");
            } 
            var fullAddress = [ao.getHouseNumberStart(),ao.getStreetDirection(),ao.getStreetName(),ao.getStreetSuffix(),,ao.getCity(),,ao.getState(),ao.getZip()].filter(Boolean).join(" ");
            var currUser = aa.person.getUser(currentUser).getOutput();
            var inspFullString = ""+currUser;
            var firstPos = inspFullString.lastIndexOf("/")+1;
            var lastPos = inspFullString.length;
            var inspName = inspFullString.substr(firstPos,lastPos);
            var dataJsonArray = [];
            var guidesheetItem = guidesheet.getItems();
            for(var j=0;j< guidesheetItem.size();j++) {
                var item = guidesheetItem.get(j);
                //logDebug("item.getGuideItemStatus(): " + item.getGuideItemStatus());
                var chkStatus = ""+item.getGuideItemStatus();
                if(chkStatus=="Send to LIMS"){
                //if(item.getGuideItemStatus()==item.getGuideItemStatus()){
                    var guideItemASITs = item.getItemASITableSubgroupList();
                    if (guideItemASITs!=null){
                        for(var l = 0; l < guideItemASITs.size(); l++){
                            var guideItemASIT = guideItemASITs.get(l);
                            //logDebug("guideItemASIT.getTableName(): " +guideItemASIT.getTableName());
                            if(guideItemASIT && "SAMPLE SUMMARY" == guideItemASIT.getTableName().toUpperCase()){
                                var tableArr = new Array();
                                var columnList = guideItemASIT.getColumnList();
                                for (var k = 0; k < columnList.size() ; k++ ){
                                    var column = columnList.get(k);
                                    var values = column.getValueMap().values();
                                    var iteValues = values.iterator();
                                    while(iteValues.hasNext())
                                    {
                                        var m = iteValues.next();
                                        var zeroBasedRowIndex = m.getRowIndex()-1;
                                        if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
                                        tableArr[zeroBasedRowIndex][column.getColumnName()] = m.getAttributeValue();
                                    }
                                }
                            }
                        }
                    }
                    //return tableArr;
                    for(row in tableArr){
                        var thisRow = tableArr[row];
                        //var limsReason = lookup("Sample_Reasons",""+tableArr[row]["Reason"]);
                        var limsReason = ""+tableArr[row]["Reason"];
                        if(matches(limsReason,null,false,"undefined")){
                            limsReason="Other";
                        }
                        var jsonResult = {
                            "SampleID": ""+tableArr[row]["SampleID"],
                            //"SampleID": "345987",
                            "SampleAddress": fullAddress,
                            "Reason": limsReason,
                            "SampleLocation": [""+tableArr[row]["Sample Location"],tableArr[row]["Other Sample Location"]].filter(Boolean).join(": "),
                            "FieldNotes": ""+tableArr[row]["Field Notes"],
                            "InspectorName": inspName,
                            "SampleType": ""+tableArr[row]["Sample Type"],
                            "InspectionID": ""+guidesheet.activityNumber,
                            "ChecklistID": ""+guidesheet.guidesheetSeqNbr,
                            "ChecklistItemID": ""+item.guideItemSeqNbr,
                            "RecordID": ""+tAltId
                        };
                        dataJsonArray.push(jsonResult);
                        //for(col in thisRow){
                        //	logDebug("Here: " + col + ": " + thisRow[col]);
                        //}
                    }
                    var nData = {
                        "Samples":  dataJsonArray
                    };
                    var nDataJson = JSON.stringify(nData);
                    logDebug("myJSON: " + nDataJson)							
                   
                    var postResp = httpClientPut(urlLIMS, nDataJson, 'application/json', 'utf-8');
                    if(postResp){
                        var theResp = postResp.getOutput();
                        if(theResp["resultCode"]=="200"){
                            item.setGuideItemStatus("In Lab");
                            var updateResult = aa.guidesheet.updateGGuidesheet(guidesheet,guidesheet.getAuditID());
                            if (updateResult.getSuccess()) {
                                logDebug("Successfully updated " + guidesheet.getGuideType() + ".");
                                showMessage=true;
                                comment("Data has been successfully sent to LIMS and the status updated to 'In Lab'.");
                            } else {
                                logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                            }
                        }else{
                            showMessage=true;
                            comment("Error sending data to LIMS. Please correct: " + theResp["result"]);
                        }						
                    }else{
                        showMessage=true;
                        comment("Error sending data to LIMS. This may be due to a timeout from LIMS.");
                    }
                }
            }
        }
    }catch (err){
        logDebug("A JavaScript Error occurred: " + err.message);
        logDebug(err.stack);
    } 
}
