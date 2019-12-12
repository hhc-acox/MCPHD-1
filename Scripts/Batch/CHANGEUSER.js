/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_CHANGE_USER
| Client:  MCPHD
|
| Version 1.0 - Base Version. 
| Assigns records to a new user, assigns active workflow tasks to a new user and reschedules inspection to
| a new user.
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
/* test parameters  */
//aa.env.setValue("oldUserId", "ADMIN");
//aa.env.setValue("newUserId", "DQUATACKER");

var oldUserId =  getParam("oldUserId");
var newUserId = getParam("newUserId");


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


	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
	var ds = initialContext.lookup("java:/AA");
	var conn = ds.getConnection();

    // records
    var selectStringCap = "select b1_per_id1, b1_per_id2, b1_per_id3 from bpermit_detail where serv_prov_code = 'MCPHD' and b1_asgn_staff = ?";
    var sStmt = conn.prepareStatement(selectStringCap);
    sStmt.setString(1, oldUserId);
    var rSet = sStmt.executeQuery();
	capIdList = new Array();
    while (rSet.next()) {
        id1 = rSet.getString("b1_per_id1");
        id2 = rSet.getString("b1_per_id2");
        id3 = rSet.getString("b1_per_id3");
        capIdList.push(id1 + "-" + id2 + "-" + id3);
    }
    rSet.close();
    sStmt.close();
    logDebug(capIdList.length + " records to reassign");
    if (capIdList.length > 0) {
        for (var cIndex in capIdList) {
            capId = capIdList[cIndex];
            var capIdArr = capId.toString().split('-');
            capId = aa.cap.getCapID(capIdArr[0], capIdArr[1], capIdArr[2]).getOutput();
            if (capId) {
                assignCap(newUserId);
                logDebug("Assigned record " + capId.getCustomID() + " to " + newUserId);
            }
        }
    }

    // workflow tasks
    selectStringTask = "select b1_per_id1, b1_per_id2, b1_per_id3, sd_pro_des as taskname from gprocess where serv_prov_code = 'MCPHD' and sd_chk_lv1 = 'Y' and sd_chk_lv2 = 'N' and asgn_user_id = ?";
    var sStmt = conn.prepareStatement(selectStringTask);
    sStmt.setString(1, oldUserId);
    var rSet = sStmt.executeQuery();
	capIdList = new Array();
    while (rSet.next()) {
        id1 = rSet.getString("b1_per_id1");
        id2 = rSet.getString("b1_per_id2");
        id3 = rSet.getString("b1_per_id3");
        tName = rSet.getString("taskname");
        capIdList.push(id1 + "-" + id2 + "-" + id3 + "-" + tName);
    }
    rSet.close();
    sStmt.close();

    logDebug(capIdList.length + " tasks to reassign");
    if (capIdList.length > 0) {
        for (var cIndex in capIdList) {
            capId = capIdList[cIndex];
            var capIdArr = capId.toString().split('-');
            tName = capIdArr[3];
            capId = aa.cap.getCapID(capIdArr[0], capIdArr[1], capIdArr[2]).getOutput();
            if (capId) {
                assignTask(tName,newUserId);
                logDebug("Assigned task " + tName + " to " + newUserId);
            }
        }
    }

    // inspections 
    selectStringInsp = "select b1_per_id1, b1_per_id2, b1_per_id3, g6_act_num, g6_act_dd from g6action where serv_prov_code = 'MCPHD' and g6_act_grp = 'Inspection' and g6_doc_des = 'Insp Scheduled' and ga_userid = ?";
    var sStmt = conn.prepareStatement(selectStringInsp);
    sStmt.setString(1, oldUserId);
    var rSet = sStmt.executeQuery();
	capIdList = new Array();
    while (rSet.next()) {
        id1 = rSet.getString("b1_per_id1");
        id2 = rSet.getString("b1_per_id2");
        id3 = rSet.getString("b1_per_id3");
        inspId = rSet.getLong("g6_act_num");
        schDate = rSet.getDate("g6_act_dd");
        capIdList.push(id1 + "-" + id2 + "-" + id3 + "-" + inspId + "-" + schDate);
    }
    rSet.close();
    sStmt.close();

    logDebug(capIdList.length + " inspections to reschedule");
    if (capIdList.length > 0) {
        for (var cIndex in capIdList) {
            capId = capIdList[cIndex];
            var capIdArr = capId.toString().split('-');
            inspId = capIdArr[3];
            schDate = capIdArr[4] + "-" + capIdArr[5] + "-" + capIdArr[6];
            schDate = capIdArr[5] + "/" + capIdArr[6] + "/" + capIdArr[4];
            capId = aa.cap.getCapID(capIdArr[0], capIdArr[1], capIdArr[2]).getOutput();
            if (capId) {
               // iR = aa.inspection.getInspection(capId, inspId).getOutput();
                inspectionScriptModel = aa.inspection.getInspectionScriptModel().getOutput();
                inspectionModel = inspectionScriptModel.getInspection();
                activityModel = inspectionModel.getActivity();
                activityModel.setCapIDModel(capId);
                activityModel.setIdNumber(inspId);
                activityModel.setActivityDate(aa.date.transToJavaUtilDate(new Date(schDate)));
                activityModel.setCarryoverFlag("A"); // set carry over flag
                commentModel = inspectionModel.getRequestComment();
                commentModel.setText("rescheduled by emse");
                inspectionModel.setActivity(activityModel);
                inspectionModel.setRequestComment(commentModel);
                sysUserModel = aa.person.getUser(newUserId).getOutput();
                aa.print(sysUserModel);
                result = aa.inspection.reScheduleInspection(inspectionModel,sysUserModel);
                if(result.getSuccess()) {  
                    logDebug("Rescheduled inspection " + inspId + " to " + newUserId);
                    newInspId = result.getOutput();
                    assignInspection(newInspId, newUserId);
                }
                else {
                    logDebug("Failed to reschedule inspection " + inspId + " : " + result.getErrorMessage() );
                }
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
