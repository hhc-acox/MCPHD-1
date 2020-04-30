/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_LVC_INSP_LAB
| Client:  MCPHD
|
| Version 1.0 - Base Version. 
|
| 
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var maxSeconds = 7 * 60;
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());


/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/



/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0,0,0,0);
var timeExpired = false;
var useAppSpecificGroupName = false;

var startTime = startDate.getTime();			// Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

mainProcess();

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");


if (showDebug) {
	aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(),"", emailText ,batchJobID);
}
//aa.print(emailText);
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
    var resultDate = sysDate;
    var resultComment = 'Updated by Script';

	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
	var ds = initialContext.lookup("java:/AA");
	var conn = ds.getConnection();

    // records
    var selectStringCap = "SELECT b.b1_per_id1, b.b1_per_id2, b.b1_per_id3, g6.g6_act_num FROM b1permit b INNER JOIN g6action g6 ON g6.B1_PER_ID1 = b.B1_PER_ID1 AND g6.B1_PER_ID2 = b.B1_PER_ID2 AND g6.B1_PER_ID3 = b.B1_PER_ID3 AND g6.SERV_PROV_CODE = b.SERV_PROV_CODE INNER JOIN gguidesheet gd ON gd.G6_ACT_NUM = g6.G6_ACT_NUM AND gd.SERV_PROV_CODE = g6.SERV_PROV_CODE INNER JOIN ggdsheet_item_asi asi ON asi.GUIDESHEET_SEQ_NBR = gd.GUIDESHEET_SEQ_NBR AND asi.SERV_PROV_CODE = gd.SERV_PROV_CODE WHERE b.b1_per_sub_type = 'LarvicideSite' AND b.serv_prov_code = 'MCPHD' AND g6.g6_status = 'Technician Complete' AND asi.ASI_NAME = 'Is Site Breeding' AND asi.asi_comment = 'Y'";
    var sStmt = conn.prepareStatement(selectStringCap);
    var rSet = sStmt.executeQuery();
	capIdList = new Array();
    while (rSet.next()) {
        id1 = rSet.getString("b1_per_id1");
        id2 = rSet.getString("b1_per_id2");
        id3 = rSet.getString("b1_per_id3");
        inspid = rSet.getString("g6_act_num");
        capIdList.push(id1 + "-" + id2 + "-" + id3 + "-" + inspid);
    }
    rSet.close();
    sStmt.close();
    logDebug(capIdList.length + " inspections to result");
    if (capIdList.length > 0) {
        for (var cIndex in capIdList) {
            capId = capIdList[cIndex];
            var capIdArr = capId.toString().split('-');
            inspId = capIdArr[3];
            capId = aa.cap.getCapID(capIdArr[0], capIdArr[1], capIdArr[2]).getOutput();
            if (capId) {
                aa.inspection.resultInspection(capId, inspId, 'Waiting on Lab', resultDate, resultComment, 'ADMIN');
                logDebug('Resulted: ' + inspId);
            }
        }
    }

}catch (err){
	logDebug("ERROR: " + err.message + " In " + batchJobName);
	logDebug("Stack: " + err.stack);
}}
	
/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function getCapIdByIDs(s_id1, s_id2, s_id3)  {
	var s_capResult = aa.cap.getCapID(s_id1, s_id2, s_id3);
    if(s_capResult.getSuccess())
		return s_capResult.getOutput();
    else
       return null;
}
