function addCurrentViolations() {
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
                aa.print("inspectiondate " + inspSchedDate);
                var appChapter = '';
                var appChecklistItem = '';
                var appStatus = '';
                appStatus = inspResult;
                var appLocation = '';
                var appViolation = '';
                var appInspDate = inspSchedDate;
                var appInspNumber = inspectionId.toString();
                var appInspector = getLastInspector(inspType);
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
                        for (var j = 0; j < guidesheetItem.size(); j++) {
                            var item = guidesheetItem.get(j);
                            var itemText = item.getGuideItemText();
                            var itemStatus = item.getGuideItemStatus();
                            var gsStandardComment = item.getGuideItemComment();
                            var guideItemASITs = item.getItemASITableSubgroupList();
                            if (matches(itemStatus, 'OUT', 'COS')) {
                                logDebug("Item Name:                 " + itemText);
                                logDebug("Item Status:                 " + itemStatus);
                                var n = itemText.lastIndexOf("-");
                                logDebug("n " + n);
                                var chpt = itemText.slice(0, n);
                                appChapter = chpt;
                                logDebug("chpt " + chpt);
                                var itemTextLength = itemText.lastIndexOf("");
                                var vioDesc = itemText.slice(n + 1, itemTextLength);
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
                                        var asitName = "CURRENT VIOLATIONS";
                                        addToASITable(asitName, rowVals, capId);

                                        var ASITInspId = searchASITable("VIOLATION HISTORY", "Inspection Number", inspId, capId);
                                        //var ASITGuideItem = searchASITable("VIOLATION HISTORY","Checklist Item",appChecklistItem,capId);

                                        if (!ASITInspId)
                                            var logFileName = "VIOLATION HISTORY";
                                        addToASITable(logFileName, rowVals, capId);
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
