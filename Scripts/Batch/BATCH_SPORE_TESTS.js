/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_SPORE_TESTS
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
/* test parameters  */
//aa.env.setValue("oldUserId", "KTUCKER3");
//aa.env.setValue("newUserId", "KTUCKER");

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
    var today = new Date();
    var eom = new Date(today.getFullYear(), today.getMonth()+1, 21);
    var endOfNextMonth = eom.getMonth() + 1 + '/' + eom.getDate() + '/' + eom.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
	var ds = initialContext.lookup("java:/AA");
	var conn = ds.getConnection();

    // records
    var selectStringCap = "select b.b1_per_id1, b.b1_per_id2, b.b1_per_id3 from b1permit b where b.serv_prov_code = 'MCPHD' and b.b1_per_sub_type = 'Body Art' and b.B1_PER_CATEGORY = 'License'";
    var sStmt = conn.prepareStatement(selectStringCap);
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
    logDebug(capIdList.length + " Licenses to update");
    if (capIdList.length > 0) {
        for (var cIndex in capIdList) {
            capId = capIdList[cIndex];
            var capIdArr = capId.toString().split('-');
            capId = aa.cap.getCapID(capIdArr[0], capIdArr[1], capIdArr[2]).getOutput();
            if (capId) {
                logDebug(capId.getCustomID());              

                var wfTask = aa.workflow.getTask(capId, 'Routine Inspection'); // Get wfTask
                
                if(wfTask.getSuccess()) {
                    var wfOut = wfTask.getOutput();
                    
                    if(wfOut.disposition == 'Active') {
                        var asiValue = getAppSpecific('Spore Tests Required', capId);
                        //aa.print("asiValue: " + asiValue);
                        if (asiValue == 'Yes' || asiValue == 'Y') {
                            //logDebug(monthNames[eom.getMonth()] + ' ' + eom.getFullYear() + '-' + endOfNextMonth);

                            var dateText = monthNames[eom.getMonth()] + ' ' + eom.getFullYear();
                            var rowVals = new Array();
                            rowVals["Name"] = new asiTableValObj("Name", dateText, "N");
                            rowVals["Date Due"] = new asiTableValObj("Date Due", endOfNextMonth, "N");
                            rowVals["Date Received"] = new asiTableValObj("Date Received", '', "N");
                            rowVals["Result"] = new asiTableValObj("Result", '', "N");
                            rowVals["Attachment Name"] = new asiTableValObj("Attachment Name", '', "N");

                            addToASITable('SPORE TESTS', rowVals, capId);
                        }
                        
                    }
                }
                logDebug(''); 
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
