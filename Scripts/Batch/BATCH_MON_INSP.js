/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_MON_INSP.js  Trigger: Batch
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
    var capCount = 0;


    //Setup the Query for EnvHealth/VC/MonitorSite/NA
    var cm = aa.cap.getCapModel().getOutput();
    cm.getCapType().setGroup("EnvHealth");
    cm.getCapType().setType("VC");
    cm.getCapType().setSubType("MonitorSite");
    cm.getCapType().setCategory("NA");
    //cm.setCapStatus("Active");


    var getCaps = aa.cap.getCapListByCollection(cm, null, null, null, null, null, []);
    if (getCaps.getSuccess()) {
        var gc = getCaps.getOutput();
        for (x in gc) {
            capId = gc[x].getCapID();
            cap = aa.cap.getCap(capId).getOutput();
            capStatus = cap.getCapStatus();
            if (!matches(String(capStatus), "Active", "Site Active")) {
                capFilterStatus++;
            }

            logDebug("Found>" + capId.getCustomID());
            //disable next area except for when testing, limits to a single record
            /*
            if (String(capId.getCustomID()) != "MON-01-01") {
                continue;
            }
            
            if(capCount > 5){
                break;
            }
           */

            var conn = new db();
            var sql = "SELECT G6_ACT_NUM FROM G6ACTION WHERE SERV_PROV_CODE='{0}' AND B1_PER_ID1='{1}' AND B1_PER_ID2='{2}' AND B1_PER_ID3='{3}' ORDER BY G6_COMPL_DD DESC";
            sql = sql.replace("{0}", String(aa.getServiceProviderCode()))
                .replace("{1}", String(capId.getID1()))
                .replace("{2}", String(capId.getID2()))
                .replace("{3}", String(capId.getID3()));
            var ds = conn.dbDataSet(sql, 1);

            var lastInsp = null;
            if (ds.length) {
                lastInsp = parseInt(ds[0]["G6_ACT_NUM"], 10);
                logDebug("Found " + lastInsp);
            }


            if (lastInsp == null) {
                logDebug("No prior inspection");
                continue;
            }

            //scheduleInspection("Monitor Site",0) ;
            var checkZone = getAppSpecific("Zone", capId);
            var inspectorObj = null;
            if (checkZone != null && checkZone != 'null') {
                var inspUser = lookup("GIS - Larvicide Techs", "Vector Zone " + String("00" + checkZone).substr(-2));
                var inspRes = aa.person.getUser(String(inspUser))
                if (inspRes.getSuccess()) {
                    inspectorObj = inspRes.getOutput();
                    logDebug("Found Inspector Zone " + checkZone + " " + inspUser);
                }
            }
            if(inspectorObj == null){
                logDebug("No Inspector found will be unassgiend");
            }


            var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(dateAdd(null, 0)), null, "Monitor Site", "");
            var inspNumber = null;
            if (schedRes.getSuccess()) {
                inspNumber = parseInt(schedRes.getOutput(), 10);
                logDebug("Scheduled " + inspNumber);
            }
            else{
                logDebug("Could not Schedule Inspection");
                continue;
            }


            //copy from the old one
            //var newInsp = aa.inspection.getInspection(capId, inspNumber).getOutput();//getInspectionWithGuideSheets(capId, inspNumber);
            //var capId = aa.cap.getCapID("MON-01-01").getOutput();

            var copyList = {
                "LIGHT TRAP": "TRAP ID",
                "BGS TRAP": "TRAP ID",
                "GRAVID TRAP": "TRAP ID",
                "ATTRACTANT TUB": "Attractant Tub ID",
                "RAIN GAUGE": "Rain Gauge ID"
            }

            var tblArr = {};
            for (var t in copyList) {
                //logDebug("Initialize " + t);
                tblArr[t] = new Array();
            }

            // using first guidesheet item (index = 0)
            var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
            var qf = new com.accela.aa.util.QueryFormat();
            var gs = gsb.getGGuideSheetWithItemsByInspectID(capId, lastInsp,qf);
            if (gs == null) {
                logDebug("No Guidsheets to copy");
                continue;
            }
            var gsa = gs.result.toArray();
            if (gsa.length < 1) {
                logDebug("No Guideitems to copy");
                continue;
            }
            var dg = gsa[0];      // assume one guidesheet
            var guidesheetItem = dg.getItems().toArray();
            var item = guidesheetItem[0];
            logDebug("Found Item " + item.getGuideItemText());
            var gio = new guideSheetObject(dg, item);
            gio.loadInfoTables();
            for (var t in gio.infoTables) {
                var table = gio.infoTables[t];
                //logDebug("t = " + t);
                for (var r in table) {
                    var row = table[r];
                    //logDebug("r=" + r);

                    if (String(row[copyList[String(t)]]) != null && String(row[copyList[String(t)]]) != "") {
                        var tval = new Object();
                        //logDebug("Found Value=" + String(row[copyList[String(t)]]));
                        tval[copyList[String(t)]] = String(row[copyList[String(t)]]);
                        tblArr[String(t)].push(tval);
                    }
                }
            }

            for (var t in tblArr) {
                var table = tblArr[t];
                if (table.length > 0) {
                    //add them
                    var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
                    var qf = new com.accela.aa.util.QueryFormat();
                    var gs = gsb.getGGuideSheetWithItemsByInspectID(capId, inspNumber,qf);
                    if (gs == null) {
                        logDebug("No Guidsheets to copy");
                        continue;
                    }
                    var gsa = gs.result.toArray();
                    if (gsa.length < 1) {
                        logDebug("No Guideitems to copy");
                        continue;
                    }
                    var dg = gsa[0];      // assume one guidesheet
                    var guidesheetItem = dg.getItems().toArray();
                    var item = guidesheetItem[0];
                    //logDebug("Found Item " + item.getGuideItemText());
                    addToGASIT(item, t, table);
                }
            }
            capCount++;
        }
    }

    logDebug("Total CAPS qualified date range: " + gc.length);
    logDebug("Total CAPS skipped due to status " + capFilterStatus);
    logDebug("Total CAPS processed: " + capCount);
}



function getInspectionWithGuideSheets(pcap, pnbr) {
    var insps = aa.inspection.getInspections(pcap).getOutput();
    // using second inspection (index = 1)
    var d = null;
    for (var i in insps) {
        if (pnbr == insps[i].getIdNumber())
            return insps[i];
    }
    return null;
}

function addToGASIT(gsi, pTableName, pArrayToAdd) {
    var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
    //logDebug("**GUIDESHEET ITEM: " + gsi.getGuideItemText());
    var gsAsitGrpList = gsi.getItemASITableSubgroupList();
    if (gsAsitGrpList != null) {
        for (var j = 0; j < gsAsitGrpList.size(); j++) {
            var guideItemASIT = gsAsitGrpList.get(j);
            // dumpObj(guideItemASIT);
            var cASIGroup = guideItemASIT.getGroupName();
            var tableArr = new Array();
            if (guideItemASIT.getTableName() == pTableName) {
                var newColumnList = guideItemASIT.getColumnList();
                for (var k = 0; k < newColumnList.size(); k++) {
                    if (!updateComplete) // right column but row not found create a new row.
                    {
                        aa.print("Creating new entry in column");
                        var column = newColumnList.get(k);
                        //logDebug("Column " + column.getColumnName());
                        for (l = 0; l < pArrayToAdd.length; l++) {
                            var cValueMap = column.getValueMap();
                            var newColumn = new com.accela.aa.inspection.guidesheet.asi.GGSItemASITableValueModel;
                            var pReadOnly = "F";
                            //logDebug(pArrayToAdd[l][column.getColumnName()]);
                            newColumn.setColumnIndex(j);
                            newColumn.setRowIndex(l);
                            newColumn.setAttributeValue((pArrayToAdd[l][column.getColumnName()] == null || pArrayToAdd[l][column.getColumnName()] == 'undefined' ? "" : pArrayToAdd[l][column.getColumnName()]));
                            newColumn.setAuditDate(new java.util.Date());
                            newColumn.setAuditID("ADMIN");
                            cValueMap.put(l, newColumn);
                        }
                    }
                }
                var updateComplete = true;
            }
        }
    }
    if (updateComplete) {
        //logDebug("updating");
        gsb.updateGuideSheetItem(gsi, "ADMIN");
    }
}



function guideSheetObject(gguidesheetModel, gguidesheetItemModel) {
    this.gsType = gguidesheetModel.getGuideType();
    this.gsSequence = gguidesheetModel.getGuidesheetSeqNbr();
    this.gsDescription = gguidesheetModel.getGuideDesc();
    this.gsIdentifier = gguidesheetModel.getIdentifier();
    this.item = gguidesheetItemModel;
    this.text = gguidesheetItemModel.getGuideItemText()
    this.status = gguidesheetItemModel.getGuideItemStatus();
    this.comment = gguidesheetItemModel.getGuideItemComment();
    this.score = gguidesheetItemModel.getGuideItemScore();
    this.statusGroup = gguidesheetItemModel.getGuideItemStatusGroupName();
    this.resultType = aa.guidesheet.getStatusResultType(aa.getServiceProviderCode(), this.statusGroup, this.status).getOutput();
    this.info = new Array();
    this.infoTables = new Array();
    this.validTables = false;				//true if has ASIT info
    this.validInfo = false;				//true if has ASI info


    this.loadInfo = function () {
        var itemASISubGroupList = this.item.getItemASISubgroupList();
        //If there is no ASI subgroup, it will throw warning message.
        if (itemASISubGroupList != null) {
            this.validInfo = true;
            var asiSubGroupIt = itemASISubGroupList.iterator();
            while (asiSubGroupIt.hasNext()) {
                var asiSubGroup = asiSubGroupIt.next();
                var asiItemList = asiSubGroup.getAsiList();
                if (asiItemList != null) {
                    var asiItemListIt = asiItemList.iterator();
                    while (asiItemListIt.hasNext()) {
                        var asiItemModel = asiItemListIt.next();
                        this.info[asiItemModel.getAsiName()] = asiItemModel.getAttributeValue();
                    }
                }
            }
        }


    }

    this.loadInfoTables = function () {

        var guideItemASITs = this.item.getItemASITableSubgroupList();
        if (guideItemASITs != null)
            for (var j = 0; j < guideItemASITs.size(); j++) {
                var guideItemASIT = guideItemASITs.get(j);
                var tableArr = new Array();
                var columnList = guideItemASIT.getColumnList();
                for (var k = 0; k < columnList.size(); k++) {
                    var column = columnList.get(k);
                    var values = column.getValueMap().values();
                    var iteValues = values.iterator();
                    while (iteValues.hasNext()) {
                        var i = iteValues.next();
                        var zeroBasedRowIndex = i.getRowIndex() - 1;
                        if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
                        tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue()
                    }
                }

                this.infoTables["" + guideItemASIT.getTableName()] = tableArr;
                this.validTables = true;
            }
    }
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
