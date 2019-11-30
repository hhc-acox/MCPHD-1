function HHC_doCaseCreationActions(){
	
	try{
		sepScriptConfigArr = new Array();
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
		}
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepRules = loadASITable("ACTIONS FOR CASE CREATION",cfgCapId);
				if(sepRules.length>0){
					var assignmentForType;
					for(row in sepRules){
						if(sepRules[row]["Active"]=="Yes"){
							var recType = ""+sepRules[row]["Record Type"];
							var appMatch = '';
							var recdTypeArr = "" + recType;
							var arrAppType = recdTypeArr.split("/");
							var complaintType = ""+sepRules[row]["Complaint Type"];
							var ResidentialOrCommercial = ""+sepRules[row]["Residential or Commercial"];
							var RecordAssignmentChoice = ""+sepRules[row]["Record Assignment Choice"];
							var RecordAssignmentValue = ""+sepRules[row]["Name of Discipline"];
							var LayerName = ""+sepRules[row]["GIS Layer Name"]; 
							var IdField = ""+sepRules[row]["GIS Id Field"];
							var myDept = arrAppType[1];
							var mySubDept = arrAppType[2];
							switch(true) {
								case RecordAssignmentChoice == 'Inspector by Discipline':
								case RecordAssignmentChoice == 'Supervisor by Discipline':
								//if there is more than 1 person in a discipline, assign to the department
									var sysUserList;
									var sysUserResult = aa.people.getSysUserListByDiscipline(RecordAssignmentValue);											
									if (sysUserResult.getSuccess()) {
											sysUserList = sysUserResult.getOutput().toArray();
											if (sysUserList.length>1)	{
												//More than 1 person, assign to department
												var userId = sysUserList[0].getUserID();
												HHC_getMyDepartment(userId);
											}
											else {
												//Assigned to person	
												RecordAssignedTo = hhcgetUserByDiscipline(RecordAssignmentValue);
											}
									}
									break;																			
								case RecordAssignmentChoice == 'Inspector by GIS Zone':
									zone = getGISInfo("MCPHD", LayerName, IdField);
									comment('the LayerName is: '+LayerName);
									comment('the IdField is: '+IdField);
									comment('the zone is: '+zone);
									comment('Department is :'+arrAppType[1]);
									comment('The variable myDept is '+myDept);
									comment('The variable mySubDept is '+mySubDept);
									
									if (zone && zone != "undefined" && zone != null && LayerName == 'FoodsDistrict')
										RecordAssignedTo = lookup('GIS - Foods EHS',zone); 
									else if (zone && zone != "undefined" && zone != null && LayerName == 'PoolInspectorDistrict')
										RecordAssignedTo = lookup('GIS - Pools EHS',zone); 
									else if (zone && zone != "undefined" && zone != null && LayerName == 'WellsPumpsOWTS')
										RecordAssignedTo = lookup('GIS - WellsPumpsOWTS EHS',zone); 
									else if (zone && zone != "undefined" && zone != null && LayerName == 'EHSMQuadrantDistrict')
										RecordAssignedTo = lookup('GIS - EHSM Inspector',zone); 
									else
										RecordAssignedTo = null;
									break;	
								default:
									RecordAssignedTo = 'undefined';
							} 
	
							var recordAssignment = RecordAssignedTo;
	
							//Record Type Validation
							if(recType.length>0){
								var appMatch = true;
								var recType = ""+sepRules[row]["Record Type"];
								var recdTypeArr = "" + recType;
								var arrAppType = recdTypeArr.split("/");
								if (arrAppType.length != 4){								
									appMatch = false;
								}else{
									for (index in arrAppType){
										if (!arrAppType[index].equals(appTypeArray[index]) && !arrAppType[index].equals("*")){
											appMatch = false;
										}
									}
								}
									//If assignment rule for this type
									if(appMatch) {
										//Record Assignment
										assignmentForType = recordAssignment;
									}
								}
							
						}
					}
					
					// Escape loop
					if(assignmentForType) {
						aa.print("Assigned cap to " + assignmentForType);
					assignCap(assignmentForType);
					}

					// Close Case Intakes
					if(aa.workflow.getTask(capId, 'Case Intake').getSuccess() === true) {
                                                if(appTypeString.indexOf('WQ') > 0 || (appTypeString.indexOf('Food') > 0 && appTypeString.indexOf('Complaint') < 0)) {
						closeTask('Case Intake', 'Complete', 'Closed by Script', 'Closed by Script');
						if(assignmentForType) {
							assignTask('Complaint Review', assignmentForType);
						}
}
					}
				}
			}
		}
	}
		catch(err){
		logDebug("A JavaScript Error occurred: function HHC_doCaseCreationActions:  " + err.message);
		logDebug(err.stack)
	}
	}
	
