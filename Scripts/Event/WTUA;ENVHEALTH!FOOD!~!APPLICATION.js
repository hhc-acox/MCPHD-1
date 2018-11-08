/*lwacht: 181107: replacing with SWADDLE solution
//lwacht: 181029: #166b: adding prorated fees
try{
	if(wfTask=="Application Intake" && wfStatus.indexOf("Accepted")>-1){
		if(wfStatus == "Accepted" && AInfo["Non Profit"]!="CHECKED" ){
			if(!matches(AInfo["Retail Food Store Square Footage"],"",null,"undefined")){
				switch(""+AInfo["Retail Food Store Square Footage"]){
					case "<3000": 
						updateFee("FS0024", "FS_GENERAL", "FINAL", 1, "Y");
						break;
					case "3001-30000": 
						updateFee("FS0025", "FS_GENERAL", "FINAL", 1, "Y");
						break;
					case "30001-40000": 
						updateFee("FS0026", "FS_GENERAL", "FINAL", 1, "Y");
						break;
					case "40001-60000": 
						updateFee("FS0027", "FS_GENERAL", "FINAL", 1, "Y");
						break;
					case "<60000": 
						updateFee("FS0028", "FS_GENERAL", "FINAL", 1, "Y");
						break;
				}
			}
		}
	}else{
		if(wfTask=="Plan Review" && wfStatus=="Plans Approved"){
			if(AInfo["Non Profit"]=="CHECKED"){
				updateFee("FS0032", "FS_GENERAL", "FINAL", 1, "Y");
			}else{
				if(sysDate.getMonth()>6) {
					var proRated= "Y";
				}else{
					var proRated = "N";
				}
				if(!matches(AInfo["Retail Food Store Square Footage"],"",null,"undefined")){
					var valCompare = ""+ AInfo["Retail Food Store Square Footage"] +"|"+proRated;
					switch(valCompare){
						case "<3000|N": 
							updateFee("FS0004", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "3001-30000|N": 
							updateFee("FS0005", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "30001-40000|N": 
							updateFee("FS0006", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "40001-60000|N":
							updateFee("FS0007", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "<60000|N":
							updateFee("FS0008", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "<3000|Y": 
							updateFee("FS0040", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "3001-30000|Y": 
							updateFee("FS0041", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "30001-40000|Y": 
							updateFee("FS0042", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "40001-60000|Y":
							updateFee("FS0043", "FS_GENERAL", "FINAL", 1, "Y");
							break;
						case "<60000|Y":
							updateFee("FS0044", "FS_GENERAL", "FINAL", 1, "Y");
							break;
					}
				}else{
					if(!matches(AInfo["Number of Employees"],"",null,"undefined")){
						var valCompare = ""+ AInfo["Number of Employees"] +"|"+proRated;
						logDebug("test: " + valCompare);
						switch(valCompare){
							case "1-9|N": 
								updateFee("FS0001", "FS_GENERAL", "FINAL", 1, "Y");
								break;
							case "10-40|N": 
								updateFee("FS0002", "FS_GENERAL", "FINAL", 1, "Y");
								break;
							case ">40|N": 
								updateFee("FS0003", "FS_GENERAL", "FINAL", 1, "Y");
								break;

							case "1-9|Y": 
								updateFee("FS0037", "FS_GENERAL", "FINAL", 1, "Y");
								break;
							case "10-40|Y": 
								updateFee("FS0038", "FS_GENERAL", "FINAL", 1, "Y");
								break;
							case ">40|Y": 
								updateFee("FS0039", "FS_GENERAL", "FINAL", 1, "Y");
								break;
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Food/* /Application: Fees: " + err.message);
	logDebug(err.stack);
}
//lwacht: 181029: #166b: end
lwacht: 181107: end  */

//lwacht: 181029: adding try/catch logic, in case there's an error
try{
	var existingFacilityIsYes = false;
	var existingFacilityIsNo = false; 

	permitString = appTypeArray[0]+"/"+appTypeArray[1]+"/"+appTypeArray[2]+"/Permit";

	var fixedDate = aa.bizDomain.getBizDomainByValue("EH_Permit_Renew_Rule" ,"Fixed Date"); 
	var doFixedDate = fixedDate.getSuccess() && fixedDate.getOutput().getAuditStatus() != "I";

	var permitIssuedDate = aa.bizDomain.getBizDomainByValue("EH_Permit_Renew_Rule" ,"Permit Issued Date"); 
	var doPermitIssuedDate = permitIssuedDate.getSuccess() && permitIssuedDate.getOutput().getAuditStatus() != "I";

	if(wfTask == "Permit Issuance" && wfStatus == "Issued" && AInfo["Existing Facility"]=='Yes'){
		include("EH Establish Links to Reference Contacts"); 
		existingFacilityIsYes = true;
	} 
	if(wfTask == "Permit Issuance" && wfStatus == "Issued" && AInfo["Existing Facility"]=='No'){
		include("EH Establish Links to Reference Contacts"); 
		existingFacilityIsNo = true;
	}
	if(doFixedDate && doPermitIssuedDate){
		var fixedDates= lookup("EH_RENEWAL_FIXED_DATE", permitString); 
		if(fixedDates==undefined){
			doFixedDate = false;
		}else{
			doPermitIssuedDate=false;
		}
	}
	if(existingFacilityIsYes && doFixedDate){
		var fixedDates= lookup("EH_RENEWAL_FIXED_DATE", permitString);
		availableExpDate=getNextAvailableExpDate(fixedDates, wfDateMMDDYYYY); 
		include("EH Food Existing Facility is YES");
	} 
	if(existingFacilityIsYes && doPermitIssuedDate){
		var monthsToInitialExpire = lookup("EH_RENEWAL_INTERVAL", permitString); 
		availableExpDate=dateAddMonths(wfDateMMDDYYYY, monthsToInitialExpire); 
		include("EH Food Existing Facility is YES");
	}
	if(existingFacilityIsNo && doFixedDate){
		var fixedDates= lookup("EH_RENEWAL_FIXED_DATE", permitString);
		availableExpDate=getNextAvailableExpDate(fixedDates, wfDateMMDDYYYY); 
		include("EH Food Existing Facility is No");
	}
	if(existingFacilityIsNo && doPermitIssuedDate){
		var monthsToInitialExpire = lookup("EH_RENEWAL_INTERVAL", permitString); 
		availableExpDate=dateAddMonths(wfDateMMDDYYYY, monthsToInitialExpire); 
		include("EH Food Existing Facility is No");
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUA:EnvHealth/Food/*/Application: General: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181029: end
