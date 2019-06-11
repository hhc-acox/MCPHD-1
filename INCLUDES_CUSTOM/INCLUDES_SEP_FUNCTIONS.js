//INCLUDES_SEP_CUSTOM START
function sepGetReqdDocs() {
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
		if(sepScriptConfigArr.length>0){
			var retArray = [];
			if(publicUser){
				var submittedDocList = aa.document.getDocumentListByEntity(capId,"TMP_CAP").getOutput().toArray();
			}else{
				var vEventName = aa.env.getValue("EventName");
				if(vEventName.indexOf("Before")>-1){
					var submittedDocList = aa.env.getValue("DocumentModelList");
					if(submittedDocList.length>0){
						for (var counter = 0; counter < submittedDocList.size(); counter++) {
							var doc = submittedDocList.get(counter);
							logDebug("category: " + doc.getDocCategory()) ;
						}
					}	
				}else{
					var submittedDocList = aa.document.getDocumentListByEntity(capId,"CAP").getOutput().toArray();
				}
			}
			uploadedDocs = new Array();
			if(vEventName.indexOf("Before")>-1){
				if(submittedDocList.length>0){
					for (var counter = 0; counter < submittedDocList.size(); counter++) {
						var doc = submittedDocList.get(counter);
						//logDebug("category: " + doc.getDocCategory()) ;
						uploadedDocs[doc.getDocGroup() +"-"+ doc.getDocCategory()] = true;
					}
				}
			}else{
				for (var i in submittedDocList ){
					//logDebug("submittedDocList[i].getDocGroup() : " + submittedDocList[i].getDocGroup());
					//logDebug("submittedDocList[i].getDocCategory() : " + submittedDocList[i].getDocCategory());
					uploadedDocs[submittedDocList[i].getDocGroup() +"-"+ submittedDocList[i].getDocCategory()] = true;
				}
			}
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				if(vEventName.indexOf("Workflow")>-1){
					var sepReqdDocs = loadASITable("REQD DOCUMENTS - WORKFLOW",cfgCapId);
				}else{
					var sepReqdDocs = loadASITable("REQD DOCUMENTS - APP SUBMITTAL",cfgCapId);
				}
				for(row in sepReqdDocs){
					if(sepReqdDocs[row]["Active"]=="Yes"){
						var appMatch = true;
						var recdType = sepReqdDocs[row]["Record Type"];
						var recdTypeArr = "" + recdType
						var arrAppType = recdTypeArr.split("/");
						if (arrAppType.length != 4){
							logDebug("The record type is incorrectly formatted: " + recdType);
						}else{
							if(vEventName.indexOf("Before")>-1){
								var aTypeLevel=[];
								aTypeLevel[0] = aa.env.getValue("ApplicationTypeLevel1");
								aTypeLevel[1] = aa.env.getValue("ApplicationTypeLevel2");
								aTypeLevel[2] = aa.env.getValue("ApplicationTypeLevel3");
								aTypeLevel[3] = aa.env.getValue("ApplicationTypeLevel4");
								for (xx in arrAppType){
									if (!arrAppType[xx].equals(aTypeLevel[xx]) && !arrAppType[xx].equals("*")){
										appMatch = false;
									}
								}
							}else{
								for (xx in arrAppType){
									if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
										appMatch = false;
									}
								}
							}
						}
						if (appMatch){
							var wkFlMatch = false;
							if(vEventName.indexOf("Workflow")<0){
								wkFlMatch = true;
							}else{
								var tName = ""+sepReqdDocs[row]["Task Name"];
								var taskName = tName.trim();
								var tStatus = ""+sepReqdDocs[row]["Task Status"];
								var taskStatus = tStatus.trim();
								if((matches(taskName,null,"","undefined") || wfTask==taskName) && wfStatus == taskStatus){
									wkFlMatch = true;
								}
							}
							if(wkFlMatch){
								var cFld = ""+sepReqdDocs[row]["Custom Field Name"];
								var custFld = cFld.trim();
								var cVal = ""+sepReqdDocs[row]["Custom Field Value"];
								var custVal = cVal.trim();
								var addtlQuery = sepReqdDocs[row]["Additional Query"];
								var dGroup = ""+sepReqdDocs[row]["Document Group"];
								var docGroup = dGroup.trim();
								var dType = ""+sepReqdDocs[row]["Document Type"];
								var docType = dType.trim();
								if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
									var chkFilter = ""+addtlQuery;
									if (chkFilter.length==0 || eval(chkFilter) ) {
										//doc is required, see if it's been uploaded
										if(uploadedDocs[docGroup +"-"+ docType] == undefined) {	
											var thisArray = [];
											thisArray["docGroup"]=docGroup;
											thisArray["docType"]=docType;
											retArray.push(thisArray);
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	if(retArray.length>0){
		return retArray;
	}else{
		return false;
	}
}catch(err){
	logDebug("An error occurred in sepGetReqdDocs: " + err.message);
	logDebug(err.stack);
}}

function sepEmailNotifContactWkfl(recdType, contactType, respectPriChannel, notName, rName, taskName, taskStatus, sysFromEmail, addtlQuery) {
try{
	if((matches(taskName,null,"","undefined") || wfTask==""+taskName) && wfStatus == ""+taskStatus){
		var appMatch = true;
		var recdTypeArr = "" + recdType
		var arrAppType = recdTypeArr.split("/");
		if (arrAppType.length != 4){
			logDebug("The record type is incorrectly formatted: " + recdType);
			return false;
		}else{
			for (xx in arrAppType){
				if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
					appMatch = false;
				}
			}
		}
		if (appMatch){
			var chkFilter = ""+addtlQuery;
			if (chkFilter.length==0 ||eval(chkFilter) ) {
				var cntType = ""+contactType;
				logDebug("cntType: " + cntType);
				if(cntType.indexOf(",")>-1){
					var arrType = cntType.split(",");
					for(con in arrType){
						var priContact = getContactObj(capId,arrType[con]);
						sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
					}
				}else{
					if(cntType.toUpperCase()=="ALL"){
						var arrType = getContactObjs(capId);
						for(con in arrType){
							var priContact = getContactObj(capId,arrType[con]);
							sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
						}
					}else{
						var priContact = getContactObj(capId,cntType);
						sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
					}						
				}						
			}
		}
	}
}catch(err){
	logDebug("An error occurred in sepEmailNotifContactWkfl: " + err.message);
	logDebug(err.stack);
}}

function sepEmailNotifContactAppSub(recdType, contactType, respectPriChannel, notName, rName, sysFromEmail, addtlQuery) {
try{
	var appMatch = true;
	var recdTypeArr = "" + recdType
	var arrAppType = recdTypeArr.split("/");
	if (arrAppType.length != 4){
		logDebug("The record type is incorrectly formatted: " + recdType);
		return false;
	}else{
		for (xx in arrAppType){
			if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
				appMatch = false;
			}
		}
	}
	if (appMatch){
		var chkFilter = ""+addtlQuery;
		if (chkFilter.length==0 ||eval(chkFilter) ) {
			var cntType = ""+contactType;
			if(cntType.indexOf(",")>-1){
				var arrType = cntType.split(",");
				for(con in arrType){
					var priContact = getContactObj(capId,arrType[con]);
					sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
				}
			}else{
				if(cntType.toUpperCase()=="ALL"){
					var arrType = getContactObjs(capId);
					for(con in arrType){
						var priContact = getContactObj(capId,arrType[con]);
						sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
					}
				}else{
					var priContact = getContactObj(capId,cntType);
					sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
				}						
			}						
		}
	}
}catch(err){
	logDebug("An error occurred in sepEmailNotifContactAppSub: " + err.message);
	logDebug(err.stack);
}}

function sepSchedInspectionAppSub(recdType, insGroup, insType, pendSched, asiField, asiValue, daysAhead, calWkgDay, inspName, addtlQuery) {
try{
	var appMatch = true;
	var recdTypeArr = "" + recdType
	var arrAppType = recdTypeArr.split("/");
	if (arrAppType.length != 4){
		logDebug("The record type is incorrectly formatted: " + recdType);
		return false;
	}else{
		for (xx in arrAppType){
			if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
				appMatch = false;
			}
		}
	}
	if (appMatch){
		var chkFilter = ""+addtlQuery;
		if (chkFilter.length==0 ||eval(chkFilter) ) {
			var cFld = ""+asiField;
			var custFld = cFld.trim();
			var cVal = ""+asiValue;
			var custVal = cVal.trim();
			if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
				var pendOrSched = ""+pendSched;
				if(pendOrSched.toUpperCase()=="PENDING"){
					createPendingInspection(insGroup,insType);
				}else{
					if(calWkgDay=="Working"){
						var dtSched = dateAdd(sysDate,daysAhead,true);
					}else{
						var dtSched = dateAdd(sysDate,daysAhead);
					}
					scheduleInspectDate(insType,dtSched);
					if(!matches(inspName,"",null,"undefined")){
						var inspId = getScheduledInspId(insType);
						inspName = ""+inspName;
						if(inspName.toUpperCase()=="AUTO"){
							autoAssignInspection(inspId);
						}else{
							assignInspection(inspId, inspName);
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("An error occurred in sepSchedInspectionAppSub: " + err.message);
	logDebug(err.stack);
}}

function sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail){
try{
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(!respectPriChannel || priChannel.indexOf("Email") > -1 || priChannel.indexOf("E-mail") > -1){
				sepSendNotification(sysFromEmail,priContact,notName,rName);
			}else{
				if(respectPriChannel && priChannel.indexOf("Postal") > -1){
					var addrString = "";
					var contAddr = priContact.addresses;
					for(ad in contAddr){
						var thisAddr = contAddr[ad];
						for (a in thisAddr){
							if(!matches(thisAddr[a], "undefined", "", null)){
								if(!matches(thisAddr[a].addressType, "undefined", "", null)){
									addrString += thisAddr[a].addressLine1 + br + thisAddr[a].city + ", " + thisAddr[a].state +  " " + thisAddr[a].zip + br;
								}
							}
						}
					}
					if(addrString==""){
						addrString = "No addresses found.";
					}
					if(!matches(rptName, null, "", "undefined")){
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the report " + rptName + " to : " + br + addrString + "</font>");
					}else{
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the notification " + notName + " to : " + br + addrString + "</font>");
					}
				}
			}
		}else{
			logDebug("No primary channel found.  Defaulting to emailing the notification.");
			sepSendNotification(sysFromEmail,priContact,notName,rName);
		}
	}else{
		logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
	}
}catch(err){
	logDebug("An error occurred in sepProcessContactsForNotif: " + err.message);
	logDebug(err.stack);
}}

function sepSendNotification(emailFrom,priContact,notName,rName){
try{
	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var emailRpt = false;
	var eParams = aa.util.newHashtable(); 
	addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
	var contPhone = priContact.capContact.phone1;
	if(contPhone){
		var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
	}else{
		var fmtPhone = "";
	}
	addParameter(eParams, "$$altID$$", capId.getCustomID());
	addParameter(eParams, "$$contactPhone1$$", fmtPhone);
	addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
	addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
	addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
	addParameter(eParams, "$$status$$", capStatus);
	addParameter(eParams, "$$capType$$", cap.getCapType().getAlias());
	var priEmail = ""+priContact.capContact.getEmail();
	//var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
	var rFiles = [];
	var rptName = ""+rName;
	if(!matches(rptName, null, "", "undefined")){
		var report = aa.reportManager.getReportInfoModelByName(rName);
		if(report.getSuccess() && report!=null ){
			report = report.getOutput();
			report.setModule(appTypeArray[0]);
			report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
			var rParams = aa.util.newHashMap(); 
			rParams.put("altId",capId.getCustomID());
			report.setReportParameters(rParams);
			report.getEDMSEntityIdModel().setAltId(capId.getCustomID());
			var permit = aa.reportManager.hasPermission(rName,currentUserID);
			if (permit.getOutput().booleanValue()) {
				var reportResult = aa.reportManager.getReportResult(report);
				if(reportResult) {
					reportOutput = reportResult.getOutput();
					var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
					reportFile=reportFile.getOutput();
					rFiles.push(reportFile);
					emailRpt = true;
				}else {
					logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
				}
			} else {
				logDebug("You have no permission.");
			}	
		}else{
			logDebug("An error occurred retrieving the report: "+ report.getErrorMessage());
		}
	}
	if(!emailRpt){
		logDebug("here");
		rFiles = [];
	}
	var result = null;
	logDebug("rName: " +rName);
	logDebug("priEmail: " +priEmail);
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, priEmail, null, notName, eParams, capIDScriptModel, rFiles);
	if(result.getSuccess()){
		logDebug("Sent email successfully!");
		return true;
	}else{
		logDebug("Failed to send mail - " + result.getErrorMessage());
		return false;
	}
}catch(err){
	logDebug("An error occurred in sepSendNotification: " + err.message);
	logDebug(err.stack);
}}

function sepUpdateFeesWkfl(sepRules) {
try{
	for(row in sepRules){
		if(sepRules[row]["Active"]=="Yes"){
			var taskName = ""+sepRules[row]["Task Name"];
			var taskStatus = ""+sepRules[row]["Task Status"];
			if(!matches(taskName,"",null,"undefined" || wfTask==taskName) && wfStatus==taskStatus){
				var appMatch = true;
				var recdType = ""+sepRules[row]["Record Type"];
				var recdTypeArr = "" + recdType;
				var arrAppType = recdTypeArr.split("/");
				if (arrAppType.length != 4){
					logDebug("The record type is incorrectly formatted: " + recdType);
					return false;
				}else{
					for (xx in arrAppType){
						if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
							appMatch = false;
						}
					}
				}
				if (appMatch){
					var addtlQuery = ""+sepRules[row]["Additional Query"];
					var chkFilter = ""+addtlQuery;
					if (chkFilter.length==0 ||eval(chkFilter) ) {
						var cFld = ""+sepRules[row]["Custom Field Name"];
						var custFld = cFld.trim();
						var cVal = ""+sepRules[row]["Custom Field Value"];
						var custVal = cVal.trim();
						if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
							var fcode = ""+sepRules[row]["Fee Code"];
							var fsched = ""+sepRules[row]["Fee Schedule"];
							var fperiod = ""+sepRules[row]["Fee Period"];
							var feeQty = ""+sepRules[row]["Fee Quantity"];
							if(isNaN(feeQty)){
								if(feeQty.indexOf("AInfo")<0 && feeQty.indexOf("estValue")<0  ){
									var fqty = parseFloat([feeQty]);
								}else{
									var fqty = eval(feeQty);
									if(isNaN(fqty)){
										logDebug("Fee Quantity does not resolve to a number. Setting fee quantity to 1.");
										fqty = 1;
									}
								}
							}else{
								var fqty = parseFloat(feeQty);
							}
							var finvoice = ""+sepRules[row]["Auto Invoice"];
							if(finvoice=="Yes") finvoice = "Y";
							var pDuplicate = ""+sepRules[row]["Duplicate Fee"];
							if(pDuplicate=="Yes") pDuplicate = "Y";
							// If optional argument is blank, use default logic (i.e. allow duplicate fee if invoiced fee is found)
							if (pDuplicate == null || pDuplicate.length == 0){
								pDuplicate = "Y";
							}else{
								pDuplicate = pDuplicate.toUpperCase();
							}
							var invFeeFound = false;
							var adjustedQty = parseFloat(fqty);
							var feeSeq = null;
							feeUpdated = false;
							getFeeResult = aa.finance.getFeeItemByFeeCode(capId, fcode, fperiod);
							if (getFeeResult.getSuccess()) {
								var feeList = getFeeResult.getOutput();
								for (feeNum in feeList) {
									if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
										if (pDuplicate == "Y") {
											logDebug("Invoiced fee " + fcode + " found, subtracting invoiced amount from update qty.");
											adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
											invFeeFound = true;
										} else {
											invFeeFound = true;
											logDebug("Invoiced fee " + fcode + " found.  Not updating this fee. Not assessing new fee " + fcode);
										}
									}
									if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
										adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
									}
								}
								for (feeNum in feeList)
									if (feeList[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated) // update this fee item
									{
										var feeSeq = feeList[feeNum].getFeeSeqNbr();
										var editResult = aa.finance.editFeeItemUnit(capId, adjustedQty + feeList[feeNum].getFeeUnit(), feeSeq);
										feeUpdated = true;
										if (editResult.getSuccess()) {
											logDebug("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);
											if (finvoice == "Y") {
												feeSeqList.push(feeSeq);
												paymentPeriodList.push(fperiod);
											}
										} else {
											logDebug("**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage());
											break
										}
									}
							} else {
								logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
							}
							// Add fee if no fee has been updated OR invoiced fee already exists and duplicates are allowed
							if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == "Y")){
								feeSeq = addFee(fcode, fsched, fperiod, adjustedQty, finvoice);
							}else{
								feeSeq = null;
							}
							updateFeeItemInvoiceFlag(feeSeq, finvoice);
							return feeSeq;
						}
					}
				}
			}
		}
	}
}catch (err){
	logDebug("An error occurred in sepUpdateFeesWkfl: " + err.message);
	logDebug(err.stack);
}}

function sepUpdateFeesAppSub(sepRules) {
try{
	for(row in sepRules){
		if(sepRules[row]["Active"]=="Yes"){
			var appMatch = true;
			var recdType = ""+sepRules[row]["Record Type"];
			var recdTypeArr = "" + recdType;
			var arrAppType = recdTypeArr.split("/");
			if (arrAppType.length != 4){
				logDebug("The record type is incorrectly formatted: " + recdType);
				return false;
			}else{
				for (xx in arrAppType){
					if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
						appMatch = false;
					}
				}
			}
			if (appMatch){
				var addtlQuery = ""+sepRules[row]["Additional Query"];
				var chkFilter = ""+addtlQuery;
				if (chkFilter.length==0 ||eval(chkFilter) ) {
					var cFld = ""+sepRules[row]["Custom Field Name"];
					var custFld = cFld.trim();
					var cVal = ""+sepRules[row]["Custom Field Value"];
					var custVal = cVal.trim();
					if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
						var fcode = ""+sepRules[row]["Fee Code"];
						var fsched = ""+sepRules[row]["Fee Schedule"];
						var fperiod = ""+sepRules[row]["Fee Period"];
						var feeQty = ""+sepRules[row]["Fee Quantity"];
						if(isNaN(feeQty)){
							if(feeQty.indexOf("AInfo")<0 && feeQty.indexOf("estValue")<0  ){
								var fqty = parseFloat([feeQty]);
							}else{
								var fqty = eval(feeQty);
								logDebug("fqty: " + fqty);
								if(isNaN(fqty)){
									logDebug("Fee Quantity does not resolve to a number. Setting fee quantity to 1.");
									fqty = 1;
								}
							}
						}else{
							var fqty = parseFloat(feeQty);
						}
						var finvoice = ""+sepRules[row]["Auto Invoice"];
						if(finvoice=="Yes") finvoice = "Y";
						var pDuplicate = ""+sepRules[row]["Duplicate Fee"];
							var pDuplicate = ""+sepRules[row]["Duplicate Fee"];
							if(pDuplicate=="Yes") pDuplicate = "Y";
							// If optional argument is blank, use default logic (i.e. allow duplicate fee if invoiced fee is found)
							if (pDuplicate == null || pDuplicate.length == 0){
								pDuplicate = "Y";
							}else{
								pDuplicate = pDuplicate.toUpperCase();
							}
							var invFeeFound = false;
							var adjustedQty = parseFloat(fqty);
							var feeSeq = null;
							feeUpdated = false;
							getFeeResult = aa.finance.getFeeItemByFeeCode(capId, fcode, fperiod);
							if (getFeeResult.getSuccess()) {
								var feeList = getFeeResult.getOutput();
								for (feeNum in feeList) {
									if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
										if (pDuplicate == "Y") {
											logDebug("Invoiced fee " + fcode + " found, subtracting invoiced amount from update qty.");
											adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
											invFeeFound = true;
										} else {
											invFeeFound = true;
											logDebug("Invoiced fee " + fcode + " found.  Not updating this fee. Not assessing new fee " + fcode);
										}
									}
									if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
										adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
									}
								}
								for (feeNum in feeList)
									if (feeList[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated) // update this fee item
									{
										var feeSeq = feeList[feeNum].getFeeSeqNbr();
										var editResult = aa.finance.editFeeItemUnit(capId, adjustedQty + feeList[feeNum].getFeeUnit(), feeSeq);
										feeUpdated = true;
										if (editResult.getSuccess()) {
											logDebug("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);
											if (finvoice == "Y") {
												feeSeqList.push(feeSeq);
												paymentPeriodList.push(fperiod);
											}
										} else {
											logDebug("**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage());
											break
										}
									}
							} else {
								logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
							}
							// Add fee if no fee has been updated OR invoiced fee already exists and duplicates are allowed
							if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == "Y")){
								feeSeq = addFee(fcode, fsched, fperiod, adjustedQty, finvoice);
							}else{
								feeSeq = null;
							}
							updateFeeItemInvoiceFlag(feeSeq, finvoice);
							return feeSeq;
					}
				}
			}
		}
	}
}catch (err){
	logDebug("An error occurred in sepUpdateFeesAppSub: " + err.message);
	logDebug(err.stack);
}}

function sepStopWorkflow(){
//stop workflow progress based on parameters
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
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepRules = loadASITable("PREVENT WORKFLOW UPDATE",cfgCapId);
				if(sepRules.length>0){
					for(row in sepRules){
						if(sepRules[row]["Active"]=="Yes"){
							var taskName = ""+sepRules[row]["Task Name"];
							var taskStatus = ""+sepRules[row]["Task Status"];
							if(!matches(taskName,"",null,"undefined" || wfTask==taskName) && wfStatus==taskStatus){
								var appMatch = true;
								var recdType = ""+sepRules[row]["Record Type"];
								var recdTypeArr = "" + recdType;
								var arrAppType = recdTypeArr.split("/");
								if (arrAppType.length != 4){
									logDebug("The record type is incorrectly formatted: " + recdType);
									return false;
								}else{
									for (xx in arrAppType){
										if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
											appMatch = false;
										}
									}
								}
								if (appMatch){
									var addtlQuery = ""+sepRules[row]["Additional Query"];
									var chkFilter = ""+addtlQuery;
									if (chkFilter.length==0 ||eval(chkFilter) ) {
										switch("" + sepRules[row]["Event"]){
										case "Fees Due": 
											var strFee = ""+ sepRules[row]["Required Elements List"];
											var feeBal = 0;
											var feesDue = [];
											if(strFee.length>0){
												var arrFee = strFee.split("|");
												for (fee in arrFee){
													feeBal += sepFeeBalance(arrFee[fee]);
													if(sepFeeBalance(arrFee[fee])>0){
														feesDue.push(arrFee[fee]);
													}
												}
											}else{
												feeBal = sepFeeBalance();
											}
											if(feeBal>0){
												cancel=true;
												showMessage=true;
												comment( "'"+ taskName + "' cannot be set to '" + taskStatus + "' when there is an outstanding balance ($" + feeBal.toFixed(2) + ") of these fees: " );
												if(feesDue.length==0){
													comment("--All Fees--");
												}else{
													for( x in feesDue){
														comment(feesDue[x]);
													}
												}
											}
											break;
										case "Inspections Scheduled":
											var inspScheduled = false;
											var strInsp = ""+sepRules[row]["Required Elements List"];
											var inspDue = [];
											if(strInsp.length>0){
												var arrInsp = strInsp.split("|");
												for (ins in arrInsp){
													if(checkInspectionResult(arrInsp[ins], "Scheduled") || checkInspectionResult(arrInsp[ins], "Pending")){
														inspScheduled = true;
														inspDue.push(arrInsp[ins]);
													}
												}
											}else{
												if(isScheduled(false)){
													inspScheduled = true;
												}
											}
											if(inspScheduled){
												cancel=true;
												showMessage=true;
												comment( "'"+ taskName + "' cannot be set to '" + taskStatus + "' when these inspections are scheduled or pending: " );
												if(inspDue.length==0){
													comment("--All Inspections--");
												}else{
													for( x in inspDue){
														comment(inspDue[x]);
													}
												}
											}
											break;
										case "Documents Required":
											var submittedDocList = aa.document.getDocumentListByEntity(capId,"CAP").getOutput().toArray();
											uploadedDocs = new Array();
											for (var i in submittedDocList ){
												uploadedDocs[submittedDocList[i].getDocGroup() +"-"+ submittedDocList[i].getDocCategory()] = true;
											}
											var strDoc =  ""+ sepRules[row]["Required Elements List"];
											var arrDoc = strDoc.split("|");
											var retArray = [];
											for (doc in arrDoc){
												if(arrDoc[doc].indexOf(",")<0){
													logDebug("Document List is incorrectly formatted: " + strDoc);
													return false;
												}
												var thisDoc = arrDoc[doc].split(",");
												var docGroup = thisDoc[0];
												var docType = thisDoc[1];
												if(uploadedDocs[docGroup +"-"+ docType] == undefined) {	
													var thisArray = [];
													thisArray["docGroup"]=docGroup;
													thisArray["docType"]=docType;
													retArray.push(thisArray);
												}
											}
											if(retArray.length>0){
												cancel=true;
												showMessage=true;
												comment("'"+ taskName + "' cannot be set to '" + taskStatus + "' when these documents are required: ");
												for( x in retArray){
													comment(retArray[x]["docGroup"] + " - " + retArray[x]["docType"]);
												}
											}
											break;
										case "Child Records Status":
											var canProceed = false;
											var strChildInfo = ""+ sepRules[row]["Required Elements List"];
											var arrChildRecs = [];
											if(strChildInfo.length>0){
												var arrChildRecs = strChildInfo.split("|");
												for (ch in arrChildRecs){
													arrThisChild = arrChildRecs[ch].split(",");
													var arrChildren = getChildren(arrThisChild[0]);
													var status2Chk = ""+arrThisChild[1];
													if(status2Chk.toUpperCase()=="ANY"){
														canProceed =- true;
													}else{
														var badStatus=false;
														for(st in arrChildren){
															var chCap = aa.cap.getCap(arrChildren[st]).getOutput();
															if(chCap.getCapStatus().toUpperCase()!=status2Chk.toUpperCase()){
																badStatus=true;
															}
														}
														if(badStatus){
															canProceed=false;
														}
													}		
												}
											}else{
												canProceed=false;
											}
											if(!canProceed){
												cancel=true;
												showMessage=true;
												comment( "'"+ taskName + "' cannot be set to '" + taskStatus + "' when either there is no child record of the type " );
												if(feesDue.length==0){
													comment("--All Fees--");
												}else{
													for( x in feesDue){
														comment(feesDue[x]);
													}
												}
											}
											break;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: sepStopWorkflow: " + err.message);
	logDebug(err.stack)
}}

function sepFeeBalance(feestr){
try{
	// Searches payment fee items and returns the unpaid balance of a fee item
	// Sums fee items if more than one exists.  
	var amtFee = 0;
	var amtPaid = 0;
	var feeResult=aa.fee.getFeeItems(capId);
	if (feeResult.getSuccess()){ 
		var feeObjArr = feeResult.getOutput(); 
	}else{ 
		logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); 
		return false 
	}
	for (ff in feeObjArr){
		if ((!feestr || feestr.equals(feeObjArr[ff].getFeeCod()))){
			amtFee+=feeObjArr[ff].getFee();
			var pfResult = aa.finance.getPaymentFeeItems(capId, null);
			if (pfResult.getSuccess()){
				var pfObj = pfResult.getOutput();
				for (ij in pfObj){
					if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()){
						amtPaid+=pfObj[ij].getFeeAllocation();
					}
				}
			}
		}
	}
	return amtFee - amtPaid;
}catch(err){
	logDebug("A JavaScript Error occurred: sepFeeBalance: " + err.message);
	logDebug(err.stack)
}}

function sepIssueLicenseWorkflow(){
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
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepRules = loadASITable("LICENSE ISSUANCE - ON WORKFLOW",cfgCapId);
				if(sepRules.length>0){
					for(row in sepRules){
						if(sepRules[row]["Active"]=="Yes"){
							var taskName = ""+sepRules[row]["Task Name"];
							var taskStatus = ""+sepRules[row]["Task Status"];
							if(!matches(taskName,"",null,"undefined" || wfTask==taskName) && wfStatus==taskStatus){
								var appMatch = true;
								var recdType = ""+sepRules[row]["Record Type"];
								var recdTypeArr = "" + recdType;
								var arrAppType = recdTypeArr.split("/");
								if (arrAppType.length != 4){
									logDebug("The record type is incorrectly formatted: " + recdType);
									return false;
								}else{
									for (xx in arrAppType){
										if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
											appMatch = false;
										}
									}
								}
								if (appMatch){
									var addtlQuery = ""+sepRules[row]["Additional Query"];
									var chkFilter = ""+addtlQuery;
									if (chkFilter.length==0 ||eval(chkFilter) ) {
									logDebug("eval(chkFilter): " + eval(chkFilter));
										if(!matches(sepRules[row]["Parent Record Type"], "",null,"undefined")){
											var arrParRec = ""+sepRules[row]["Parent Record Type"];
											var arrParRec = arrParRec.split("/");
											if(arrParRec.length!=4){
												logDebug("Parent ID not correctly formatted: " + sepRules[row]["Parent Record Type"]);
												return false;
											}else{
												var parCapId = false;
												var appCreateResult = aa.cap.createApp(arrParRec[0], arrParRec[1], arrParRec[2], arrParRec[3],capName);
												logDebug("creating cap " +arrParRec);
												if (appCreateResult.getSuccess()){
													var newId = appCreateResult.getOutput();
													logDebug("cap " + arrParRec + " created successfully ");
													// create Detail Record
													capModel = aa.cap.newCapScriptModel().getOutput();
													capDetailModel = capModel.getCapModel().getCapDetailModel();
													capDetailModel.setCapID(newId);
													aa.cap.createCapDetail(capDetailModel);
													var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
													var result = aa.cap.createAppHierarchy(newId, capId); 
													if (result.getSuccess()){
														logDebug("Parent application successfully linked");
														parCapId = newId;
													}else{
														logDebug("Could not link applications");
													}
												}else{
													logDebug( "**ERROR: adding parent App: " + appCreateResult.getErrorMessage());
												}											}
											if(parCapId){
												var newLPType = ""+sepRules[row]["Create LP Type"];
												if(!matches(newLPType, "",null,"undefined")){
													var newLPContact = getContactObj(capId,"Applicant");
													if(newLPContact){
														var lpCreated = newLPContact.createRefLicProf(null,newLPType,null,null);
													}
												}
												if(!matches(""+sepRules[row]["Expiration - Year(s)"],"",null,"undefined")){
													var expDateYear = sysDate.getYear()+parseInt(sepRules[row]["Expiration - Year(s)"]);
													var expDate = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), expDateYear, "MM/DD/YYYY");
													expDate = dateAdd(expDate,1);
												}else{
													if(!matches(""+sepRules[row]["Expiration - Month(s)"],"",null,"undefined")){
														var expDate =  dateAddMonths(sysDate,sepRules[row]["Expiration - Month(s)"]);
													}else{
														if(!matches(""+sepRules[row]["Expiration - MM/DD"],"",null,"undefined")){
															var expDate =  dateAddMonths(sysDate,sepRules[row]["Expiration - Month(s)"]);
														}else{
															logDebug("No expiration date listed. Defaulting to one year.");
															var expDateYear = sysDate.getYear()+1;
															var expDate = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), expDateYear, "MM/DD/YYYY");
														}
													}
												}
												if(matches(""+sepRules[row]["New App Status"],"",null,"undefined")){
													var newAppStatus = "Active";
												}else{
													var newAppStatus = ""+sepRules[row]["New App Status"];
												}
												var currCapId = capId;
												capId = parCapId;
												licEditExpInfo(newAppStatus, expDate);
												updateAppStatus(newAppStatus, "Updated via sepIssueLicenseWorkflow.");
												capId = currCapId;
												if(""+sepRules[row]["Copy Custom Fields/Lists"]=="ALL"){
													copyAppSpecific(parCapId);
													copyASITables(capId, parCapId);
													logDebug("Copied all ASI/T.");
												}else{
													if(!matches(""+sepRules[row]["Copy Custom Fields/Lists"],"",null,"undefined")){
														var copyList = ""+sepRules[row]["Copy Custom Fields/Lists"];
														var arrCopy = [];
														if(copyList.indexOf("|")>-1){
															arrCopy = copyList.split("|");
														}else{
															arrCopy.push(copyList);
														}
														copyAppSpecificInclude(parCapId,arrCopy);
														copyASITablesInclude(capId, parCapId,arrCopy);
													}
												}
												if(!matches(""+sepRules[row]["Copy Contacts"],"",null,"undefined")){
													var strContacts = ""+sepRules[row]["Copy Contacts"];
													if(strContacts.toUpperCase()=="ALL"){
														copyContacts(capId, parCapId);
													}else{
														if(strContacts.indexOf("|")>-1){
															var arrContacts = strContacts.split("|");
														}else{
															var arrContacts =[];
															arrContacts.push(strContacts);
														}
														for(c in arrContacts){
															copyContactsByType(capId, parCapId, arrContacts[c]);
														}
													}
												}
												if(""+sepRules[row]["Copy Examination"]=="Yes"){
													aa.examination.copyExaminationList(capId, parCapId);
												}
												if(""+sepRules[row]["Copy Education"]=="Yes"){
													aa.education.copyEducationList(capId, parCapId);
												}
												if(""+sepRules[row]["Copy Continuing Education"]=="Yes"){
													aa.continuingEducation.copyContEducationList(capId, parCapId);
												}
												var notName = "" + sepRules[row]["Notification Name"];
												if(!matches(notName, "","undefined",null)){
													var cntType = ""+sepRules[row]["Contacts Receiving Notice"];
													if(cntType.indexOf(",")>-1){
														var arrType = cntType.split(",");
														for(con in arrType){
															var priContact = getContactObj(capId,arrType[con]);
															sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
														}
													}else{
														if(cntType.toUpperCase()=="ALL"){
															var arrType = getContactObjs(capId);
															for(con in arrType){
																var priContact = getContactObj(capId,arrType[con]);
																sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
															}
														}else{
															var priContact = getContactObj(capId,cntType);
															sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
														}						
													}						
												}else{
													logDebug("No notification name. No email sent.");
												}
											}
										}
									}else{
										logDebug("sepIssueLicenseWorkflow: Check filter resolved to false: " + chkFilter);
									}
								}else{
									logDebug("sepIssueLicenseWorkflow: No app match: " + recdTypeArr);
								}
							}else{
								logDebug("sepIssueLicenseWorkflow: no task/status match: " + taskName + "/" + taskStatus);
							}
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: sepIssueLicenseWorkflow:  " + err.message);
	logDebug(err.stack)
}}

//copy of copyAppSpecific and copyASITables except optional param is include not ignore
function copyAppSpecificInclude(newCap) // copy all App Specific info into new Cap, 1 optional parameter for ignoreArr
{
	var includeArr = new Array();
	var limitCopy = false;
	if (arguments.length > 1) 
	{
		includeArr = arguments[1];
		limitCopy = true;
	}
	
	for (asi in AInfo){
		//Check list
		if(limitCopy){
			var ignore=true;
		  	for(var i = 0; i < includeArr.length; i++)
		  		if(includeArr[i] == asi){
		  			ignore=false;
		  			break;
		  		}
		  	if(ignore)
		  		continue;
		}
		editAppSpecific(asi,AInfo[asi],newCap);
	}
}



function copyASITablesInclude(pFromCapId, pToCapId) {
	// par3 is optional 0 based string array of table to include
	var itemCap = pFromCapId;

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
		var tai = ta.iterator();
	var tableArr = new Array();
	var includeArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		includeArr = arguments[2];
		limitCopy = true;
	}
	while (tai.hasNext()) {
		var tsm = tai.next();

		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName() + "";
		var numrows = 0;

		//Check list
		if (limitCopy) {
			var ignore = true;
			for (var i = 0; i < includeArr.length; i++)
				if (includeArr[i] == tn) {
					ignore = false;
					break;
				}
			if (ignore)
				continue;
		}
		if (!tsm.rowIndex.isEmpty()) {
			var tsmfldi = tsm.getTableField().iterator();
			var tsmcoli = tsm.getColumns().iterator();
			var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
			var numrows = 1;
			while (tsmfldi.hasNext()) // cycle through fields
			{
				if (!tsmcoli.hasNext()) // cycle through columns
				{
					var tsmcoli = tsm.getColumns().iterator();
					tempArray.push(tempObject); // end of record
					var tempObject = new Array(); // clear the temp obj
					numrows++;
				}
				var tcol = tsmcoli.next();
				var tval = tsmfldi.next();

				var readOnly = 'N';
				if (readOnlyi.hasNext()) {
					readOnly = readOnlyi.next();
				}

				var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
				tempObject[tcol.getColumnName()] = fieldInfo;
				//tempObject[tcol.getColumnName()] = tval;
			}

			tempArray.push(tempObject); // end of record
		}

		addASITable(tn, tempArray, pToCapId);
		logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	}
} 
//INCLUDES_SEP_CUSTOM END
//HHC Custom Functions Start
function HHC_CREATE_COURT(){
	try{
		HHC_ODYSSEY_PROCESS();
		crtConAry=nextNameArr;
		concnt = y;
		HHC_CREATE_CRT_CASES();
			}
	catch(err){
	logDebug("A JavaScript Error occurred: HHC_CREATE_COURT:  " + err.message);
	logDebug(err.stack);
				}
}
function HHC_ODYSSEY_PROCESS() 
{
	try{
		cContactResult = AInfo[''];
		cContactsExist = false;
		cContactAry = new Array();
		y = 0;
		addCourtCase = false;
		prevName = 'Start';
		cTempAry = new Array();
		nextNameArr = new Array();
		saveID = capId;
		cContactResult = aa.people.getCapContactByCapID(capId);
			if (cContactResult.getSuccess()) {
				cContactsExist = true;
				}

			if (cContactsExist) {
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				}

			if (cContactsExist) {
				for(yy in cContactAry) 

			HHC_SORT_CONTACTS();
				}

			if (cContactsExist) {
				for(yy in cContactAry) 

			HHC_CheckContact();
				}

			if (cContactsExist) {
				for(yy in nextNameArr) nextNameArr.sort();
				}

			if (cContactsExist) 
			{
				comment(nextNameArr.length+' - '+y);
				}
		}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_ODYSSEY_PROCESS:  " + err.message);
			logDebug(err.stack);
		}
}

function HHC_CREATE_CRT_CASES() {
	try{
		showMessage = true;
		comment('cases to create '+concnt);
		fixNameArr= new Array();
		fixNameArr=crtConAry;
		cContactAry = new Array();
		var cContactResult = AInfo[''];
		cContactsExist = false;
		ccnt=0;
		cContactResult = aa.people.getCapContactByCapID(capId);
			if (cContactResult.getSuccess()) 
				{
					cContactsExist = true;
					}

			if (cContactsExist) 
				{
					cContactAry = cContactResult.getOutput();
					}

			if (cContactsExist) 
				{
					for (i=0; i<concnt; i++) 

					{
					cContactResult = AInfo[''];
					cContactsExist = false;
					cContactAry = new Array();
					nextNameArr = new Array();
					prevName = 'Start';
					cTempAry = new Array();
					var saveID = capId;
					comment("THE SAVEID IS "+saveID);
					cCapContactModel = AInfo[''];
					cContactSeqNumber = 0;
					cPeopleModel = AInfo[''];
					cc = 0;
					y = 0;
				{
					newChildID = createChild('EnvHealth','CRT','NA','NA','');
					copyAppSpecific(newChildID);
					comment('New child app id = '+ newChildID);
					masterArray = new Array();
					elementArray = new Array();
					code10or19 = AInfo['Ordinance Chapter'];
					updateAppStatus('Legal Review','Initial Status',newChildID);
					assignCap('BGREGORY@HAHPDC1.HHCORP.ORG',newChildID);
					editAppSpecific('Parent Case',capIDString,newChildID);
					
					if (appMatch('*/*/LHH/*')) 
					{
						editAppSpecific('Case Type','Lead',newChildID);
						editAppSpecific('Parent Case',saveID,newChildID);
						editAppSpecific('EHS Court Day','THURS',newChildID);
						editAppSpecific('EHS Court Time','1:00 PM',newChildID);
						}

					if (parseInt(code10or19) == 10 && appMatch('*/*/TRA/*') && AInfo['Property Type'] == 'Occupied') 
					{
						elementArray['OFFENSE CODE'] = '10301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						elementArray['OFFENSE CODE'] = '10302OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						elementArray['OFFENSE CODE'] = '10303OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						}

					if (parseInt(code10or19) == 10 && appMatch('*/*/TRA/*') && matches(AInfo['Property Type'],'Vacant Lot', 'Vacant Structure')) 
					{
						elementArray['OFFENSE CODE'] = '10301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						elementArray['OFFENSE CODE'] = '10303OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						}

					if (parseInt(code10or19) == 19 && appMatch('*/*/TRA/*') && AInfo['Property Type'] == 'Occupied') 
					{
						elementArray['OFFENSE CODE'] = '19301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						elementArray['OFFENSE CODE'] = '19302OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						elementArray['OFFENSE CODE'] = '19304OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						}

					if (parseInt(code10or19) == 19 && appMatch('*/*/TRA/*') && matches(AInfo['Property Type'],'Vacant Lot', 'Vacant Structure')) 
					{
						elementArray['OFFENSE CODE'] = '19301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						elementArray['OFFENSE CODE'] = '19303OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						}

					if (parseInt(code10or19) == 10 && appMatch('*/*/HSG/*')) 
					{
						elementArray['OFFENSE CODE'] = '10303OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						}

					if (parseInt(code10or19) == 19 && appMatch('*/*/HSG/*')) 
					{
						elementArray['OFFENSE CODE'] = '19301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						}

					if (appMatch('*/*/LHH/*')) 
					{
						elementArray['OFFENSE CODE'] = '10303OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						}
						
					HHC_GET_ADDRESS_FOR_CHILD();
				}
				ccnt++;
				comment('ccnt = '+ccnt);
				capId = newChildID;
				comment("NEW CHILD ID IS "+newChildID);
				cContactResult = aa.people.getCapContactByCapID(capId);
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				if (cContactResult.getSuccess()) 
				{
					cContactsExist = true;
					}

					if (cContactsExist) 
					{
						for(yy in cContactAry) 

						HHC_SORT_CONTACTS();
						}

					if (cContactsExist) 
					{
						for(yy in cTempAry) 

						HHC_CheckContact();
						}

					if (cContactsExist) 
					{
						for(yy in nextNameArr) 
							
						nextNameArr.sort();
						}	
						for(ii=0;ii<cc;ii++) 

						{
							var csortContactNum = nextNameArr[ii][0];
							var csortContactNameToCheckFor = nextNameArr[ii][1];
							var csortContactTypeToCheckFor = nextNameArr[ii][2];
							var csortContactSeqNum = nextNameArr[ii][3];
							var cContactDelete = true;
							cCapContactModel = cContactAry[ii].getCapContactModel();
							if (parseInt(ccnt) == parseInt(csortContactNum)) 
							{
								cContactDelete = false;
								}

							if (!matches(csortContactTypeToCheckFor, 'Property Owner', 'Owner/Operator', 'Facility Owner','Business Owner','Tenant')) 
							{
								cContactDelete = true;
								}

							if (cContactDelete) {
								cPeopleModel = cCapContactModel.getPeople();
								}

							if (cContactDelete) 
							{
								cContactSeqNumber = parseInt(csortContactSeqNum);
								}

							if (cContactDelete) 
							{
								aa.people.removeCapContact(capId, cContactSeqNumber);
								}

							showMessage = true;
							comment(ccnt +' - '+nextNameArr[ii][0]+' ii= '+ii+' - '+nextNameArr[ii][1]+' - '+nextNameArr[ii][2]+' - '+nextNameArr[ii][3]+' ---- '+cContactDelete+' - '+cContactSeqNumber+' - '+csortContactSeqNum);

							}

			capId = saveID;
			comment("the saved capId is "+saveID);

						}

				}
			}
		catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CREATE_CRT_CASES:  " + err.message);
			logDebug(err.stack);
			}
	}

function HHC_SORT_CONTACTS() 
{
	try{
		showMessage=true;
		appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
		appConType = cContactAry[yy].getCapContactModel().getContactType();
		appSeqNum = cContactAry[yy].getCapContactModel().getPeople().getContactSeqNumber();
		cTempAry[yy] = [[appName],[appConType],[appSeqNum]];
		cTempAry.sort();
		comment(cTempAry[yy][0]+' - '+cTempAry[yy][1]+' - '+cTempAry[yy][2]);
			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_SORT_CONTACTS:  " + err.message);
			logDebug(err.stack);
			}
}
function HHC_CheckContact() 
{
	try{
		showMessage=true;
		appName = cTempAry[yy][0];
		cContactTypeToCheckFor = cTempAry[yy][1];
		cContactSeqNum = cTempAry[yy][2];
			if (appName != prevName && matches(cContactTypeToCheckFor, 'Property Owner', 'Owner/Operator', 'Facility Owner','Business Owner','Tenant')) {
				addCourtCase = true;
			}

			if (addCourtCase) {
				y++;
			}

		nextNameArr[yy] = [[y],[appName],[cContactTypeToCheckFor],[cContactSeqNum]];
		comment(nextNameArr[yy][0]+' - '+nextNameArr[yy][1]+' - '+nextNameArr[yy][2]+' - '+nextNameArr[yy][3]);
		prevName=String(appName);
		addCourtCase = false;
		cContactTypeToCheckFor = '';

		}	
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CheckContact:  " + err.message);
			logDebug(err.stack);
		}
}
function HHC_VIOLATIONS_LOOP() 
{
	try{
		loadASITable('VIOLATIONS');
			if (tableHasRows('VIOLATIONS')) {
				fixVIOLATIONS = loadASITable('VIOLATIONS');
				removeASITable('VIOLATIONS');
			}
			if (tableHasRows('VIOLATIONS')) {
				for(i in fixVIOLATIONS) {
					eachrow = fixVIOLATIONS[i];
					if (matches(eachrow['Status'],'Open', 'Court')) {
						fixVIOLATIONS[i]['Status'] ='Final';
					}

				}

			}

		if (tableHasRows('VIOLATIONS')) {
			addASITable('VIOLATIONS',fixVIOLATIONS);
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP:  " + err.message);
		logDebug(err.stack);
	}
}
	
function HHC_GET_ADDRESS() 
{
	try{

		var addrResult = aa.address.getAddressByCapId(capId);
		var addrArray = new Array();
		var addrArray = addrResult.getOutput();
		var streetName = addrArray[0].getStreetName();
		var hseNum = addrArray[0].getHouseNumberStart();
		var streetSuffix = addrArray[0].getStreetSuffix();
		var streetDir = addrArray[0].getStreetDirection();
			if (streetSuffix == null || streetSuffix == '' || streetSuffix == 'undefined') {
				streetSuffix = ' ';
				}

			if (streetDir == null || streetDir == '' || streetDir == 'undefined') {
				streetDir == ' ';
				}

			comment ('The Address is: '+hseNum+' '+streetDir+' '+streetName+' '+streetSuffix);
			if (streetDir == null) {
				editAppName(hseNum+' '+streetName+' '+streetSuffix);
				}

			if (streetDir != null) {
				editAppName(hseNum+' '+streetDir+' '+streetName+' '+streetSuffix);
				}

			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_ADDRESS:  " + err.message);
			logDebug(err.stack);
		}
}
function HHC_GET_ADDRESS_FOR_CHILD() 
{
	try{

		var addrResult = aa.address.getAddressByCapId(capId);
		var addrArray = new Array();
		var addrArray = addrResult.getOutput();
		var streetName = addrArray[0].getStreetName();
		var hseNum = addrArray[0].getHouseNumberStart();
		var streetSuffix = addrArray[0].getStreetSuffix();
		var streetDir = addrArray[0].getStreetDirection();
			if (streetSuffix == null || streetSuffix == '' || streetSuffix == 'undefined') {
				streetSuffix = ' ';
				}

			if (streetDir == null || streetDir == '' || streetDir == 'undefined') {
				streetDir == ' ';
				}

			comment ('The Address is: '+hseNum+' '+streetDir+' '+streetName+' '+streetSuffix);
			if (streetDir == null) {
				editAppName(hseNum+' '+streetName+' '+streetSuffix,newChildID);
				comment('The Child ID is: '+newChildID);
				}

			if (streetDir != null) {
				editAppName(hseNum+' '+streetDir+' '+streetName+' '+streetSuffix,newChildID);
				comment('The Child ID is: '+newChildID);
				}
				}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_ADDRESS_FOR_CHILD:  " + err.message);
			logDebug(err.stack);
		}
}
function HHC_CONTACTS_PROCESS() 
{
	try{
		cContactResult = AInfo[''];
		cContactsExist = false;
		cContactAry = new Array();
		y = 0;
		addCourtCase = false;
		prevName = 'Start';
		cTempAry = new Array();
		nextNameArr = new Array();
		myComplainer = '';
		cContactResult = aa.people.getCapContactByCapID(newChildID);
			if (cContactResult.getSuccess()) {
				cContactsExist = true;
				}

			if (cContactsExist) {
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				}

			if (cContactsExist) {
				showMesage = true;
				comment('The number of contacts is '+cc);
				}

			if (cContactsExist) 
				{
					for(yy in cContactAry) 

					{
						showMessage=true;
						appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
						appConType = cContactAry[yy].getCapContactModel().getContactType();
						appPhoneNum = cContactAry[yy].getPeople().phone1;
						appSeqNum = cContactAry[yy].getCapContactModel().getPeople().getContactSeqNumber();
						cContactDelete = false;
							if (appConType == 'Complainant') {
								cContactDelete = true;
								}

							if (cContactDelete) {
								cTempAry[yy] = [[appName],[appConType],[appPhoneNum]];
								}

							if (cContactDelete) {
								comment(cTempAry[yy][1]+' - '+cTempAry[yy][0]+' - '+cTempAry[yy][2]);
								myComplainer = cTempAry[yy][1]+': '+cTempAry[yy][0]+' - '+cTempAry[yy][2];
								}

							if (cContactDelete) {
								cCapContactModel = cContactAry[yy].getCapContactModel();
								}

							if (cContactDelete) {
								cPeopleModel = cCapContactModel.getPeople();
								}

							if (cContactDelete) {
								cContactSeqNumber = parseInt(appSeqNum);
								}

							if (cContactDelete) {
								aa.people.removeCapContact(newChildID, cContactSeqNumber);
								}
						}
					}

			if (cContactsExist) {
				createCapComment(myComplainer,newChildID);
				}

			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CONTACTS_PROCESS:  " + err.message);
			logDebug(err.stack);
		}
}

function HHC_VIOLATIONS_LOOP_COURT() 
{
	try{
		loadASITable('VIOLATIONS');
		AllFinaled = false;
		if (tableHasRows('VIOLATIONS')) {
			fixVIOLATIONS = loadASITable('VIOLATIONS');
			iRows = fixVIOLATIONS.length;
			iFins = 0;
			removeASITable('VIOLATIONS');
		}

		if (tableHasRows('VIOLATIONS')) {
			for(i in fixVIOLATIONS) {
				eachrow = fixVIOLATIONS[i];
				{
					if (matches(eachrow['Status'],'Final')) {
					iFins=iFins+1;
					}
				}
					if (matches(eachrow['Status'],'Open')) {
					fixVIOLATIONS[i]['Status'] ='Court';
					}
			}
		}

		if (tableHasRows('VIOLATIONS')) {
		addASITable('VIOLATIONS',fixVIOLATIONS);
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP_COURT:  " + err.message);
		logDebug(err.stack);
	}
}

function HHC_ASSIGN_NEW_LEHS() {
	try{
		var ctLead = AInfo['ParcelAttribute.CensusTract'];
		var newUserID = lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']);
			if (AInfo['Assigned To'] != null && AInfo['Assigned To'] != AInfo['Previous Assigned To']) {
				var newUserID = AInfo['Assigned To'];
				}

			if (checkInspectionResult('Initial Lead Inspection', 'Scheduled') == true) {
				inspNum=getScheduledInspId('Initial Lead Inspection');
				}

			if (checkInspectionResult('Reinspection', 'Scheduled') == true) {
				inspNum=getScheduledInspId('Reinspection');
				}
				editAppSpecific('Previous Assigned To', newUserID);
				editAppSpecific('Assigned To', newUserID);
				editAppSpecific('Census Tract', ctLead);
				assignCap(newUserID);
				
			if (checkInspectionResult('Initial Lead Inspection', 'Scheduled')) {
				assignInspection(inspNum, newUserID);
				}

			if (checkInspectionResult('Reinspection', 'Scheduled')) {
				assignInspection(inspNum, newUserID);
				}

		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP_COURT:  " + err.message);
		logDebug(err.stack);
	}
}

function hhc_getTheCensusTract(capId)
{
		try {
	//This section gets the parcel information from the case.  We need the Census Tract to determine the Team Leader for the Case.
	var fcapParcelObj = null; //This holds the parcel information
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
		if (capParcelResult.getSuccess())
		{
			var fcapParcelObj = capParcelResult.getOutput().toArray();
			var thisCensusTract = fcapParcelObj[0].getCensusTract();  //Use the Census Tract to get the Team Leader for the Case.
		}
		else
		{
			logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" +capParcelResult.getErrorMessage());
		}
		
	return thisCensusTract;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getTheCensusTract:  " + err.message);
		logDebug(err.stack);
	}
}

function hhc_getTheAddress(capId)
{
	try {
       var capAddResult = aa.address.getAddressByCapId(capId);
       if (capAddResult.getSuccess())
              {
                     var addrArray = new Array();
                     var addrArray = capAddResult.getOutput();
                     var hseNum = "";
                     var streetDir = "";
                     var streetName = "";
                     var streetSuffix = "";
                     var zip = "";
                     if (addrArray[0].getHouseNumberStart() != null)
                           hseNum= addrArray[0].getHouseNumberStart();
                     if (addrArray[0].getStreetDirection() != null)
                           streetDir = addrArray[0].getStreetDirection();
                     if (addrArray[0].getStreetName() != null)
                           streetName = addrArray[0].getStreetName();
                     if (addrArray[0].getStreetSuffix() != null)
                           streetSuffix = addrArray[0].getStreetSuffix();
                     if (addrArray[0].getZip() != null)
                           zip = addrArray[0].getZip();
              }
       else
              {
                     logDebug("**ERROR: Failed to get Address object: " + capAddResult.getErrorType() + ":" +capAddResult.getErrorMessage());
              }
                     thisCapAddress = hseNum + " " + ltrim(streetDir+" ") + streetName + " " + streetSuffix;
                     return thisCapAddress;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: hhc_getTheAddress:  " + err.message);
		logDebug(err.stack);
	}
}

function CreateLarvicideSite_IfBreeding(capId){
	try{
		gName = "VC_LARVICIDE";
		gItem = "SITE INFORMATION";
		asiGroup = "VC_LVCCKLST";
		asiSubGroup = "LARVICIDE";
		asiLabel = "Is Site Breeding";
		var myResult = getGuidesheetASIValue(inspId,gName,gItem,asiGroup,asiSubGroup, asiLabel);
			if(myResult=="Yes"){
			//Create the Larvicide Site Case
			newChildID = createChild('EnvHealth','VC','LarvicideSite','NA','');
			// Add Case and Data Fields Info
			copyAppSpecific(newChildID);
						}
}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: CreateLarvicideSite_IfBreeding:  " + err.message);
		logDebug(err.stack);
	}
}

//Vector Zone Translation (15 zones)
function getVectorZone(capId){
	var vZone = "";
	var zoneNum = "";
	try{
		x = getGISInfo("MCPHD","VectorZones","vectorzone");
		zoneNum = x.toString();
		if (x<10){
		vZone = "Vector Zone 0"+zoneNum;
		}
		else
		{vZone = "Vector Zone "+zoneNum;}
			return vZone;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getVectorZone:  " + err.message);
		logDebug(err.stack);
	}
}

//Adulticide Zone Translation (6 zones) 
function getAdulticideZone(capId){
	var aZone = "";
	
	try{
		z1 = getGISInfo("MCPHD","fogging1","foggingname");
		z2 = getGISInfo("MCPHD","fogging2","foggingname");
		z3 = getGISInfo("MCPHD","fogging3","foggingname");
		z4 = getGISInfo("MCPHD","fogging4","foggingname");
		z5 = getGISInfo("MCPHD","fogging5","foggingname");
		z6 = getGISInfo("MCPHD","fogging6","foggingname");
				if (z1 == 1){
		aZone = "Adulticide Zone 01";	
		}
				if (z2 == 2){
		aZone = "Adulticide Zone 02";	
		}
				if (z3 == 3){
		aZone = "Adulticide Zone 03";	
		}
				if (z4 == 4){
		aZone = "Adulticide Zone 04";	
		}
				if (z5 == 5){
		aZone = "Adulticide Zone 05";	
		}
				if (z6 == 6){
		aZone = "Adulticide Zone 06";	
		}
			return aZone;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAdulticideZone:  " + err.message);
		logDebug(err.stack);
	}
}

//Vector Zone Number (15 zones)
function getVectorZoneNum(capId){
	var vZone = "";
	var zoneNum = "";
	try{
		x = getGISInfo("MCPHD","VectorZones","vectorzone");
			return x;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getVectorZone:  " + err.message);
		logDebug(err.stack);
	}
}

//Adulticide Zone Number (6 zones) 
function getAdulticideZoneNum(capId){
	var aZone = "";
	
	try{
		z1 = getGISInfo("MCPHD","fogging1","foggingname");
		z2 = getGISInfo("MCPHD","fogging2","foggingname");
		z3 = getGISInfo("MCPHD","fogging3","foggingname");
		z4 = getGISInfo("MCPHD","fogging4","foggingname");
		z5 = getGISInfo("MCPHD","fogging5","foggingname");
		z6 = getGISInfo("MCPHD","fogging6","foggingname");
				if (z1 == 1){
					aZone = z1;	
		}
				if (z2 == 2){
					aZone = z2;
		}
				if (z3 == 3){
					aZone = z3;
		}
				if (z4 == 4){
					aZone = z4;
		}
				if (z5 == 5){
					aZone = z5;
		}
				if (z6 == 6){
					aZone = z6;
		}
			return aZone;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAdulticideZone:  " + err.message);
		logDebug(err.stack);
	}
}
function getTSIfieldValue(TSIfieldName, workflowTask) {
	try{
		workflowResult = aa.workflow.getTasks(capId); 
        wfObj = workflowResult.getOutput();
        var useTaskSpecificGroupName = true;
		itemCap = capId;
		var itemName = TSIfieldName;
        var stepnumber = 0;
        var taskName = "";
        var taskStatus = "";
        var procCode = "";
		var processID = ""; 
	for (i in wfObj){ 
		stepnumber = wfObj[i].getStepNumber();
		taskName = wfObj[i].getTaskDescription();
		taskStatus = wfObj[i].getDisposition();
		procCode = wfObj[i].getProcessCode();
		processID = wfObj[i].getProcessID();
if (workflowTask == taskName) {		
			TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap,processID,stepnumber,itemName);
 			if (TSIResult.getSuccess())
 				{
	 			var TSI = TSIResult.getOutput();
				if (TSI != null)
					{
					var TSIArray = new Array();
					TSInfoModel = TSI.getTaskSpecificInfoModel();
					var myValue = TSInfoModel.getChecklistComment();
					logDebug(" Item= " + itemName + " myValue=" + myValue);
					var useTaskSpecificGroupName = false;
					return myValue;
					}	
				}
			}
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getTSIfieldValue:  " + err.message);
		logDebug(err.stack);
	}	
}
function addTrashTicketFee() {
	try{
	var tFee='H_T';
		tFee+=AInfo['Ticket Fee'];
			if (!feeExists(tFee,'INVOICED')) {
				updateFee(tFee,'H_TRA','FINAL',1,'Y');	
	}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getTSIfieldValue:  " + err.message);
		logDebug(err.stack);
	}

}
function HHC_CREATE_RCP_CASE() {
	try{
		showMessage = true;
		var saveID = capId;
		var asgnTo = getAppSpecific('Assigned To');
		newChildID = createChild('EnvHealth','EHSM','RCP','NA','');
		copyAppSpecific(newChildID);
		editAppSpecific('TRA Case',capIDString,newChildID);
		editAppSpecific('Assigned To EHS',asgnTo,newChildID);
		copyASITables(saveID,newChildID);
		HHC_GET_ADDRESS_FOR_CHILD();	
	}
	catch(err){
		logDebug("A JavaScript Error occurred: HHC_CREATE_RCP_CASE:  " + err.message);
		logDebug(err.stack);
	}
}
function convertForAssignedTo(areaInspector){
	try{
	var newAreaInspector = '';
	var str = '';
	var res = '';	
	str = areaInspector;
	var xx = str.indexOf("@");
	if (str.indexOf("@")>-1){
		res = str.substring(0, xx);
	}
	else{
		res = str;
		}
		return res;
	}
		
		catch(err)
	{
		logDebug("A JavaScript Error occurred: convertForAssignedTo:  " + err.message);
		logDebug(err.stack);
	}
}
//HHC Custom Functions End
