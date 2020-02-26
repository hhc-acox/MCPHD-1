		showMessage = true; useTaskSpecificGroupName = true; 
        workflowResult = aa.workflow.getTasks(capId); 
        wfObj = workflowResult.getOutput();
        var useTaskSpecificGroupName = true;
		itemCap = capId;
		var itemName = 'Reinspection Date';
        var stepnumber = 0;
        var taskName = "";
        var taskStatus = "";
        var procCode = "";
		var processID = ""; 
		var atask = "";

        for (i in wfObj){ 
		stepnumber = wfObj[i].getStepNumber();
		taskName = wfObj[i].getTaskDescription();
		taskStatus = wfObj[i].getDisposition();
		procCode = wfObj[i].getProcessCode();
		processID = wfObj[i].getProcessID();
if (wfTask == taskName) {		
			TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap,processID,stepnumber,itemName);
 			if (TSIResult.getSuccess())
 				{

	 			var TSI = TSIResult.getOutput();
				if (TSI != null)
					{
					var TSIArray = new Array();
					TSInfoModel = TSI.getTaskSpecificInfoModel();
					var theDate = TSInfoModel.getChecklistComment();
					logDebug(" Item=" + itemName + " Value=" + theDate);
					logDebug('thetask '+taskName);
					logDebug('The WF Task is '+wfTask);
								
					}	
				}
			}
		}				


	if (wfTask == "Initial Processing" && matches(wfStatus,"Complete Notice of Violation","Complete Emergency") && !matches(theDate,"",null,"undefined")) {
		inspId = scheduleInspectDateReturnInspID("Reinspection",theDate,AInfo["Assigned To"]);
		copyLeadViolations(inspId);
	}

if (wfTask == "Initial Processing" && matches(wfStatus,"Complete Notice of Violation","Complete Emergency") && matches(theDate,"",null,"undefined")) {
	scheduleInspectDate("Reinspection",nextWorkDay(dateAdd(null,29)),AInfo["Assigned To"]);
	editTaskSpecific("Initial Processing","Reinspection Date",nextWorkDay(dateAdd(null,29)));
	}
	
if (wfTask == "Initial Processing" && wfStatus == "Complete Lead No Hzd Found Ltr") {
	activateTask("Final Processing");
	}

if (wfTask == "Reinspection" && matches(wfStatus,"Reinspection","Complete Reinspection Ltr","Complete Next Action Court Ltr","Complete Lead Reinspection Ltr") && !matches(theDate,"",null,"undefined")) {
	inspId = scheduleInspectDateReturnInspID("Reinspection",theDate,AInfo["Assigned To"]);
	copyLeadViolations(inspId);
	}

if (wfTask == "Reinspection" && matches(wfStatus,"Reinspection","Complete Reinspection Ltr","Complete Next Action Court Ltr") && matches(theDate,"",null,"undefined")) {
	scheduleInspectDate("Reinspection",nextWorkDay(dateAdd(null,29)),AInfo["Assigned To"]);
	editTaskSpecific("Reinspection","Reinspection Date",nextWorkDay(dateAdd(null,29)));
	}
	
if (wfTask == "Reinspection" && wfStatus == "Court Case") {
comment(" appTypeArray[0] - "+ appTypeArray[0]+"appTypeArray[1] - "+appTypeArray[1]+" appTypeArray[2] - "+appTypeArray[2]+" appTypeArray[3] - "+appTypeArray[3]);
	HHC_CREATE_COURT();
	}
if (wfTask == "Reinspection"  && matches(wfStatus,"Court Case")) {
	activateTask("Final Processing");
	}

if (wfTask == "Final Processing" && (wfStatus == "Yearly Inspection") && !matches(theDate,"",null,"undefined")) {
	inspId = scheduleInspectDateReturnInspID("Reinspection",theDate,AInfo["Assigned To"]);
	copyLeadViolations(inspId);
	}

if (wfTask == "Final Processing" && (wfStatus == "Yearly Inspection") && matches(theDate,"",null,"undefined")) {
	inspId = scheduleInspectDateReturnInspID("Reinspection",nextWorkDay(dateAdd(null,364)),lookup("Census - Lead EHS",AInfo["ParcelAttribute.CensusTract"]));
	copyLeadViolations(inspId);
	editTaskSpecific("Final Processing","Reinspection Date",nextWorkDay(dateAdd(null,364)));
	}

if (wfTask == "Final Processing" && (wfStatus == "Permanent Injunction") && !matches(theDate,"",null,"undefined")) {
	inspId = scheduleInspectDateReturnInspID("Reinspection",theDate,AInfo["Assigned To"]);
	copyLeadViolations(inspId);
	}
	
if (wfTask == "Final Processing" && (wfStatus == "Permanent Injunction") && (matches(theDate,"",null,"undefined"))) {
	scheduleInspectDate("Reinspection",nextWorkDay(dateAdd(null,179)),AInfo["Assigned To"]);
	editTaskSpecific("Final Processing","Reinspection Date",nextWorkDay(dateAdd(null,179)));
	}

	if (wfTask == "Education Provided" && wfStatus == "Reinspect" && !matches(theDate,"",null,"undefined")) {
		inspId = scheduleInspectDateReturnInspID("Reinspection",theDate,AInfo["Assigned To"]);
		copyLeadViolations(inspId);
	}

if (wfTask == "Education Provided" && matches(wfStatus,"Complete Lead No Hzd Found Ltr")) {
	assignTask("Education Provided",AInfo["Assigned To"]);
	}

useTaskSpecificGroupName = false; 
