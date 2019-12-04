//IRSA;ENVHEALTH!WQ!~!~
try{

inspResultObj = aa.inspection.getInspections(capId);
removeASITable('CURRENT VIOLATIONS');
	if (inspResultObj.getSuccess())
	{
	inspList = inspResultObj.getOutput();
	inspList.sort(compareInspDateDesc)
	var inspectionId = inspList[0].getIdNumber();
	inspObj = aa.inspection.getInspection(capId,inspectionId).getOutput();
	//var inspectionDate = inspObj.getInspectionDate().getMonth() + '/' + inspObj.getInspectionDate().getDayOfMonth() + '/' + inspObj.getInspectionDate().getYear();
	var inspectionDate = aa.util.parseDate(inspObj.getInspectionDate());
	aa.print("inspectionId "+inspectionId);
	aa.print("inspectiondate "+inspectionDate);
	var appChapter = '';
	var appChecklistItem = '';
	var appStatus = '';
	appStatus = inspList[0].getInspectionStatus();
	var appLocation = '';
	var appViolation = '';
	var appInspDate = inspectionDate;
	var	appInspNumber = inspectionId.toString();
	var appInspType = '';
		appInspType = inspList[0].getInspectionType();
	var appInspector = getLastInspector(appInspType);
	var rowVals = new Array();
	aa.print("getInspectionType "+appInspType);
	aa.print("getInspector "+appInspector);
	aa.print("appStatus "+appStatus);
	}
		for(i in inspList) {
			if (inspList[i].getIdNumber() == inspectionId){
				var inspType = inspList[i].getInspectionType();
				var inspStatus = inspList[i].getInspectionStatus();
				var inspModel = inspList[i].getInspection();
				var gs = inspModel.getGuideSheets();
						for(var i=0;i< gs.size();i++) {
							var guideSheetObj = gs.get(i);
							var guidesheetItem = guideSheetObj.getItems();
								for(var j=0;j< guidesheetItem.size();j++) {
								var item = guidesheetItem.get(j);
								var itemText = item.getGuideItemText();
								var itemStatus = item.getGuideItemStatus();
								var gsStandardComment = item.getGuideItemComment();
								var guideItemASITs = item.getItemASITableSubgroupList();
									if(matches(itemStatus,'OUT','COS')) {
											logDebug("Item Name:                 " + itemText);
											logDebug("Item Status:                 " + itemStatus);
										var n = itemText.lastIndexOf("-");
											logDebug("n "+n);
										var chpt = itemText.slice(0, n-1);
										appChapter = chpt;
											logDebug("chpt "+chpt);
										var itemTextLength = itemText.lastIndexOf("");
										var vioDesc = itemText.slice(n+2,itemTextLength);
										appChecklistItem = vioDesc;
											logDebug("vioDesc "+vioDesc);
											logDebug("itemText.length "+itemTextLength);
										appStatus = itemStatus;
										appViolation = gsStandardComment;
											logDebug("Standard Comment:   "+gsStandardComment);
											logDebug("---------------------------");
												for(var k=0;k< guideItemASITs.size();k++) {
													var ASITSubGroup = guideItemASITs.get(k);
													var tableArr = new Array();
													var columnList = ASITSubGroup.getColumnList();
														for (var l = 0; l < columnList.size() ; l++ )
														{
															var column = columnList.get(l);
															var values = column.getValueMap().values();
															var iteValues = values.iterator();
																while(iteValues.hasNext()){
																	var ii = iteValues.next();
																	var zeroBasedRowIndex = ii.getRowIndex()-1;
																	if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
																	tableArr[zeroBasedRowIndex][column.getColumnName()] = ii.getAttributeValue();
																	logDebug("Guidesheet Column: " + tableArr[zeroBasedRowIndex][column.getColumnName()]);
																	//FIND THE FIELD TITLE AND FILTER ON IT
																	//appLocation = ii.getAttributeValue().toString();
																	appLocation = 'Test';
																	logDebug("Guidesheet Value: " + ii.getAttributeValue());
																}
														}
															rowVals["Chapter"] = new asiTableValObj("Chapter", appChapter, "N"); 
															rowVals["Checklist Item"] = new asiTableValObj("Checklist Item", appChecklistItem, "N"); 
															rowVals["Status"] = new asiTableValObj("Status", appStatus, "N"); 
															rowVals["Location"] = new asiTableValObj("Location", appLocation, "N"); 
															rowVals["Violation"] = new asiTableValObj("Violation", appViolation, "N"); 
															rowVals["Inspection Date"] = new asiTableValObj("Inspection Date", appInspDate, "N"); 
															rowVals["Inspection Number"] = new asiTableValObj("Inspection Number", appInspNumber, "N"); 
															rowVals["Inspection Type"] = new asiTableValObj("Inspection Type", appInspType, "N"); 
															rowVals["Inspector"] = new asiTableValObj("Inspector", appInspector, "N"); 
															var asitName = "CURRENT VIOLATIONS";
															var logFileName = "VIOLATION HISTORY"
															addToASITable(asitName, rowVals, capId);
															addToASITable(logFileName, rowVals, capId);
							}
						}
					}
				}
			}
		}
	}
				catch(err) {
				logDebug("A JavaScript Error occurred: Adding Violations to ASIT:  " + err.message);
				logDebug(err.stack);
			}
