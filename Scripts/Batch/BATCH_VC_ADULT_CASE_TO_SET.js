/*------------------------------------------------------------------------------------------------------/
| Assign Cases for Adulticiding v1.07
| 
| Case assignment batch script for Vector Control
| Richard Voller - 04/05/2019
| Updated        - 04/09/2019
| Richard Voller - 04/12/2019 - Updated to not run on weekends.
| Richard Voller - 08/28/2019 - Updated for script name change.
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
var cnt = 0;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var maxSeconds = 12*60;	// number of seconds allowed for batch processing, usually < 5*60
var message = "";								
var debug = "";									
var br = "<BR>";
var setCode = 'VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS'
var setType = 'VC Adulticide'
var setStatus = 'Ready to Process'
var sysDate = aa.date.getCurrentDate();
var compareNextWorkDay = nextWorkDay(dateAdd(null,-1));
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var cnwd = convertDate(compareNextWorkDay);
var currDate = convertDate(sysDateMMDDYYYY);
var aZone = 'Adulticide Zone 01' //Develop routine to get zone for each case
var AdultArray = new Array();
var theMembersArray = new Array();
todaysDate = sysDate.getMonth() + "/" + sysDate.getDayOfMonth() + "/" + sysDate.getYear();
var testing = false; 

if((currDate - cnwd) == 0) //condition that prevents the job from running on Weekends
{
		aa.set.removeSetHeader(setCode);  //remove the existing set members if the set exists so you start with a fresh Set.
		aa.set.createSet("VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS","VC_ADULTICIDING_NIGHTLY_ASSIGNMENTS","VC Adulticide","Populated 5:00 PM daily via batch script BATCH_VC_ADULT_CASE_TO_SET");
		// update set type and status
		setScriptResult = aa.set.getSetByPK(setCode);
		//aa.print(setScriptResult);
		if (setScriptResult.getSuccess())
		{
			setScript = setScriptResult.getOutput();
			setScript.setRecordSetType(setType);
			setScript.setSetStatus(setStatus);
			aa.print(setScript.getSetStatus());
			updSet = aa.set.updateSetHeader(setScript).getOutput();
		}
		//Get the cases for the Set
		AdultCases = aa.cap.getByAppType("EnvHealth","VC","Complaint","Adulticide");
			if(AdultCases.getSuccess())
				{
					AdultArray = AdultCases.getOutput(); //Puts VC cases in an array
		
					aa.print("Line 91. Searching through " + AdultArray.length + " cases.");
				}
					for(x in AdultArray)
					{
						//Uncomment below if a timeout is needed.
					/*if (elapsed() > maxSeconds) // only continue if time hasn't expired.  This is a time-out for the script if it runs long for some reason.
					{	 
						aa.print("Line 71. A script time-out has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.<br>");
						aa.print("Line 72. Looped through " + x + " records.<br>");
						timeExpired = true;
						break; 
					} */
					
					// This gets the CapID and the AltID (for readability)
						capObj = AdultArray[x]; //gets the cap object from each case
					var capId = capObj.getCapID(); //gets the capId which is the key to getting the case(cap)
					var altCapId = aa.cap.getCapID(capId.getID1(),capId.getID2(),capId.getID3()).getOutput(); //assembles the b1Permit_b1_altID
					var capIDModel = aa.cap.getCapIDModel(capId.getID1(),capId.getID2(),capId.getID3()).getOutput(); //needed to add the cap to the set
					var capIDString = altCapId.getCustomID();
					var capAddress = "";
					// This gets the Case Information, we are looking for the Case Status.
					cap = aa.cap.getCap(capId).getOutput();
					var capStatus = cap.getCapStatus();
					if (capStatus != null)
						if (!capStatus.equals("Received")) //Condition that requires the case status to be "Open".
							continue;
							cnt++;
			
					//This section gets the inspection information for the case and puts all scheduled inspections found on the case (there should only be one, but mistakes happen) in an array for interrogation.
						var inspResultObj = aa.inspection.getInspections(capId);
							if (inspResultObj.getSuccess())
							{
								var inspList = inspResultObj.getOutput();
								for (xx in inspList)
								{
									if (!inspList[xx].getInspectionStatus().equals("Scheduled"))
											continue;			
											var inspType = inspList[xx].getInspectionType();
											inspSchDate = inspList[xx].getScheduledDate().getMonth() + "/" + inspList[xx].getScheduledDate().getDayOfMonth() + "/" + inspList[xx].getScheduledDate().getYear();
												aa.print("Case: "+capIDString+" Dates: Scheduled - "+inspSchDate+", TodaysDate - "+todaysDate);
									//	if (String(inspSchDate).equals(todaysDate)) {
												aa.print("This Case would get added to the Set - "+capIDString);
										//Add the Case to the Set
										aa.set.addCapSetMember(setCode,capIDModel);
									//}
								}
							}
						}
}
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
// Do not add functions here!
//All functions must be added to the INCLUDES_CUSTOM library (the library where custom functions live).
