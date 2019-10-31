/*------------------------------------------------------------------------------------------------------/
| Set Script - Food Establishment Renewal
| 
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
var message = "";								
var debug = "";									
var br = "<BR>";
var sysDate = aa.date.getCurrentDate();

var SetMemberArray= aa.env.getValue("SetMemberArray");
var setID = aa.env.getValue("SetID");


try {
    // set is created by user. Contains active food license records
    for (var i=0; i < SetMemberArray.length; i++) {
        var id= SetMemberArray[i];
        capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();
        var capIDString = capId.getCustomID();	

        //testing....
        //var appNum ="FOOD19-210146"; 
        //var capIdObj = aa.cap.getCapID(appNum);
        //capId = capIdObj.getOutput();
        //capIDString = capId.getCustomID();
        updateAppStatus("About to Expire");
        
        eType = getAppSpecific("Type of Establishment", capId);
        if (matches(eType, "Caterer", "Little League", "School", "Shared Kitchen", "Tavern", "Restaurant")) {
        	numEmp = getAppSpecific("Number of Persons Employed DD", capId)
        	if (numEmp == "0-9" || numEmp == "0 - 9") {
        		feeSeq = addFee("FS0001", "FS_GENERAL", "FINAL", 1, "N");
        		invoiceOneNow(feeSeq, "FINAL", capId);
        	}
        	if (numEmp == "10-40" || numEmp == "10 - 40") {
        		feeSeq = addFee("FS0002", "FS_GENERAL", "FINAL", 1, "N");
        		invoiceOneNow(feeSeq, "FINAL", capId);
        	}
        	if (numEmp == "40+" || numEmp == "40 +") {
        		feeSeq = addFee("FS0003", "FS_GENERAL", "FINAL", 1, "N");
        		invoiceOneNow(feeSeq, "FINAL", capId);
        	}
        }
        if (matches(eType, "Bakery", "Commissary", "Farmers Market Commissary", "Grocery")) {
        	sqFt = getAppSpecific("Total Square Feet of the Facility DD", capId);
        	if (sqft == "0-3,000") {
        		feeSeq = addFee("FS0004", "FS_GENERAL", "FINAL", 1, "N");
        		invoiceOneNow(feeSeq, "FINAL", capId);
        	}
        	if (sqft == "3,000-30,000") {
        		feeSeq = addFee("FS0005", "FS_GENERAL", "FINAL", 1, "N");
        		invoiceOneNow(feeSeq, "FINAL", capId);
        	}
        	if (sqft == "30,001-40,000") {
        		feeSeq = addFee("FS0006", "FS_GENERAL", "FINAL", 1, "N");
        		invoiceOneNow(feeSeq, "FINAL", capId);
        	}
        	if (sqft == "40,001-60,000") {
        		feeSeq = addFee("FS0007", "FS_GENERAL", "FINAL", 1, "N");
        		invoiceOneNow(feeSeq, "FINAL", capId);
        	}
        	if (sqft == "60,001+") {
        		feeSeq = addFee("FS0008", "FS_GENERAL", "FINAL", 1, "N");
        		invoiceOneNow(feeSeq, "FINAL", capId);
        	}
        }
        if (eType == "Limited Service School") {
        	feeSeq = addFee("FS0008", "FS_GENERAL", "FINAL", 1, "N");
    		invoiceOneNow(feeSeq, "FINAL", capId);
        }
        runReportAttach(capId, "Food Application Annual Renewal", "CaseNumber", capIDString)

    }
}
catch (err) {
    logDebug("Exception processing set members " + err)
}
