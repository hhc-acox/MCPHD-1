/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_HOUSING_PI_DUE_EMAIL.js       
| Trigger: Batch 
| Client : Health and Hospital Corporation (HHC)
| Author : Richard Voller
|                                                                       
| Version 0.1 - Base Version -	06/15/2015
| Version 0.2 - Revision submitted on 05/11/2016 
| Version 2.0 - Revised script for MCPHD Cloud Implementation on 08/23/2019
|
| Notes: This program finds all records in Housing case types that have a case status of "Permanent Injunction".  
|        It loops through these records and finds the cases that have a reinspection scheduled in 7 days 
|        from the current date.
| 	     It sends an email to the scheduled inspector, their Team Leader, Lynne Lynch and Tim McMillan 
|        announcing the upcoming inspection (reminder).
| Update: Fixed issue when the employee is no longer active (retired) and their email is no longer
|         in the HHEmail table.
|         Lara Morgan now receives email notifications when the employee is no longer active (retired).
|
| Batch: Runs Daily at 06:00					
/------------------------------------------------------------------------------------------------------*/
/* END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));


function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
	return emseScript.getScriptText() + "";
}

/*------------------------------------------------------------------------------------------------------/
| Batch Testing Variables				
/------------------------------------------------------------------------------------------------------*/
var mynum = 7;  //number of days to notify before scheduled inspection is due.
/*------------------------------------------------------------------------------------------------------/
|
| START USER CONFIGURABLE PARAMETERS
|
|
/------------------------------------------------------------------------------------------------------*/
var showMessage = true;			// Set to true to see results in pop-up window
var showDebug = true;				// Set to true to see debug messages in pop-up window
var maxSeconds = 12*60;				// number of seconds allowed for batch processing, usually < 5*60
var emailText = "";
/*----------------------------------------------------------------------------------------------------/
|
| END USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailAddress = "" + aa.env.getValue("emailAddress");	// email to send report
var ccAddress = "" + aa.env.getValue("ccAddress");	// email to send report
var batchJobName = "" + aa.env.getValue("BatchJobName");	// Name of the batch job
var lynneEmailAddress = "llynch@marionhealth.org";
var timEmailAddress = "TMcMillan@MarionHealth.org";
var laraEmailAddress = "lmorgan@MarionHealth.org";
/*----------------------------------------------------------------------------------------------------/
|
| END BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var message = "";
var startDate = new Date();
var startTime = startDate.getTime();			// Start timer
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = hhcdateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"MM-DD-YYYY");
var timeExpired = false;
var batchJobID = aa.batchJob.getJobID().getOutput();
var br = "<BR>";				
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
| 
/-----------------------------------------------------------------------------------------------------*/
//The following statements declare variables and collect the cases in an array.

//logMessage("---------------------------------------------<br>");

logMessage("Start Date "+ startDate + br +" Start Time: "+startTime+ br);  

// start a counter to count cases and the emails to be sent, create array to hold record info for TRA and HSG cases.
cnt = 0;
ecnt = 0;
var oneDay = 1000 * 60 * 60 * 24;
var traArray = new Array();
var hsgArray = new Array();

logMessage("69. "+mynum+" days from now is = " + dateAddSaturday(null,+mynum)+ br);  //provides the target date as a point of reference when reading the log.

piDueResultTRA = aa.cap.getCaps("Housing","Final Processing","Permanent Injunction",""); //Update to look for All PI cases

if(piDueResultTRA.getSuccess())
{
	//aa.print("got to here");
	traArray = piDueResultTRA.getOutput(); //Puts TRA cases in an array
}

aa.print("86. Searching through " + traArray.length + " cases.  Elapsed Time : " + elapsed() + " Seconds <br>"); //reveals how many cases are involved in the log.

//The following for loop interrogates the cases for the needed conditions and extracts the needed information from each case.

for(x in traArray)
	{
	if (elapsed() > maxSeconds) // only continue if time hasn't expired.  This is a time-out for the script if it runs long for some reason.
	{	 
		logMessage("94. A script time-out has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.<br>");
		logMessage("95. Looped through " + x + " records.<br>");
		timeExpired = true;
		break; 
	}
	// This gets the CapID and the AltID (for readability)
	
	capObj = traArray[x];
	var capId = capObj.getCapID();
	var altCapId = aa.cap.getCapID(capId.getID1(),capId.getID2(),capId.getID3()).getOutput();
	var capIDString = altCapId.getCustomID();
	var capAddress = "";
	
	// This gets the Case Information, we are looking for the Case Status.
	cap = aa.cap.getCap(capId).getOutput();
	var capStatus = cap.getCapStatus();
	if (capStatus != null)
		if (!capStatus.equals("Permanent Injunction")) //Condition that requires the case status to be Permanent Injunction.
			continue;
cnt++;

	//This section gets the parcel information from the case.  We need the Census Tract to determine the Team Leader for the Case.
			var eCensusTract = hhc_getTheCensusTract(capId)
			var inspectorByCT = lookup("Census - Housing EHS",eCensusTract); 
	//This section gets the address information for the case and puts it together in a logical, readable format. 	
			capAddress = hhc_getTheAddress(capId)
		
	//This section gets the inspection information for the case and puts all scheduled reinspections found on the case (there should only be one,    but mistakes happen) in an array for interrogation.
			var inspResultObj = aa.inspection.getInspections(capId);
				if (inspResultObj.getSuccess())
				{
					var inspList = inspResultObj.getOutput();
					for (xx in inspList)
					{
						if (!inspList[xx].getInspectionStatus().equals("Scheduled"))
							continue;			
							var sendInsEmail=false;
							var inspType = inspList[xx].getInspectionType();
							var inspectorID = inspList[xx].getInspector();
							var inspTypeString = inspectorID.toString();				// Convert Inspector path to string
							var inspTypeArray = inspTypeString.split("/");			// Array of Inspector path parts string
							var inspectorName = inspTypeArray[6];					//  Gets the name of the EHS
							var deptName = inspTypeArray[3];						//  Gets the department from where the inspection came
			
							if(deptName == "HOUSING")
							{
								var inspectorByCT = lookup("Census - Housing EHS",eCensusTract); 
								if (inspectorByCT == null || inspectorByCT == "")
								{
									inspectorByCT = "LMORGAN";
								}
							}
							else if(deptName == "LEAD")
							{
								var inspectorByCT = lookup("Census - Lead EHS",eCensusTract); 
							}
							aa.print("151. inspTypeString - "+inspTypeString+" - "+eCensusTract);
			
					// This gets the EHS's email from the HHemail Standard Choices table	
							var EHSemail = getEHSemailByUserID(inspectorByCT);
				
					// This gets the Team Leader's email 
							var TLemail = getTeamLeaderEmail(deptName,eCensusTract);

							if (inspType.equals("Reinspection")) //if there is one, otherwise skip this case/email
								{
					//gets the inspection's scheduled date and formats it for easy reading.
								var inspSchedDate = convertDate(inspList[xx].getScheduledDate()); 
								var inspSchedDateFormatted = hhcdateFormatted(inspList[xx].getScheduledDate().getMonth(),inspList[xx].getScheduledDate().getDayOfMonth(),inspList[xx].getScheduledDate().getYear(),"MM/DD/YYYY");
				
					aa.print("165. "+cnt+". "+capIDString+" - "+eCensusTract+" - "+inspectorByCT+" - "+inspectorName+" - "+""+" - Scheduled Inspection Date is "+inspSchedDateFormatted);
				
							if (inspSchedDate) //if there is a date it will move forward, otherwise skip this case/email.
								{	
								difference_days = Math.abs(inspSchedDate.getTime() - startTime); //difference between today and the scheduled inspection date in milliseconds.
								
								daysToPI = Math.round(difference_days/oneDay);  //rounding the milliseconds and converting to days
								daysToPI = daysToPI+1;
					logMessage("172. "+"*****The EHS Email is - "+EHSemail+" and the Team Leader email is - "+TLemail+".  The PI is due in  "+daysToPI+" days"+br+br); 
									
							if (daysToPI != mynum) //Condition to send email, scheduled reinspection must be exactly 7 days in the future for email to be sent.
								{
									continue;
								}
									else
								{
									ecnt++; //counts email as sent.
									sendInsEmail = true; //OK to send email
																		
					aa.print("176. "+"Case Number "+ capIDString + " has a " + inspType + " Scheduled for " + inspectorName + " on "+ inspSchedDateFormatted + " which is " + daysToPI + " days from today.");
						
					logMessage("A Permanent Injunction inspection for "+capAddress+" with case number "+capIDString + " is due in " + daysToPI + " days for " +inspectorName+ " on " + inspSchedDateFormatted+". " + br);
					
					aa.print("180. "+EHSemail+", "+sendInsEmail+br);
						
						if(sendInsEmail)
						{
					logMessage("Sending email to "+EHSemail+" and "+TLemail + br);
						
					aa.sendMail(laraEmailAddress, EHSemail, TLemail,"A Permanent Injunction Inspection is Due in "+daysToPI+" Days.", inspectorName+","+br+br+"A Permanent Injunction inspection for "+capAddress+" with case number "+capIDString+" is due in "+daysToPI+" days for you on "+inspSchedDateFormatted+". "+ br+br+"If you have questions about this inspection please see your Team Leader"+br+br+"Sincerely,"+br+br+"Accela's Automated Email Distribution");					
						
					logMessage("Sending email to "+lynneEmailAddress+" and "+timEmailAddress + br);
						
					aa.sendMail(laraEmailAddress, lynneEmailAddress, timEmailAddress,"A Permanent Injunction Inspection is Due in "+daysToPI+" Days.", "Tim and Lynne,"+br+br+"A Permanent Injunction inspection for "+capAddress+" with case number "+capIDString+" is due in "+daysToPI+" days for " +inspectorName+ " on "+inspSchedDateFormatted+"."+br+br+"  An email has been sent to "+EHSemail+" and "+TLemail+" notifying them of this inspection.  "+br+br+"Sincerely,"+br+br+"Accela's Automated Email Distribution");					
					
					var myemailText = "A Permanent Injunction inspection for "+capAddress+" with case number "+capIDString+" is due in "+daysToPI+" days for " +inspectorName+ " on "+inspSchedDateFormatted+"."+br+br+"  An email has been sent to "+EHSemail+" and "+TLemail+" notifying them of this inspection.  "+br+br+"Sincerely,"+br+br+"Accela's Automated Email Distribution"
					
					aa.sendMail(laraEmailAddress, laraEmailAddress, laraEmailAddress, "Results of the Batch Processing", myemailText);					
					
						}
					}
				}
			}
		}		
	}
}

logMessage("End of Job: Elapsed Time : " + elapsed() + " Seconds" + br);

if (sendInsEmail) 
{
	emailText = "The batch " + batchJobName + " - has been processed, below are the results:"+ br + emailText;
	aa.sendMail("rvoller@hhcorp.org", "rvoller@hhcorp.org", "rvoller@hhcorp.org", "Results of the Batch Processing", emailText);
}
aa.print("211. "+"Total number of records processed "+cnt);
aa.print("212. "+"Total number of emails sent "+ecnt);
function hhcdateFormatted(pMonth,pDay,pYear,pFormat)
{
	var mth = "";
	var hday = "";
	var ret = "";
	if (pMonth > 9)
		mth = pMonth.toString();
	else
		mth = "0"+pMonth.toString();

	if (pDay > 9)
		hday = pDay.toString();
	else
		hday = "0"+pDay.toString();

	if (pFormat=="YYYY-MM-DD")
		ret = pYear.toString()+"-"+mth+"-"+hday;
	else
		ret = ""+mth+"/"+hday+"/"+pYear.toString();
	return ret;
}
function dateAddSaturday(td, amt) {
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	if (!td)
		dDate = new Date();
	else
		dDate = new Date(td);
	var i = 0;
	while (i < Math.abs(amt)) {
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
		if (dDate.getDay() > 0)
			i++
	}
	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}
function getEHSemailByUserID(inspectorByCT)
{
	//aa.print("383. EHSUserID:: " + inspectorByCT);
		
	var inspectorEmail = null;
		if(inspectorByCT != null)
		{
			var inspectorID2 = aa.person.getUser(inspectorByCT).getOutput();
			if(inspectorID != null)
					{
						var	inspTypeArray2 = inspectorID2.toString().split("/");			// Array of Inspector path parts string
						var inspectorName2 = inspTypeArray2[6];
						var deptName2 = inspTypeArray2[2];
						var ESemail = "" + lookup("HHemail",inspectorName);  //Inspector's name on the scheduled inspection.
						var ESemail2 = "" + lookup("HHemail",inspectorName2);  	//inspector assigned to this census tract (not being used).  
					}															//keeping ESemail2 to use in the future.  As of 03/17/2016, Lara Morgan wants all cases to go to her if the inspector on the inspection is wrong.
					else
					// If all else fails, send it to me.
					{ESemail = "" + laraEmailAddress;}
			if(ESemail == "undefined" || ESemail == null)
				{
				//logDebug("EHS email for (" + inspectorName + ") does not exist");
				ESemail = "" + lookup("HHemail","Lara Morgan");
				{inspectorEmail = ESemail;}
				}
				else
				{inspectorEmail = ESemail;}
		}
		else
		{
		inspectorEmail = laraEmailAddress;
		}
		aa.print("413. deptName2: " + deptName2);
		//aa.print("414. inspectorName from CT: " + inspectorEmail+" "+inspectorEmail);
		//aa.print("415. inspectorName from Insp: " + inspectorName+" "+inspectorName);
return inspectorEmail;
}
function getTeamLeaderEmail(deptName,eCensusTract)
{
	if (deptName == "NA")  //deptName will be "NA" if the employee's department is HHC-RET (retired), this accomodates the situation.
		{
			var TLByCT = lookup("Census - Team Leader",eCensusTract);
			var TLid2 = aa.person.getUser(TLByCT).getOutput();
			if(TLid2 != null)
		{
			var	inspTypeArray2 = TLid2.toString().split("/");			// Array of Inspector path parts string
			var TLName2 = inspTypeArray2[6];
			var deptName2 = inspTypeArray2[3];
			deptName = deptName2;
		}
	else
		{deptName = "HOUSING"}
		}
			
	if (deptName == "HOUSING")
		{
		var TLid = lookup("Census - Team Leader",eCensusTract);
		}
	else if (deptName == "LEAD")
		{
		var TLid = "dfries"
		}
// A less fancy way to get the Team Leader's email.
		var TLemail = "";
	if (TLid == "SCRUM")
		{TLemail = "" + "scrum@marionhealth.org";}
			else if(TLid == "JGONYOU")
		{TLemail = "" + "jgonyou@marionhealth.org";}
			else if(TLid == "DWEBSTER")
		{TLemail = "" + "DWebster@MarionHealth.org";}
			else if(TLid == "BWEHRMEI")
		{TLemail = "" + "BWehrmeister@MarionHealth.org";}
			else if(TLid == "PPARKER")
		{TLemail = "" + "pwparker@marionhealth.org";}
			else if(TLid == "TDEWELL")
		{TLemail = "" + "TDewell@MarionHealth.org";}
			else if(TLid == "PPIPHER")
		{TLemail = "" + "ppipher@marionhealth.org";}
			else if(TLid == "dfries")
		{TLemail = "" + "dfries@marionhealth.org";}
			else if(TLid == "AWHITMIR")
		{TLemail = "" + "awhitmire@marionhealth";}
			else 
		{TLemail = "" + laraEmailAddress;} // If the Census Tract is null or wrong, this is the catch-all.
		//	aa.print("456. TLemail: " + TLemail);
			return TLemail;
}