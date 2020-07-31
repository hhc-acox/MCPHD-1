function HHC_doInspectionActions(){
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
                    var sepRules = loadASITable("ACTIONS FROM INSPECTIONS",cfgCapId);
                    var inspScheduled = false;
                    if(sepRules.length>0){
                        for(row in sepRules){
                            if(sepRules[row]["Active"]=="Yes"){
                                var cInspType = ""+sepRules[row]["Curr_Insp_Type"];
                                var InspResultSubmitted = ""+sepRules[row]["Insp_Result_Submitted"];
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
                                //aa.print("App Type String " + recdTypeArr);
                                
                                if(appMatch && ((cInspType == inspType || cInspType == 'any') && (InspResultSubmitted == inspResult || InspResultSubmitted == 'any'))) {
                                    var InspTypeToSchedule = ""+sepRules[row]["Insp_Type_to_Schedule"];
                                    var UseRecheckDate = ""+sepRules[row]["Use_Recheck_Date"]; //'Yes/No' field
                                    var RecheckDate;
                                    //logDebug('USERECHECKDATE: ' + UseRecheckDate);
                                    if (getRecheckDate(capId)) {
                                        RecheckDate = getRecheckDate(capId);
                                    } else if (hhcgetInspRecheckDate(capId,inspId)) {
                                        RecheckDate = hhcgetInspRecheckDate(capId,inspId);
                                    } else {
                                        if (appTypeString.indexOf('WQ') < 0) {
                                            UseRecheckDate = 'No';
                                        }
                                    } //give the variable a value anyway
                                    logDebug('USERECHECKDATE: ' + UseRecheckDate);
                                    var DaysToScheduleInTheFuture = ""+sepRules[row]["Days_toSchedule_in_the_Future"]; //number of days in the future
                                    var RecordAssignedTo = ""+sepRules[row]["Record_Assigned_To"];
                                    var InspAssignedTo = ""+sepRules[row]["Insp_Assigned_To"];
                                    var workflowTask = ""+sepRules[row]["Workflow_Task"];
                                    var newWorkflowStatus = ""+sepRules[row]["New_Workflow_Status"];
                                    var WorkflowAssignedTo = ""+sepRules[row]["Workflow_Assigned_To"];
                                //Need to develop a function for each selection in the assignment field
                                        
                                //Current Inspector
                                    var assignedToInspection = getInspectorByInspID(inspId);
                                //Person Assigned to the Record
                                    var assignedToRecordInspector = getAssignedToRecord();
                                //Current Department
                                    var currentDepartment = HHC_getMyDepartment(assignedToInspection);
                                //Supervisor of Current Inspector
                                    var supervisorOfInspector = "";
                                    var recType = ""+sepRules[row]["Record Type"];
                                    var deptstring = recType.split("/");
                                    //EnvHealth/WQ/Body Art/Application - EnvHealth/Food/FarmersMarketVendor/Application - EnvHealth/WQ/Childcare/Application
                                    switch (true) {
                                        case deptstring[2] == 'Body Art':
                                            supervisorOfInspector = hhcgetUserByDiscipline('WQBodyArtSupv');
                                            break;															
                                        case deptstring[2] == 'FarmersMarketVendor':
                                            supervisorOfInspector = hhcgetUserByDiscipline('FoodsFarmersMarketVendor');
                                            break;															
                                        case deptstring[2] == 'Childcare':
                                            supervisorOfInspector = hhcgetUserByDiscipline('WQChildCareSupv');
                                            break;	
                                        case deptstring[2] == 'FoodsFarmersMarketEvent':
                                            supervisorOfInspector = hhcgetUserByDiscipline('FoodsFarmersMarketEvent');
                                            break;					
                                        default:
                                            supervisorOfInspector = HHC_getMyTeamLeadersUserID(assignedToRecordInspector);
                                                    }
                                    //Supervisor of Person Assigned to Record
                                    var supervisorOfAssignedToRecord = "";
                                    //EnvHealth/WQ/Body Art/Application - EnvHealth/Food/FarmersMarketVendor/Application - EnvHealth/WQ/Childcare/Application
                                    switch (true) {
                                        case deptstring[2] == 'Body Art':
                                            supervisorOfAssignedToRecord = hhcgetUserByDiscipline('WQBodyArtSupv');
                                            break;															
                                        case deptstring[2] == 'FarmersMarketVendor':
                                            supervisorOfAssignedToRecord = hhcgetUserByDiscipline('FoodsFarmersMarketVendor');
                                            break;															
                                        case deptstring[2] == 'Childcare':
                                            supervisorOfAssignedToRecord = hhcgetUserByDiscipline('WQChildCareSupv');
                                            break;	
                                        case deptstring[2] == 'FoodsFarmersMarketEvent':
                                            supervisorOfAssignedToRecord = hhcgetUserByDiscipline('FoodsFarmersMarketEvent');
                                            break;					
                                        default:
                                            supervisorOfAssignedToRecord = HHC_getMyTeamLeadersUserID(assignedToRecordInspector);
                                                    }	
                                //to get Support Staff Method
                                    var supportStaff = HHC_getMySupportStaffDepartment(assignedToRecordInspector);
                                    var recordAssignment = '';
                                    var inspectorAssignment = '';
                                    var assignedInspector = '';
                                    var workflowAssignment = '';
                        //comment('51 - supervisorOfAssignedToRecord '+supervisorOfAssignedToRecord);
                    //Record Type Validation
                                    if(cInspType.length>0 && InspResultSubmitted.length>0){
                                        //comment("line 54 - Record Type Validation - section reached");
                                        if (appMatch && ((cInspType == inspType || cInspType == 'any') && (InspResultSubmitted == inspResult || InspResultSubmitted == 'any'))){
                    //Record Assignment if one is selected
                                        //comment("RecordAssignedTo.length "+RecordAssignedTo.length);
                                            if(RecordAssignedTo.length>0){
                                            if(RecordAssignedTo == 'Current Department'){recordAssignment = currentDepartment; }
                                            if(RecordAssignedTo == 'Current Inspector'){recordAssignment = assignedToInspection; }
                                            if(RecordAssignedTo == 'Person Assigned to the Record'){recordAssignment = assignedToRecordInspector; }
                                            if(RecordAssignedTo == 'Supervisor of Current Inspector'){recordAssignment = supervisorOfInspector; }
                                            if(RecordAssignedTo == 'Supervisor of Person Assigned to Record'){recordAssignment = supervisorOfAssignedToRecord; }
                                            if(RecordAssignedTo == 'Support Staff'){recordAssignment = supportStaff; }
                                            if(matches(RecordAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector')){
                                            assignCap(recordAssignment);
                                        }
                                        if(matches(RecordAssignedTo,'Current Department','Support Staff')){
                                            HHC_assignDeptCap(recordAssignment);
                                        }
                                            }
                    //Inspection Assignment if one is selected
                                            if(InspAssignedTo.length>0){
                                            if(InspAssignedTo == 'Current Department'){inspectorAssignment = currentDepartment; }
                                            if(InspAssignedTo == 'Current Inspector'){inspectorAssignment = assignedToInspection; }
                                            if(InspAssignedTo == 'Person Assigned to the Record'){inspectorAssignment = assignedToRecordInspector; }
                                            if(InspAssignedTo == 'Supervisor of Current Inspector'){inspectorAssignment = supervisorOfInspector; }
                                            if(InspAssignedTo == 'Supervisor of Person Assigned to Record'){inspectorAssignment = supervisorOfAssignedToRecord; }
                                            if(InspAssignedTo == 'Support Staff'){inspectorAssignment = supportStaff; }
                                            assignedInspector = inspectorAssignment;
                                            }
                    //Record Assignment if one is selected
                                        //comment("WorkflowAssignedTo.length "+WorkflowAssignedTo.length);
                                            if(WorkflowAssignedTo.length>0){
                                            if(WorkflowAssignedTo == 'Current Department'){workflowAssignment = currentDepartment; }
                                            if(WorkflowAssignedTo == 'Current Inspector'){workflowAssignment = assignedToInspection; }
                                            if(WorkflowAssignedTo == 'Person Assigned to the Record'){workflowAssignment = assignedToRecordInspector; }
                                            if(WorkflowAssignedTo == 'Supervisor of Current Inspector'){workflowAssignment = supervisorOfInspector; }
                                            if(WorkflowAssignedTo == 'Supervisor of Person Assigned to Record'){workflowAssignment = supervisorOfAssignedToRecord; }
                                            if(WorkflowAssignedTo == 'Support Staff'){workflowAssignment = supportStaff; }
                                            }
                                            //comment('99 - workflowAssignment '+workflowAssignment);
                                            //comment("100 - cInspType.length "+cInspType.length);
                                            //comment("InspResultSubmitted.length "+InspResultSubmitted.length);
                                            //comment("InspTypeToSchedule.length "+InspTypeToSchedule.length);
                                                if(cInspType.length>0 && InspResultSubmitted.length>0 && InspTypeToSchedule.length>0){
                                                    //define assignedInspector		
                                                    if(cInspType == inspType && (InspResultSubmitted == inspResult || InspResultSubmitted == 'any') && !inspScheduled) {
                                                        if(matches(InspAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector')){
                                                            if(UseRecheckDate == 'Yes' || UseRecheckDate == 'Y' || RecheckDate) {
                                                                if(RecheckDate == null || RecheckDate == undefined) {
                                                                    cancel = true;
                                                                } else {
                                                                    if (appTypeString.indexOf('Food') > -1) {
                                                                        scheduleFoodInspectionsByDate(InspTypeToSchedule, RecheckDate, assignedInspector, capId);
                                                                        inspScheduled = true;
                                                                    } else {
                                                                        scheduleInspectDate(InspTypeToSchedule,RecheckDate,assignedInspector); //schedule inspection using recheck date
                                                                        inspScheduled = true;
                                                                    }
                                                                }
                                                            }
                                                            else if(UseRecheckDate == 'Yes' || UseRecheckDate == 'Y' || RecheckDate){
                                                                if (appTypeString.indexOf('Food') > -1) {
                                                                    scheduleFoodInspectionsByDate(InspTypeToSchedule, RecheckDate, assignedInspector, capId);
                                                                    inspScheduled = true;
                                                                } else {
                                                                    scheduleInspectDate(InspTypeToSchedule,RecheckDate,assignedInspector); //schedule inspection using recheck date
                                                                    inspScheduled = true;
                                                                }
                                                            }
                                                            else if((UseRecheckDate == 'No' || UseRecheckDate == 'N') && DaysToScheduleInTheFuture>0){
                                                                if (appTypeString.indexOf('Food') > -1) {
                                                                    scheduleFoodInspectionsByDate(InspTypeToSchedule, nextWorkDay(dateAdd(null,DaysToScheduleInTheFuture)), assignedInspector, capId);
                                                                    inspScheduled = true;
                                                                } else {
                                                                    scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,DaysToScheduleInTheFuture)),assignedInspector);//schedule inspection using #ofDays field
                                                                    inspScheduled = true;
                                                                }
                                                            }
                                                            else 
                                                            {
                                                                if (appTypeString.indexOf('Food') > -1) {
                                                                    scheduleFoodInspectionsByDate(InspTypeToSchedule, nextWorkDay(dateAdd(null,0)), assignedInspector, capId);
                                                                    inspScheduled = true;
                                                                } else {
                                                                    scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,0)),assignedInspector); //schedule inspection for tomorrow
                                                                    inspScheduled = true;
                                                                }
                                                            }
                                                        }
                                                        if(matches(InspAssignedTo,'Current Department')){
                                                            if(UseRecheckDate == 'Yes' || UseRecheckDate == 'Y') {
                                                                if(RecheckDate == null || RecheckDate == undefined) {
                                                                    cancel = true;
                                                                } else {
                                                                    if (appTypeString.indexOf('Food') > -1) {
                                                                        scheduleFoodInspectionsByDate(InspTypeToSchedule, RecheckDate, null, capId);
                                                                        inspScheduled = true;
                                                                    } else {
                                                                        scheduleInspectDate(InspTypeToSchedule,RecheckDate,null); //schedule inspection using recheck date
                                                                        inspScheduled = true;
                                                                    }
                                                                }
                                                            }
                                                            else if((UseRecheckDate == 'No' || UseRecheckDate == 'N') && DaysToScheduleInTheFuture>0){
                                                                if (appTypeString.indexOf('Food') > -1) {
                                                                    scheduleFoodInspectionsByDate(InspTypeToSchedule, nextWorkDay(dateAdd(null,DaysToScheduleInTheFuture)), null, capId);
                                                                    inspScheduled = true;
                                                                } else {
                                                                    scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,DaysToScheduleInTheFuture)),null);//schedule inspection using #ofDays field
                                                                    inspScheduled = true;
                                                                }
                                                            }
                                                            else 
                                                            { 
                                                                if (appTypeString.indexOf('Food') > -1) {
                                                                    scheduleFoodInspectionsByDate(InspTypeToSchedule, nextWorkDay(dateAdd(null,0)), null, capId);
                                                                    inspScheduled = true;
                                                                } else {
                                                                    scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,0)),null); //schedule inspection for tomorrow
                                                                    inspScheduled = true;
                                                                }
                                                            }
                                                            assignInspection(inspId, assignedInspector);
                                                        }
                                                    }											
                                                }
                                            //comment("177 - cInspType.length "+cInspType.length);
                                            //comment("InspResultSubmitted.length "+InspResultSubmitted.length);
                                            //comment("workflowTask.length "+ workflowTask.length);
                                            //comment("newWorkflowStatus.length>0 "+newWorkflowStatus.length);
                                            //comment('181 - workflowAssignment '+workflowAssignment);
                                                if(cInspType.length>0 && InspResultSubmitted.length>0 && workflowTask.length>0 && newWorkflowStatus.length>0){
                                                    if((cInspType == 'any' || cInspType.length>0) && (InspResultSubmitted == 'any' || InspResultSubmitted.length>0)){ 
                                                        updateTask(workflowTask,newWorkflowStatus,'Updated by script');
                                                        invokeWTUA(workflowTask, newWorkflowStatus);
                                                    }
                                                    if(cInspType == inspType && InspResultSubmitted == inspResult) {
                                                        if(WorkflowAssignedTo.length>0 && matches(WorkflowAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector')){
                                                    //comment('187 - workflowAssignment '+workflowAssignment);
                                                                assignTask(workflowTask,workflowAssignment);
                                                            }
                                                        if(WorkflowAssignedTo.length>0 && matches(WorkflowAssignedTo,'Current Department')){
                                                    
                                                                updateTaskDepartment(workflowTask, workflowAssignment);
                                                            }
                                                    }
                                                }
                                                var customFunctions = ""+sepRules[row]["Custom_Functions"];
                                                var chkFilter = ""+customFunctions;
                                            if (chkFilter.length>0) {
                                                eval(customFunctions);
                                            }else{
                                                //logDebug("ACTIONS FROM INSPECTIONS: Check filter resolved to false: " + chkFilter);
                                            }
                                        }
                                        else{
                                            //logDebug("ACTIONS FROM INSPECTIONS: No app match: " + recdTypeArr);
                                        }
                                    }else{
                                        logDebug("ACTIONS FROM INSPECTIONS: No Inspection type and Result match: " + cInspType + "/" + InspResultSubmitted);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
        catch(err){
        logDebug("A JavaScript Error occurred: function HHC_doInspectionActions:  " + err.message);
        logDebug(err.stack)
    }
    }
