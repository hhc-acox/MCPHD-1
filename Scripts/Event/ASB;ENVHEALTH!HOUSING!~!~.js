//lwacht: 181025: #126: Duplicate record
try{
	cancel = true;
	var arrCaps = capIdsGetByParcel(ParcelValidatedNumber);
	var fndPermInj = false;
	logDebug("arrCaps: " + arrCaps.length);
	for(par in arrCaps){
		var thisCapId = arrCaps[par];
		var tCap = aa.cap.getCap(thisCapId)
		if(tCap.getSuccess()){
			var thisCap = tCap.getOutput();
			var thisStatus = thisCap.getCapStatus();
			logDebug("thisCapId: " + thisCapId.getCustomID());
			logDebug("thisStatus: " + thisStatus);
			if (thisStatus=="Permanent Injuction"){
				cancel = true;
				showMessage = true;
				comment("This address has a permanent injunction (" + thisCapId.getCustomID() + "), which must be closed before another record can be opened.");
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