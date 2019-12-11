//lwacht: 181025: #126: Duplicate record
try{
	var arrCaps = capIdsGetByParcel(ParcelValidatedNumber);
	var fndPermInj = false;
	logDebug("arrCaps: " + arrCaps.length);
	for(par in arrCaps){
		var thisCapId = arrCaps[par];
		var tCap = aa.cap.getCap(thisCapId)
		if(tCap.getSuccess()){
			var thisCap = tCap.getOutput();
			var thisStatus = thisCap.getCapStatus();
			if (thisStatus=="Permanent Injunction" && !isTaskActive("Permanent Injunction")){
				//cancel = true;
				//12/11/2019 - Commented out the cancel as requested on the UAT Issues spreadsheet - item # 293
				showMessage = true;
				comment("This address has a permanent injunction (" + thisCapId.getCustomID() + "), which should be closed before another record can be opened.");
			}
		}else{
			logDebug("Error getting cap: " +tCap.getErrorMessage());
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASB:EnvHealth/Housing/*/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181016: #126: end
