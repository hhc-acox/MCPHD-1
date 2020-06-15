function addCurrentViolations() {
	if (appTypeString.indexOf('LHH') > -1) {
		var asitRes = aa.appSpecificTableScript.getAppSpecificTableModel(capId, 'VIOLATIONS');
		
		if(asitRes.getSuccess()) {
            removeASITable('VIOLATIONS');
			try {
                inspResultObj = aa.inspection.getInspections(capId);

                if (inspResultObj.getSuccess()) {
                    inspList = inspResultObj.getOutput();

                    for (i in inspList) {
                        if (inspId == inspList[i].getIdNumber()) {
                            var gs = getGuideSheetObjects(inspList[i].getIdNumber());
                    
                            for (i in gs) {
                                if (gs[i].gsType == 'LHH_Violations') {
                                    gs[i].loadInfoTables();

                                    var tableRows = gs[i].infoTables["VIOLATIONS"];
                                    
                                    for (j in tableRows) {
                                        var status = tableRows[j]["Status"];
                                        var date = tableRows[j]["Date"];
                                        var violation = tableRows[j]["Violation"];
                                        var xrf = tableRows[j]["XRF Result"];
                                        var explanation = tableRows[j]["Explanation"];
                                        var location = tableRows[j]["Location"];
                                        var dir = tableRows[j]["DIR"];
                                        var dhcb = tableRows[j]["DH/CB"];
                                        var oc = tableRows[j]["OC"];
                                        var ip = tableRows[j]["IP"];
                                        var other = tableRows[j]["Other"];
        
                                        if(!status){
                                            status = "";
                                        }
                                        if(!date){
                                            date = "";
                                        }
                                        if(!violation){
                                            violation = "";
                                        }
                                        if(!xrf){
                                            xrf = "";
                                        }
                                        if(!explanation){
                                            explanation = "";
                                        }
                                        if(!location){
                                            location = "";
                                        }
                                        if(!dir){
                                            dir = "";
                                        }
                                        if(!dhcb){
                                            dhcb = "";
                                        }
                                        if(!oc){
                                            oc = "";
                                        }
                                        if(!ip){
                                            ip = "";
                                        }
                                        if(!other){
                                            other = "";
                                        }
                                        var rowVals = new Array();
                                        rowVals["Status"] = new asiTableValObj("Status", status, "Y");
                                        rowVals["Date"] = new asiTableValObj("Date", date, "Y");
                                        rowVals["Violation"] = new asiTableValObj("Violation", violation, "Y");
                                        rowVals["XRF Result"] = new asiTableValObj("XRF Result", xrf, "Y");
                                        rowVals["Explanation"] = new asiTableValObj("Explanation", explanation, "Y");
                                        rowVals["Location"] = new asiTableValObj("Location", location, "Y");
                                        rowVals["DIR"] = new asiTableValObj("DIR", dir, "Y");
                                        rowVals["DH/CB"] = new asiTableValObj("DH/CB", dhcb, "Y");
                                        rowVals["OC"] = new asiTableValObj("OC", oc, "Y");
                                        rowVals["IP"] = new asiTableValObj("IP", ip, "Y");
                                        rowVals["Other"] = new asiTableValObj("Other", other, "Y");
                                        var asitName = "VIOLATIONS";
                                        addToASITable(asitName, rowVals, capId);
                                    }
                                }
                            }
                        }
                    }
                }
			} catch (err) {
				logDebug("A JavaScript Error occurred: Adding Violations to ASIT:  " + err.message);
				logDebug(err.stack);
			}
		}
	} else {
		var asitRes = aa.appSpecificTableScript.getAppSpecificTableModel(capId, 'CURRENT VIOLATIONS');

		if (asitRes.getSuccess()) {
			try {
				inspResultObj = aa.inspection.getInspections(capId);

				if (inspResultObj.getSuccess()) {
					inspList = inspResultObj.getOutput();
					//inspList.sort(compareInspDateDesc)
					//var inspectionId = inspList[0].getIdNumber();
					var inspectionId = inspId;
					inspObj = aa.inspection.getInspection(capId, inspectionId).getOutput();
					//var inspectionDate = inspObj.getInspectionDate().getMonth() + '/' + inspObj.getInspectionDate().getDayOfMonth() + '/' + inspObj.getInspectionDate().getYear();
					//var inspectionDate = aa.util.parseDate(inspObj.getInspectionDate());
					aa.print("inspectionId " + inspectionId);
					aa.print("inspectiondate " + inspResultDate);
					var appChapter = '';
					var appChecklistItem = '';
					var appStatus = '';
					appStatus = inspResult;
					var appLocation = '';
					var appViolation = '';
					var appInspDate = inspResultDate;
					var appInspNumber = inspectionId.toString();
					var appInspector = getInspectorByInspID(inspId);
					aa.print("getInspectionType " + inspType);
					aa.print("getInspector " + appInspector);
					aa.print("appStatus " + appStatus);
				}

				// Clear CURRENT VIOLATIONS if submitted inspection is an Initial or Routine, but not recheck
				if ((inspType.indexOf('Initial') > -1 || inspType.indexOf('Routine') > -1) && inspType.indexOf('Recheck') < 0) {
					removeASITable('CURRENT VIOLATIONS');
				}

				for (i in inspList) {
					if (inspList[i].getIdNumber() == inspectionId) {
						var inspTyp = inspList[i].getInspectionType();
						var inspStatus = inspList[i].getInspectionStatus();
						var inspModel = inspList[i].getInspection();
						var gs = inspModel.getGuideSheets();
						for (var i = 0; i < gs.size(); i++) {
							var guideSheetObj = gs.get(i);
                            var guidesheetItem = guideSheetObj.getItems();
                            var guidesheetName = guideSheetObj.getGuideType().toUpperCase();
							for (var j = 0; j < guidesheetItem.size(); j++) {
								var item = guidesheetItem.get(j);
								var itemText = item.getGuideItemText();
								var itemStatus = item.getGuideItemStatus();
								var gsStandardComment = item.getGuideItemComment();
                                var guideItemASITs = item.getItemASITableSubgroupList();

                                if (matches(itemStatus, 'IN') && guidesheetName.indexOf('FAILED') > -1) {
									logDebug("Item Name:                 " + itemText);
									logDebug("Item Status:                 " + itemStatus);
									var n = itemText.indexOf("|");
                                    logDebug("n " + n);
                                    var chpt = "";
                                    var itemTextLength = itemText.lastIndexOf("");
                                    var vioDesc = "";

                                    if(n == -1){
                                        chpt = itemText;
                                        vioDesc = "";
                                    } else {
                                        chpt = itemText.slice(0, n - 1);
                                        vioDesc = itemText.slice(n + 2, itemTextLength);
                                    }
									appChapter = chpt;
									logDebug("chpt " + chpt);
                                    
									appChecklistItem = vioDesc;
									logDebug("vioDesc " + vioDesc);
									logDebug("itemText.length " + itemTextLength);
									appStatus = itemStatus;
									appViolation = gsStandardComment;
									logDebug("Standard Comment:   " + gsStandardComment);
									logDebug("---------------------------");

									for (var k = 0; k < guideItemASITs.size(); k++) {
										var ASITSubGroup = guideItemASITs.get(k);
										var tableArr = new Array();
										var columnArr = new Array();
										var ASITGroupName = ASITSubGroup.getGroupName();
										logDebug("ASITGroupName: " + ASITGroupName);
										var ASITTableName = ASITSubGroup.getTableName();
										logDebug("ASITTableName: " + ASITTableName);
										var columnList = ASITSubGroup.getColumnList();

										for (var l = 0; l < columnList.size(); l++) {
											var column = columnList.get(l);
											var columnName = column.getColumnName();
											var values = column.getValueMap().values();
											var iteValues = values.iterator();
											while (iteValues.hasNext()) {
												logDebug("Guidesheet Column: " + column.getColumnName());
												var ii = iteValues.next();
												var zeroBasedRowIndex = ii.getRowIndex() - 1;
												if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
												tableArr[zeroBasedRowIndex][column.getColumnName()] = ii.getAttributeValue();
												appLocation = ii.getAttributeValue();
												logDebug("Guidesheet Value: " + ii.getAttributeValue());
												logDebug("---------------------------");
											}
                                        }

                                        var srchTable = new Array();
                                        var tableUpdated = false;
                                        srchTable = loadASITable('CURRENT VIOLATIONS');

                                        if (srchTable) {
                                            logDebug("Loaded ASIT");
                                            for (x in srchTable) {
                                                thisRow = srchTable[x];
                                                logDebug("This Chapter: " + thisRow['Chapter'].toString());
                                                logDebug("Chapter to Check: " + appChapter);
                                                if (thisRow['Chapter'].toString() == appChapter) {
                                                    tableUpdated = true;
                                                    thisRow['Status'] = new asiTableValObj("Status", 'IN', "N");
                                                    thisRow['Corrected Date'] = new asiTableValObj("Corrected Date", appInspDate, "N");
                                                }
                                            }

                                            if (tableUpdated) {
                                                removeASITable('CURRENT VIOLATIONS');
                                                addASITable('CURRENT VIOLATIONS', srchTable);
                                            }
                                        }
									}
                                }
                                
								if (matches(itemStatus, 'OUT', 'COS') && itemText.indexOf('Failed') < 0) {
									logDebug("Item Name:                 " + itemText);
									logDebug("Item Status:                 " + itemStatus);
									var n = itemText.indexOf("|");
                                    logDebug("n " + n);
                                    var chpt = "";
                                    var itemTextLength = itemText.lastIndexOf("");
                                    var vioDesc = "";

                                    if(n == -1){
                                        chpt = itemText;
                                        vioDesc = "";
                                    } else {
                                        chpt = itemText.slice(0, n - 1);
                                        vioDesc = itemText.slice(n + 2, itemTextLength);
                                    }
									appChapter = chpt;
									logDebug("chpt " + chpt);
                                    
									appChecklistItem = vioDesc;
									logDebug("vioDesc " + vioDesc);
									logDebug("itemText.length " + itemTextLength);
									appStatus = itemStatus;
									appViolation = gsStandardComment;
									logDebug("Standard Comment:   " + gsStandardComment);
									logDebug("---------------------------");

									for (var k = 0; k < guideItemASITs.size(); k++) {
										var ASITSubGroup = guideItemASITs.get(k);
										var tableArr = new Array();
										var columnArr = new Array();
										var ASITGroupName = ASITSubGroup.getGroupName();
										logDebug("ASITGroupName: " + ASITGroupName);
										var ASITTableName = ASITSubGroup.getTableName();
										logDebug("ASITTableName: " + ASITTableName);
										var columnList = ASITSubGroup.getColumnList();

										for (var l = 0; l < columnList.size(); l++) {
											var column = columnList.get(l);
											var columnName = column.getColumnName();
											var values = column.getValueMap().values();
											var iteValues = values.iterator();
											while (iteValues.hasNext()) {
												logDebug("Guidesheet Column: " + column.getColumnName());
												var ii = iteValues.next();
												var zeroBasedRowIndex = ii.getRowIndex() - 1;
												if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
												tableArr[zeroBasedRowIndex][column.getColumnName()] = ii.getAttributeValue();
												appLocation = ii.getAttributeValue();
												logDebug("Guidesheet Value: " + ii.getAttributeValue());
												logDebug("---------------------------");
											}
										}

										// Add item to CURRENT VIOLATIONS if submitted type is Initial/Routine/Recheck/Routine - Recheck
										if (inspType.indexOf('Initial') > -1 || inspType.indexOf('Routine') > -1 || inspType.indexOf('Recheck') > -1) {
											//removeASITable('CURRENT VIOLATIONS');		
											var rowVals = new Array();
											rowVals["Chapter"] = new asiTableValObj("Chapter", appChapter, "N");
											rowVals["Checklist Item"] = new asiTableValObj("Checklist Item", appChecklistItem, "N");
											rowVals["Status"] = new asiTableValObj("Status", appStatus, "N");
											rowVals["Location"] = new asiTableValObj("Location", appLocation, "N");
											rowVals["Violation"] = new asiTableValObj("Violation", appViolation, "N");
											rowVals["Inspection Date"] = new asiTableValObj("Inspection Date", appInspDate, "N");
											rowVals["Inspection Number"] = new asiTableValObj("Inspection Number", appInspNumber, "N");
											rowVals["Inspection Type"] = new asiTableValObj("Inspection Type", inspType, "N");
                                            rowVals["Inspector"] = new asiTableValObj("Inspector", appInspector, "N");

                                            var rowVals2 = rowVals;
                                            rowVals2["Corrected Date"] = new asiTableValObj("Corrected Date", "", "N");
                                            rowVals2["Id"] = new asiTableValObj("Id", "", "N");

											var asitName = "CURRENT VIOLATIONS";
											addToASITable(asitName, rowVals2, capId);

											//var ASITInspId = searchASITable("VIOLATION HISTORY", "Inspection Number", inspId, capId);
                                                                                        var ASITInspId = searchASITableThreeVal("VIOLATION HISTORY", "Inspection Number", inspId, "Chapter", appChapter, "Checklist Item",appChecklistItem, capId)
											//var ASITGuideItem = searchASITable("VIOLATION HISTORY","Checklist Item",appChecklistItem,capId);

											if (!ASITInspId) {
												var logFileName = "VIOLATION HISTORY";
												addToASITable(logFileName, rowVals, capId);
                                            }
                                            
                                            appLocation = "";
										}
									}
								}
							}
						}
					}
				}
			} catch (err) {
				logDebug("A JavaScript Error occurred: Adding Violations to ASIT:  " + err.message);
				logDebug(err.stack);
			}
		}
	}
}
