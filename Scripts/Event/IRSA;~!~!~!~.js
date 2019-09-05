//Actions created from Inspections
//Applied to IRSA:*/*/*/*
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
			if(sepScriptConfig.getSuccess()){
				var sepScriptConfigArr = sepScriptConfig.getOutput();
			}
		}
		if(sepScriptConfig.length>0){
			for(sep in sepScriptConfig){
				var cfgCapId = sepScriptConfig[sep].getCapID();
				var sepFees = loadASITable("ACTIONS FROM INSPECTIONS",cfgCapId);
				if(sepFees.length>0){
					sepUpdateFees(sepFees);
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:*/*/*/*: Actions from Inspections: " + err.message);
	logDebug(err.stack)
}

try{
	HHC_doInspectionActions();
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:*/*/*/*: Inspection Actions: " + err.message);
	logDebug(err.stack)
}
