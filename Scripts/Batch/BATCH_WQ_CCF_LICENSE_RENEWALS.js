/*------------------------------------------------------------------------------------------------------/
| Renewal Notices for CCF License v1.0
| 
| License Batch script for CCF - Runs from the Set when triggered by the user.
| Jake Cox - 03/04/2020
| 
| BATCH_WQ_CCF_LICENSE_RENEWALS
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
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS_ASB", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));
eval(getScriptText("INCLUDES_CUSTOM_GLOBALS", null, true));


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
var setCode = 'WQ_CCF_LICENSE_RENEWALS'
var setType = 'WQ CCF Create and Get License Renewals'
var setStatus = 'Ready to Process'
var sysDate = aa.date.getCurrentDate();
var compareNextWorkDay = nextWorkDay(dateAdd(null,-1));
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var cnwd = convertDate(compareNextWorkDay);
var currDate = convertDate(sysDateMMDDYYYY);
var BodyArtArray = new Array();
var theMembersArray = new Array();
todaysDate = sysDate.getMonth() + "/" + sysDate.getDayOfMonth() + "/" + sysDate.getYear();
var testing = false; 


		aa.set.removeSetHeader(setCode);  //remove the existing set members if the set exists so you start with a fresh Set.
		aa.set.createSet(setCode,setCode,"WQ_CCF","Populated by User via Batch Script");
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
		BodyArtCases = aa.cap.getByAppType("EnvHealth","WQ","Childcare","License");
			if(BodyArtCases.getSuccess())
				{
					BodyArtArray = BodyArtCases.getOutput(); //Puts VC cases in an array
		
					aa.print("Line 89. Searching through " + BodyArtArray.length + " cases.");
				}
					for(x in BodyArtArray)
					{

						capObj = BodyArtArray[x]; //gets the cap object from each case
					var capId = capObj.getCapID(); //gets the capId which is the key to getting the case(cap)
					var altCapId = aa.cap.getCapID(capId.getID1(),capId.getID2(),capId.getID3()).getOutput(); //assembles the b1Permit_b1_altID
					var capIDModel = aa.cap.getCapIDModel(capId.getID1(),capId.getID2(),capId.getID3()).getOutput(); //needed to add the cap to the set
					var capIDString = altCapId.getCustomID();
					var capAddress = "";
					// This gets the Case Information, we are looking for the Case Status.
					cap = aa.cap.getCap(capId).getOutput();
					var capStatus = cap.getCapStatus();
					if (capStatus != null)
						if (!capStatus.equals("Active")){ //Condition that requires the case status to be "Active".
							continue;
						}
						else{
							cnt++;
								aa.print(cnt+". Case successfully added to the Set - "+capIDString);
								hhcaddFee("WQC006","WQ_ChildCare","FINAL",1,"Y",capId);
								updateAppStatus("About to Expire","Updated by Batch",capId);
									  
									//Add the Case to the Set
						aa.set.addCapSetMember(setCode,capIDModel); }
	}
		set = "WQ_BODY_ART_LICENSE_RENEWALS";
		setScriptResult = aa.set.getSetByPK(set);
			//aa.print("setScriptResult - "+setScriptResult);
		setScript = setScriptResult.getOutput();
		setScript.setSetStatus("Processed");
			aa.print(setScript.getSetStatus());
			//aa.print("setStatus"+setStatus);
		updSet = aa.set.updateSetHeader(setScript).getOutput();
								
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
function hhcaddFee(fcode, fsched, fperiod, fqty, finvoice) // Adds a single fee, optional argument: fCap
{
	// Updated Script will return feeSeq number or null if error encountered (SR5112)
	var feeCap = capId;
	var feeCapMessage = "";
	var feeSeq_L = new Array(); // invoicing fee for CAP in args
	var paymentPeriod_L = new Array(); // invoicing pay periods for CAP in args
	var feeSeq = null;
	if (arguments.length > 5) {
		feeCap = arguments[5]; // use cap ID specified in args
		feeCapMessage = " to specified CAP";
	}

	assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
	if (assessFeeResult.getSuccess()) {
		feeSeq = assessFeeResult.getOutput();
		aa.print("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
		aa.print("The assessed fee Sequence Number " + feeSeq + feeCapMessage);

		if (finvoice == "Y" && arguments.length == 5) // use current CAP
		{
			feeSeqList.push(feeSeq);
			paymentPeriodList.push(fperiod);
			var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
			if (invoiceResult_L.getSuccess())
				logMessage("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			else
				logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
		}
		if (finvoice == "Y" && arguments.length > 5) // use CAP in args
		{
			feeSeq_L.push(feeSeq);
			paymentPeriod_L.push(fperiod);
			var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
			if (invoiceResult_L.getSuccess())
				logMessage("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			else
				logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
		}
		hhcupdateFeeItemInvoiceFlag(feeSeq, finvoice);
	} else {
		logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
		feeSeq = null;
	}

	return feeSeq;

}
 function hhcupdateFeeItemInvoiceFlag(feeSeq,finvoice)
{
	if(feeSeq == null){
		return;
	}
	else
	{
		var feeItemScript = aa.finance.getFeeItemByPK(capId,feeSeq);
		if(feeItemScript.getSuccess)
		{
			var feeItem = feeItemScript.getOutput().getF4FeeItem();
			feeItem.setAutoInvoiceFlag(finvoice);
			aa.finance.editFeeItem(feeItem);
		}
	}
}
