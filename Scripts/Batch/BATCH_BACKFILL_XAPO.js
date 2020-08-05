/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_BACKFILL_XAPO.js  Trigger: BATCH
| Description: This script is designed to be run in Accela - Batch Engine to backfill XAPO provided data to fix XAPO timeouts
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
var useCustomScriptFile = true; // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM

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
    var numToProcess = 100;
    var countTotal = 0;
    var countProcessed = 0;
    var countCTUpdated = 0;
    var recordAssigned = 0;
    var inspectionsAssigned = 0;
    var asiUpdated = 0;
    var differentEHS = 0;
    var wfReassigned = 0;
    // get all capids
    var conn = new db();
    var sql = "select distinct b.b1_per_id1, b.b1_per_id2, b.b1_per_id3 from b1permit b inner join b3parcel b3 on b3.B1_PER_ID1 = b.B1_PER_ID1 and b3.B1_PER_ID2 = b.B1_PER_ID2 and b3.B1_PER_ID3 = b.B1_PER_ID3 and b3.SERV_PROV_CODE = b.SERV_PROV_CODE where b.serv_prov_code = 'MCPHD' and b.b1_per_type = 'Housing' and b3.b1_census_tract is null and b.b1_appl_status NOT IN ('Finaled', 'Closed/Fees Outstanding', 'Closed') and b.rec_date > att_to_date('04/19/2020')";
    var ds = conn.dbDataSet(sql, numToProcess);
    // foreach cap in capid list
    for (var r in ds) {
        //while(recordsProcessed < numToProcess) {
        //var r = recordsProcessed;
        var s_capResult = aa.cap.getCapID(String(ds[r]["B1_PER_ID1"]), String(ds[r]["B1_PER_ID2"]), String(ds[r]["B1_PER_ID3"]));

        if (s_capResult.getSuccess()) {
            var tCapId = s_capResult.getOutput();
            capId = tCapId;
            cap = aa.cap.getCap(capId).getOutput();
            //exploreObject(tCapId);
            //newVal = String(ds[r]["ASIVAL"]);

            if (cap && capId) {
                //editAppSpecificNoLog('Event Name', newVal);
                logDebug('Attempting to Update: ' + capId.getCustomID());
                updateRefParcelToCap();
                var TInfo = new Array();
                tloadParcelAttributes(TInfo);
                var censusTract = TInfo['ParcelAttribute.CensusTract'];

                if (censusTract && censusTract != '') {
                    var currentVal = getAppSpecific('Census Tract');

                    if (!currentVal || currentVal == '') {
						editAppSpecific('Census Tract', censusTract, capId);
						logDebug('Updated ASI Census Tract');
                        countCTUpdated++;
                    }

                    censusTract = getAppSpecific('Census Tract');

                    var inspector = lookup('Census - Housing EHS', censusTract);

                    if (inspector && inspector != '') {
                        var currentAssigned = getAssignedToRecord();

                        if (!currentAssigned || currentAssigned == '') {
							assignCap(inspector);
							logDebug('Assigned CAP');
                            recordAssigned++;
                        }

                        var currentASIInspector = getAppSpecific('Assigned To');

                        if (!currentASIInspector || currentASIInspector == '') {
							editAppSpecific('Assigned To', inspector, capId);
							logDebug('Updated ASI Assigned To');
                            asiUpdated++;
                        }

                        var inspResultObj = aa.inspection.getInspections(capId);

                        var inspectionExists = false;

                        if (inspResultObj.getSuccess()) {
                            var inspList = inspResultObj.getOutput();
                            for (xx in inspList) {
                                if (inspList[xx].getDocumentDescription() == 'Insp Scheduled') {
                                    inspectionExists = true;
                                    var inspAssigned = inspList[xx].getInspector();

                                    if (!inspAssigned || inspAssigned == '') {
                                        var inspId = inspList[xx].getIdNumber();
                                        assignInspection(inspId, inspector);
                                        inspectionsAssigned++;
                                    }
                                }
                            }
                        }

                        if (!inspectionExists) {
                            scheduleInspectDate("Initial Inspection", nextWorkDay(), inspector);
                        }
                    }

                    renameFullAddress();
                }
                logDebug('');
                countProcessed++;
            }
        }
    }
    logDebug('Processed: ' + countProcessed);
    logDebug('Census Tract Updated: ' + countCTUpdated);
    logDebug('Record Assigned: ' + recordAssigned);
    logDebug('Assigned To Updated: ' + asiUpdated);
    logDebug('Inspections Assigned: ' + inspectionsAssigned);
    //logDebug('Updated: ' + countTotal);
    //logDebug('Different EHS: ' + differentEHS);
    //logDebug('WF Reassigned: ' + wfReassigned);
    logDebug('');
}

function db() {
    this.version = function() {
        return 1.0;
    }

    /**
     * Executes a sql statement and returns rows as dataset
     * @param {string} sql 
     * @param {integer} maxRows 
     * @return {string[]}
     */
    this.dbDataSet = function(sql, maxRows) {
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
        } catch (err) {
            throw ("dbDataSet: " + err);
        }
        return dataSet;
    }

    /**
     * Executes a sql statement and returns nothing
     * @param {string} sql 
     */
    this.dbExecute = function(sql) {
        try {
            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup("java:/AA");
            var conn = ds.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(1);
            var rSet = sStmt.executeQuery();
            rSet.close();
            conn.close();
        } catch (err) {
            throw ("deExecute: " + err);
        }
    }

    /**
     * Returns first row first column of execute statement
     * @param {string} sql
     * @returns {object}  
     */
    this.dbScalarExecute = function(sql) {
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
        } catch (err) {
            throw ("dbScalarValue: " + err);
        }
        return out;
    }
    return this;
}

function lookupNoLog(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        //logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    } else {
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

    if (!cdScriptObj) {
        return false;
    }

    cd = cdScriptObj.getCapDetailModel();

    iNameResult = aa.person.getUser(assignId);

    if (!iNameResult.getSuccess()) {
        return false;
    }

    iName = iNameResult.getOutput();

    cd.setAsgnDept(iName.getDeptOfUser());
    cd.setAsgnStaff(assignId);

    cdWrite = aa.cap.editCapDetail(cd)
}

function editAppSpecificNoLog(itemName, itemValue) // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;

    var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap, itemName, itemValue, itemGroup);
}

function getAssignedToRecord() {
    try {
        cap = aa.cap.getCapDetail(capId).getOutput();
        var capAssignPerson = cap.getAsgnStaff();
        return capAssignPerson;
    } catch (err) {
        logDebug("A JavaScript Error occurred: getAssignedToRecord:  " + err.message);
        logDebug(err.stack);
    }
}

function assignInspectionNoLog(iNumber, iName) {
    // optional capId
    // updates the inspection and assigns to a new user
    // requires the inspection id and the user name
    // V2 8/3/2011.  If user name not found, looks for the department instead
    //

    var itemCap = capId
    if (arguments.length > 2)
        itemCap = arguments[2]; // use cap ID specified in args

    iObjResult = aa.inspection.getInspection(itemCap, iNumber);
    if (!iObjResult.getSuccess()) {
        logDebug("**WARNING retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage());
        return false;
    }

    iObj = iObjResult.getOutput();

    iInspector = aa.person.getUser(iName).getOutput();

    if (!iInspector) // must be a department name?
    {
        var dpt = aa.people.getDepartmentList(null).getOutput();
        for (var thisdpt in dpt) {
            var m = dpt[thisdpt]
            if (iName.equals(m.getDeptName())) {
                iNameResult = aa.person.getUser(null, null, null, null, m.getAgencyCode(), m.getBureauCode(), m.getDivisionCode(), m.getSectionCode(), m.getGroupCode(), m.getOfficeCode());

                if (!iNameResult.getSuccess()) {
                    logDebug("**WARNING retrieving department user model " + iName + " : " + iNameResult.getErrorMessage());
                    return false;
                }

                iInspector = iNameResult.getOutput();
            }
        }
    }

    if (!iInspector) {
        logDebug("**WARNING could not find inspector or department: " + iName + ", no assignment was made");
        return false;
    }

    //logDebug("assigning inspection " + iNumber + " to " + iName);

    iObj.setInspector(iInspector);

    if (iObj.getScheduledDate() == null) {
        iObj.setScheduledDate(sysDate);
    }

    aa.inspection.editInspection(iObj)
}

function tloadParcelAttributes(thisArr) {
    //
    // Returns an associative array of Parcel Attributes
    // Optional second parameter, cap ID to load from
    //

    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    var fcapParcelObj = null;
    var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
    if (capParcelResult.getSuccess())
        var fcapParcelObj = capParcelResult.getOutput().toArray();
    else
        logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage())

    for (i in fcapParcelObj) {
        parcelAttrObj = fcapParcelObj[i].getParcelAttribute().toArray();
        for (z in parcelAttrObj)
            thisArr["ParcelAttribute." + parcelAttrObj[z].getB1AttributeName()] = parcelAttrObj[z].getB1AttributeValue();

        // Explicitly load some standard values
        thisArr["ParcelAttribute.Block"] = fcapParcelObj[i].getBlock();
        thisArr["ParcelAttribute.Book"] = fcapParcelObj[i].getBook();
        thisArr["ParcelAttribute.CensusTract"] = fcapParcelObj[i].getCensusTract();
        thisArr["ParcelAttribute.CouncilDistrict"] = fcapParcelObj[i].getCouncilDistrict();
        thisArr["ParcelAttribute.ExemptValue"] = fcapParcelObj[i].getExemptValue();
        thisArr["ParcelAttribute.ImprovedValue"] = fcapParcelObj[i].getImprovedValue();
        thisArr["ParcelAttribute.InspectionDistrict"] = fcapParcelObj[i].getInspectionDistrict();
        thisArr["ParcelAttribute.LandValue"] = fcapParcelObj[i].getLandValue();
        thisArr["ParcelAttribute.LegalDesc"] = fcapParcelObj[i].getLegalDesc();
        thisArr["ParcelAttribute.Lot"] = fcapParcelObj[i].getLot();
        thisArr["ParcelAttribute.MapNo"] = fcapParcelObj[i].getMapNo();
        thisArr["ParcelAttribute.MapRef"] = fcapParcelObj[i].getMapRef();
        thisArr["ParcelAttribute.ParcelStatus"] = fcapParcelObj[i].getParcelStatus();
        thisArr["ParcelAttribute.SupervisorDistrict"] = fcapParcelObj[i].getSupervisorDistrict();
        thisArr["ParcelAttribute.Tract"] = fcapParcelObj[i].getTract();
        thisArr["ParcelAttribute.PlanArea"] = fcapParcelObj[i].getPlanArea();
    }
}
