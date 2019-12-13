//HHC_doWorkflowActions
function HHC_doWorkflowActions() {
    try {
        //see if any records are set up--module can be specific or "ALL", look for both
        var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
        if (sepScriptConfig.getSuccess()) {
            var sepScriptConfigArr = sepScriptConfig.getOutput();
            if (sepScriptConfigArr.length < 1) {
                var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
                if (sepScriptConfig.getSuccess()) {
                    var sepScriptConfigArr = sepScriptConfig.getOutput();
                }
            }
            if (sepScriptConfigArr.length > 0) {
                for (sep in sepScriptConfigArr) {
                    var cfgCapId = sepScriptConfigArr[sep].getCapID();
                    var sepRules = loadASITable("ACTIONS FROM WORKFLOW", cfgCapId);
                    if (sepRules.length > 0) {
                        //comment("wfTask "+wfTask);
                        //comment("wfStatus "+wfStatus);
                        for (row in sepRules) {
                            //Workflow Required
                            var cTask = "" + sepRules[row]["Current Task"];
                            var SubmittedTaskStatus = "" + sepRules[row]["Submitted Task Status"];
                            if (sepRules[row]["Active"] == "Yes" && matches(wfTask, cTask) && matches(wfStatus, SubmittedTaskStatus)) {
                                //Inspection fields
                                var InspTypeToSchedule = "" + sepRules[row]["Insp Type to Schedule"];
                                var DaysToScheduleInTheFuture = "" + sepRules[row]["Days_to_Schedule_in_the_Future"]; //number of days in the future
                                var InspAssignedTo = "" + sepRules[row]["Insp_Assigned_To"];
                                //New Workflow Info
                                var New_Task = "" + sepRules[row]["New Task"];
                                var newTaskStatus = "" + sepRules[row]["New Task Status"];
                                var WorkflowAssignedTo = "" + sepRules[row]["Workflow_Assigned_To"];
                                //Record Info
                                var newRecordStatus = "" + sepRules[row]["New Record Status"];
                                var RecordAssignedTo = "" + sepRules[row]["Record_Assigned_To"];
                                //Current Inspector on Workflow
                                var assignedToWorkflow = "" + getAssignedToRecord(); //needs to be developed. Using assigned to record for now.
                                //Person Assigned to the Record
                                var assignedToRecordInspector = getAssignedToRecord();
                                //Current Department
                                var currentDepartment = HHC_getMyDepartment(assignedToWorkflow);
                                //Supervisor of Current Inspector
                                var supervisorOfInspector = "";
                                var recType = "" + sepRules[row]["Record Type"];
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
                                        supervisorOfInspector = HHC_getMyTeamLeadersUserID(assignedToWorkflow);
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
                                //Setup variables
                                var recordAssignment = '';
                                var inspectorAssignment = '';
                                var assignedInspector = '';
                                var workflowAssignment = '';
                                //comment('88 - supervisorOfAssignedToRecord '+supervisorOfAssignedToRecord);
                                //Record Type Validation
                                if (matches(wfTask, cTask) && matches(wfStatus, SubmittedTaskStatus)) {
                                    //comment("line 54 - Record Type Validation - section reached");
                                    var appMatch = true;
                                    var recdType = "" + sepRules[row]["Record Type"];
                                    var recdTypeArr = "" + recdType;
                                    var arrAppType = recdTypeArr.split("/");
                                    if (arrAppType.length != 4) {
                                        logDebug("The record type is incorrectly formatted: " + recdType);
                                        return false;
                                    } else {
                                        for (xx in arrAppType) {
                                            if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")) {
                                                appMatch = false;
                                            }
                                        }
                                    }
                                    //if the record is okay					
                                    if (appMatch) {
                                        //Record Assignment if one is selected
                                        //comment("RecordAssignedTo.length "+RecordAssignedTo.length);
                                        if (RecordAssignedTo.length > 0) {
                                            if (RecordAssignedTo == 'Current Department') {
                                                recordAssignment = currentDepartment;
                                            }
                                            if (RecordAssignedTo == 'Current Inspector') {
                                                recordAssignment = assignedToInspection;
                                            }
                                            if (RecordAssignedTo == 'Person Assigned to the Record') {
                                                recordAssignment = assignedToRecordInspector;
                                            }
                                            if (RecordAssignedTo == 'Supervisor of Current Inspector') {
                                                recordAssignment = supervisorOfInspector;
                                            }
                                            if (RecordAssignedTo == 'Supervisor of Person Assigned to Record') {
                                                recordAssignment = supervisorOfAssignedToRecord;
                                            }
                                            if (RecordAssignedTo == 'Support Staff') {
                                                recordAssignment = supportStaff;
                                            }
                                            if (matches(RecordAssignedTo, 'Supervisor of Person Assigned to Record', 'Current Inspector', 'Person Assigned to the Record', 'Supervisor of Current Inspector')) {
                                                assignCap(recordAssignment);
                                            }
                                            if (matches(RecordAssignedTo, 'Current Department', 'Support Staff')) {
                                                HHC_assignDeptCap(recordAssignment);
                                            }
                                        }
                                        //Inspection Assignment if one is selected
                                        if (InspAssignedTo.length > 0) {
                                            if (InspAssignedTo == 'Current Department') {
                                                inspectorAssignment = currentDepartment;
                                            }
                                            if (InspAssignedTo == 'Current Inspector') {
                                                inspectorAssignment = assignedToInspection;
                                            }
                                            if (InspAssignedTo == 'Person Assigned to the Record') {
                                                inspectorAssignment = assignedToRecordInspector;
                                            }
                                            if (InspAssignedTo == 'Supervisor of Current Inspector') {
                                                inspectorAssignment = supervisorOfInspector;
                                            }
                                            if (InspAssignedTo == 'Supervisor of Person Assigned to Record') {
                                                inspectorAssignment = supervisorOfAssignedToRecord;
                                            }
                                            if (InspAssignedTo == 'Support Staff') {
                                                inspectorAssignment = supportStaff;
                                            }
                                            assignedInspector = inspectorAssignment;
                                        }
                                        //Workflow Assignment if one is selected
                                        //comment("WorkflowAssignedTo.length "+WorkflowAssignedTo.length);
                                        if (WorkflowAssignedTo.length > 0) {
                                            if (WorkflowAssignedTo == 'Current Department') {
                                                workflowAssignment = currentDepartment;
                                            }
                                            if (WorkflowAssignedTo == 'Current Inspector') {
                                                workflowAssignment = assignedToInspection;
                                            }
                                            if (WorkflowAssignedTo == 'Person Assigned to the Record') {
                                                workflowAssignment = assignedToRecordInspector;
                                            }
                                            if (WorkflowAssignedTo == 'Supervisor of Current Inspector') {
                                                workflowAssignment = supervisorOfInspector;
                                            }
                                            if (WorkflowAssignedTo == 'Supervisor of Person Assigned to Record') {
                                                workflowAssignment = supervisorOfAssignedToRecord;
                                            }
                                            if (WorkflowAssignedTo == 'Support Staff') {
                                                workflowAssignment = supportStaff;
                                            }
                                        }
                                        //comment('99 - workflowAssignment '+workflowAssignment);
                                        //comment("100 - cTask.length "+cTask.length);
                                        //comment("SubmittedTaskStatus.length "+SubmittedTaskStatus.length);
                                        //comment("InspTypeToSchedule.length "+InspTypeToSchedule.length);

                                        if (cTask.length > 0 && SubmittedTaskStatus.length > 0 && InspTypeToSchedule.length > 0) {

                                            if (matches(InspAssignedTo, 'Supervisor of Person Assigned to Record', 'Current Inspector', 'Person Assigned to the Record', 'Supervisor of Current Inspector')) {

                                                if (DaysToScheduleInTheFuture > 0) {
                                                    scheduleInspectDate(InspTypeToSchedule, nextWorkDay(dateAdd(null, DaysToScheduleInTheFuture)), assignedInspector); //schedule inspection using #ofDays field
                                                } else {
                                                    scheduleInspectDate(InspTypeToSchedule, nextWorkDay(dateAdd(null, 0)), assignedInspector); //schedule inspection for tomorrow
                                                }
                                            }
                                            if (matches(InspAssignedTo, 'Current Department', 'Support Staff')) {

                                                if (DaysToScheduleInTheFuture > 0) {
                                                    scheduleInspectDate(InspTypeToSchedule, nextWorkDay(dateAdd(null, DaysToScheduleInTheFuture)), null); //schedule inspection using #ofDays field
                                                } else {
                                                    scheduleInspectDate(InspTypeToSchedule, nextWorkDay(dateAdd(null, 0)), null); //schedule inspection for tomorrow
                                                }
                                                assignInspection(inspId, assignedInspector); //Assignment when just the department is provided
                                            }

                                        }
                                        //comment("132 - cTask.length "+cTask.length);
                                        //comment("SubmittedTaskStatus.length "+SubmittedTaskStatus.length);
                                        //comment("workflowTask.length "+ cTask.length);
                                        //comment("newTaskStatus.length>0 "+newTaskStatus.length);
                                        //comment('136 - workflowAssignment '+workflowAssignment);
                                        if (matches(wfTask, cTask) && matches(wfStatus, SubmittedTaskStatus) && New_Task.length > 0 && newTaskStatus.length > 0) {
                                            updateTask(New_Task, newTaskStatus, 'Updated by script');
                                            if (WorkflowAssignedTo.length > 0 && matches(WorkflowAssignedTo, 'Supervisor of Person Assigned to Record', 'Current Inspector', 'Person Assigned to the Record', 'Supervisor of Current Inspector')) {
                                                //comment('142 - workflowAssignment '+workflowAssignment);
                                                assignTask(New_Task, workflowAssignment);
                                            }
                                            if (WorkflowAssignedTo.length > 0 && matches(WorkflowAssignedTo, 'Current Department', 'Support Staff')) {

                                                updateTaskDepartment(New_Task, workflowAssignment);
                                            }
                                        }

                                        if (matches(wfTask, cTask) && matches(wfStatus, "Court", "Court Case", "Refer to Court") && matches(SubmittedTaskStatus, "Court", "Court Case", "Refer to Court")) {
                                            HHC_CREATE_COURT();
                                        }
                                        if (matches(wfTask, cTask) && matches(wfStatus, SubmittedTaskStatus) && New_Task == 'Close' && newTaskStatus == 'Closed') {
                                            closeTask('Close', 'Closed', 'Closed by Script', 'Closed by Script');
                                        }
                                        var customFunctions = "" + sepRules[row]["Custom_Functions"];
                                        var chkFilter = "" + customFunctions;
                                        comment("Custom Function b4: " + customFunctions);
                                        if (chkFilter.length > 0) {
                                            eval(customFunctions);
                                            comment("Custom Function after: " + customFunctions);
                                        } else {
                                            //logDebug("ACTIONS FROM WORKFLOW: Check filter resolved to false: " + chkFilter);
                                        }
                                    } else {
                                        //logDebug("ACTIONS FROM WORKFLOW: No app match: " + recdTypeArr);
                                    }
                                } else {
                                    logDebug("ACTIONS FROM WORKFLOW: No Workflow type and Result match: " + cTask + "/" + SubmittedTaskStatus);
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        logDebug("A JavaScript Error occurred: function HHC_doWorkflowActions:  " + err.message);
        logDebug(err.stack)
    }
}
