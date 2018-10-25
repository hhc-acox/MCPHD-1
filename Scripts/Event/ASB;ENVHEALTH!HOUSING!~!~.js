//lwacht: 181025: #126: Duplicate record
try{
	logDebug("ParcelValidatedNumber : " + ParcelValidatedNumber);
	var arrCaps = capIdsGetByParcel(ParcelValidatedNumber);
	var fndPermInj = false;
	for(par in arrCaps){
		var thisCapId = arrCaps[par];
		var thisCap = aa.cap.getCap(thisCapId).getOutput();
		var thisStatus = cap.getCapStatus();
		if (thisStatus=="Permanent Injuction"){
			cancel = true;
			showMessage = true;
			comment("This address has a permanent injunction (" + thisCapId + "), which must be closed before another record can be opened.");
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASB:EnvHealth/Housing/*/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181016: #126: end