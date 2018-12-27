//send notifications
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfigArr = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
		}
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepNotifList = loadASITable("NOTIFICATIONS - WORKFLOW",cfgCapId);
				for(row in sepNotifList){
					if(sepNotifList[row]["Active"]=="Yes"){
						sepEmailNotifContact(sepNotifList[row]["Record Type"], sepNotifList[row]["Contact Type"], sepNotifList[row]["Respect Preferred Channel"], sepNotifList[row]["Notification Name"], sepNotifList[row]["Report Name"], sepNotifList[row]["Task Name"], sepNotifList[row]["Task Status"], getAppSpecific("Agency From Email",cfgCapId), sepNotifList[row]["Additional Query"]);
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:*/*/*/*: Send Notifications: " + err.message);
	logDebug(err.stack)
}
//assess fees
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfigArr = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
		}
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepFees = loadASITable("FEES - WORKFLOW",cfgCapId);
				if(sepFees.length>0){
					sepUpdateFees(sepFees);
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:*/*/*/*: Assess Fees: " + err.message);
	logDebug(err.stack)
}

//issue license
try{
	sepIssueLicenseWorkflow();
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:*/*/*/*: Issue license: " + err.message);
	logDebug(err.stack)
}
