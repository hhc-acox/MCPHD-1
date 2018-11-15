function sepGetReqdDocs() {
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfigArr = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
		}
		if(sepScriptConfigArr.length>0){
			var retArray = [];
			if(publicUser){
				var submittedDocList = aa.document.getDocumentListByEntity(capId,"TMP_CAP").getOutput().toArray();
			}else{
				var vEventName = aa.env.getValue("EventName");
				if(vEventName.indexOf("Before")>-1){
					var submittedDocList = aa.env.getValue("DocumentModelList");
					if(submittedDocList){
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
				for (var counter = 0; counter < submittedDocList.size(); counter++) {
					var doc = submittedDocList.get(counter);
					logDebug("category: " + doc.getDocCategory()) ;
					uploadedDocs[doc.getDocGroup() +"-"+ doc.getDocCategory()] = true;
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
							logDebug("The record type is incorrectly formatted: " + ats);
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

function sepEmailNotifContact(recdType, contactType, respectPriChannel, notName, rName, taskName, taskStatus, sysFromEmail, addtlQuery) {
try{
	if((matches(taskName,null,"","undefined") || wfTask==""+taskName) && wfStatus == ""+taskStatus){
		var appMatch = true;
		var recdTypeArr = "" + recdType
		var arrAppType = recdTypeArr.split("/");
		if (arrAppType.length != 4){
			logDebug("The record type is incorrectly formatted: " + ats);
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
				var emailNotif = false;
				var cntType = ""+contactType;
				var priContact = getContactObj(capId,cntType);
				if(priContact){
					var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
					if(!matches(priChannel, "",null,"undefined", false)){
						if(!respectPriChannel || priChannel.indexOf("Email") > -1 || priChannel.indexOf("E-mail") > -1){
							emailNotif = true;
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
						emailNotif = true;
					}
					if(emailNotif){
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
						if(emailRpt){
							sendNotificationSEP(sysFromEmail,priEmail,"",""+notName,eParams, rFiles,capId);
						}else{
							rFiles = [];
							sendNotificationSEP(sysFromEmail,priEmail,"",""+notName,eParams, rFiles);
						}
					}
				}else{
					logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
				}
			}
		}
	}
}catch(err){
	logDebug("An error occurred in sepEmailNotifContact: " + err.message);
	logDebug(err.stack);
}}

function sendNotificationSEP(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{
	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

function sepUpdateFees(arrFees) {
try{
	for(row in arrFees){
		if(arrFees[row]["Active"]=="Yes"){
			var taskName = ""+arrFees[row]["Task Name"];
			var taskStatus = ""+arrFees[row]["Task Status"];
			if(!matches(taskName,"",null,"undefined" || wfTask==taskName) && wfStatus==taskStatus){
				var appMatch = true;
				var recdType = ""+arrFees[row]["Record Type"];
				var recdTypeArr = "" + recdType;
				var arrAppType = recdTypeArr.split("/");
				if (arrAppType.length != 4){
					logDebug("The record type is incorrectly formatted: " + ats);
					return false;
				}else{
					for (xx in arrAppType){
						if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
							appMatch = false;
						}
					}
				}
				if (appMatch){
					var addtlQuery = ""+arrFees[row]["Additional Query"];
					var chkFilter = ""+addtlQuery;
					if (chkFilter.length==0 ||eval(chkFilter) ) {
						var cFld = ""+arrFees[row]["Custom Field"];
						var custFld = cFld.trim();
						var cVal = ""+arrFees[row]["Custom Field Value"];
						var custVal = cVal.trim();
						if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
							var fcode = ""+arrFees[row]["Fee Code"];
							var fsched = ""+arrFees[row]["Fee Schedule"];
							var fperiod = ""+arrFees[row]["Fee Period"];
							var feeQty = ""+arrFees[row]["Fee Quantity"];
							if(isNaN(feeQty)){
								var fqty = parseFloat(AInfo[feeQty]);
							}else{
								var fqty = parseFloat(feeQty);
							}
							var finvoice = ""+arrFees[row]["Fee Code"];
							var pDuplicate = ""+arrFees[row]["Duplicate Fee"];
							// If optional argument is blank, use default logic (i.e. allow duplicate fee if invoiced fee is found)
							if (pDuplicate == null || pDuplicate.length == 0){
								pDuplicate = "Yes";
							}else{
								pDuplicate = pDuplicate.toUpperCase();
							}
							var invFeeFound = false;
							var adjustedQty = fqty;
							var feeSeq = null;
							feeUpdated = false;
							getFeeResult = aa.finance.getFeeItemByFeeCode(capId, fcode, fperiod);
							if (getFeeResult.getSuccess()) {
								var feeList = getFeeResult.getOutput();
								for (feeNum in feeList) {
									if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
										if (pDuplicate == "Yes") {
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
											if (finvoice == "Yes") {
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
							if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == "Yes")){
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
	logDebug("An error occurred in sepUpdateFee: " + err.message);
	logDebug(err.stack);
}}
