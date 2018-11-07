//lwacht: 181029: #166b: adding prorated fees
try{
/*lwacht: 181107: replacing with SWADDLE solution
	if(wfTask=="Application Intake" && wfStatus.indexOf("Accepted")>-1){
		if(appTypeArray[2]=="BodyArt"){
			updateFee("BDA0001", "WQ_BDA", "FINAL", 1, "Y");
		}else{
			if(appTypeArray[2]=="CC"){
				updateFee("WQC0001", "WQ_CC", "FINAL", 1, "Y");
			}
		}
	}else{
lwacht: 181107: end  */
		if(wfTask=="Plan Review" && wfStatus=="Plans Approved"){
			if(matches(appTypeArray[2],"BodyArt","CC")){
				if(appTypeArray[2]=="BodyArt"){
					if(sysDate.getMonth()>2 && sysDate.getMonth()<9){
						updateFee("BDA0003", "WQ_BDA", "FINAL", 1, "Y");
					}else{
						updateFee("BDA0002", "WQ_BDA", "FINAL", 1, "Y");
					}
				}
				if(appTypeArray[2]=="CC"){
					if(sysDate.getMonth()>2 && sysDate.getMonth()<9){
						updateFee("WQC0003", "WQ_CC", "FINAL", 1, "Y");
					}else{
						updateFee("WQC0002", "WQ_CC", "FINAL", 1, "Y");
					}
				}
			}
			if(matches(appTypeArray[2], "Pool")){
				if(sysDate.getMonth()>6 || sysDate.getMonth()<3){
					updateFee("WQP010", "WQ_POOL", "FINAL", 1, "Y");
				}else{
					if(AInfo["Pool License Type"]=="Annual"){
						updateFee("WQP003", "WQ_POOL", "FINAL", 1, "Y");
					}else{
						updateFee("WQP005", "WQ_POOL", "FINAL", 1, "Y");
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/WQ/* /Application: Fees: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181029: #166b: end
