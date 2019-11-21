/*------------------------------------------------------------------------------------------------------/
| Assign Cases and Inspections for Adulticiding v1.09
| 
| This Script is executed by the user on the Set named "VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS"

| Case assignment batch script for Vector Control
| Richard Voller - 04/05/2019   New
| Richard Voller - 04/09/2019   Updated based on requirements gathering.
| Richard Voller - 04/10/2019   Added functionality to set Case Status to "Assigned".  Changed Set status to "Processed" if successful.
| Richard Voller - 11/21/2019   Changed Inspection from "Adulticide Inspection" to "Adulticide" because checklist is associated with "Adulticide".
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
var showDebug = false;
var showMessage = false;
var maxSeconds = 12*60;	// number of seconds allowed for batch processing, usually < 5*60
var message = "";								
var debug = "";									
var br = "<BR>";
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"")
//var aZone = 'Adulticide Zone 01' //Develop routine to get zone for each case
var testing = false; 
var assignTech = "";
var setStatus = "Processed";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
useAppSpecificGroupName = true;

//Get the cases from the set
if (testing) {
	SetMemberArray = new Array();
	SetMemberArray.push("ADC19-00003");
	set = "VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS";
}
else {
	var SetMemberArray= aa.env.getValue("SetMemberArray");
	var setID = aa.env.getValue("SetID");
	set = "VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS";
		setScriptResult = aa.set.getSetByPK(set);
			//aa.print("setScriptResult - "+setScriptResult);
		setScript = setScriptResult.getOutput();
		setScript.setSetStatus("Processed");
			aa.print(setScript.getSetStatus());
			//aa.print("setStatus"+setStatus);
		updSet = aa.set.updateSetHeader(setScript).getOutput();
				}
for(var i=0; i < SetMemberArray.length; i++)  {
	var id= SetMemberArray[i];
		if (testing)
			capId=aa.cap.getCapID(id).getOutput();
		else 
			capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();
	var capIDString = capId.getCustomID();
		copyParcelGisObjects();
	var aZone = getAdulticideZone(capId);
	aa.print("the zone: "+aZone);
		message += "Processing " + capIDString + br;
		assignTech = lookupLOCAL("GIS - Adulticide Techs", aZone);
		if (assignTech && assignTech != null && assignTech != "") {
			
		if (checkInspectionResult("Adulticide", "Scheduled") == true) { 
			inspNum=getScheduledInspId("Adulticide");
			assignInspection(inspNum, assignTech);
			assignCap(assignTech);
			updateAppStatus("Assigned");
			editAppSpecific("Zone",aZone);
		
			}
		}
	}aa.print("the zone: "+aZone);	
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

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


