/*------------------------------------------------------------------------------------------------------/
| Assign Cases and Inspections for Adulticiding v1.09
| 
| This Script is executed by the user on the Set named "VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS"

| Case assignment batch script for Vector Control
| Richard Voller - 04/05/2019   New
| Richard Voller - 04/09/2019   Updated based on requirements gathering.
| Richard Voller - 04/10/2019   Added functionality to set Case Status to "Assigned".  Changed Set status to "Processed" if successful.
| Richard Voller - 11/21/2019   Changed Inspection from "Adulticide Inspection" to "Adulticide" because checklist is associated with "Adulticide".
| Jake Cox       - 02/24/2020   Various Fixes
| HHC - CIS
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var documentOnly = false;						// Document Only -- displays hierarchy of std choice steps

/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0

eval(getScriptText("INCLUDES_BATCH", null, true));
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));


function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
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
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
showDebug = false;
showMessage = false;
var maxSeconds = 12*60;	// number of seconds allowed for batch processing, usually < 5*60
var message = "";								
var debug = "";									
var br = "<BR>";
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"")
//var aZone = 'Adulticide Zone 01' //Develop routine to get zone for each case
//var testing = false; 
var assignTech = "";
var setStatus = "Processed";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
useAppSpecificGroupName = true;

/*------------------------------------------------------------------------------------------------------/
|
| <===========Main=Loop================>
|
/------------------------------------------------------------------------------------------------------*/
//if (paramsOK){
    logMessage("START","Start of Assign Aduliticide Inspections Set Script.");
    //Get count of records updated
    var updatedRecordsCount = AssignAdulticideInspections();
    //Message to Log output
    logMessage("INFO","Total Inspections Assigned: " + updatedRecordsCount + ".");
    logMessage("INFO","End of assignment script");

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function AssignAdulticideInspections(){
    var count = 0;
    //Get the cases from the set
    var set = "VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS";
    var SetMembers= aa.set. getCAPSetMembersByPK(set);

    if(SetMembers.getSuccess()){
        var SetMemberArray = SetMembers.getOutput();
        /*
        var setScriptResult = aa.set.getSetByPK(set);
        //aa.print("setScriptResult - "+setScriptResult);
        var setScript = setScriptResult.getOutput();
        setScript.setSetStatus("Processed");
        aa.print(setScript.getSetStatus());
        //aa.print("setStatus"+setStatus);
        var updSet = aa.set.updateSetHeader(setScript).getOutput();
        */
        aa.print('Records to process: ' + SetMemberArray.size());

        //SetMemberArray.size()
        for(var i=0; i < SetMemberArray.size(); i++)  {
            capId = SetMemberArray.get(i);
            aa.print('PROCESSING: ' + capId);

            //copyParcelGisObjects();
            var aZone = getAdulticideZone(capId);
            aa.print("ZONE: "+aZone);
            if(aZone){
                assignTech = lookupLOCAL("GIS - Adulticide Techs", aZone);
                aa.print('TECH: ' + assignTech);
                if (assignTech && assignTech != null && assignTech != "") {
                    
                    if (checkInspectionResult("Adulticide", "Scheduled") == true) { 
                        var inspNum=getScheduledInspId("Adulticide");
                        assignInspection(inspNum, assignTech);
                        assignCap(assignTech);
                        updateAppStatus("Assigned");
                        editAppSpecific("Zone",aZone);
                        aa.print('ASSIGNED ' + inspNum + ' TO ' + assignTech);
                        count++;
                    }
                }
            }
            aa.print('');    
        }
    }

    return count;
}

if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
	}
else
	{
	aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", message);
//	if (showDebug) 	aa.env.setValue("ScriptReturnMessage", debug);
	}
/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

function lookupLOCAL(stdChoice,stdValue)  {
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);

	if (bizDomScriptResult.getSuccess())	{
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		if (bizDomScriptObj.getAuditStatus() == "A")
			strControl = "" + bizDomScriptObj.getDescription(); 
		else
			message += "<FONT color='RED'>lookup(" + stdChoice + "," + stdValue + ") is inactive</FONT>" + br;
	}
	else {
		message += "<FONT color='RED'>lookup(" + stdChoice + "," + stdValue + ") does not exist</FONT>" + br;
	}
	return strControl;
}
