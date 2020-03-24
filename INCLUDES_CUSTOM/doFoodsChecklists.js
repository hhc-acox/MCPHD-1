function doFoodsChecklists(inspectionId, tCapId) {
    var r = aa.inspection.getInspections(tCapId);

    if (r.getSuccess()) {
        var inspArray = r.getOutput();

        for (i in inspArray) {
            if (inspArray[i].getIdNumber() == inspectionId) {
                var inspModel = inspArray[i].getInspection();

                var gs = inspModel.getGuideSheets();

                if (gs) {
                    for (var i = 0; i < gs.size(); i++) {
                        var guideSheetObj = gs.get(i);
                        var guidesheetName = guideSheetObj.getGuideType()

                        if (guidesheetName.indexOf('410 IAC 7-24') > -1) {
                            var guidesheetItem = guideSheetObj.getItems();

                            for (var j = 0; j < guidesheetItem.size(); j++) {
    
                                var item = guidesheetItem.get(j);
    
                                if (item) {
    
                                    var gItemName = item.getGuideItemText().trim();
                                    var stdChoiceKey = guidesheetName + ' | ' + gItemName;
    
                                    var severity = lookup('FS_Severity', stdChoiceKey);
                                    var correctiveAction = lookup('FS_CorrectiveAction', stdChoiceKey);
    
                                    if (severity || correctiveAction) {
    
                                        var ASISubGroups = item.getItemASISubgroupList();
    
                                        if (ASISubGroups) {
    
                                            for (var k = 0; k < ASISubGroups.size(); k++) {
                                                var ASISubGroup = ASISubGroups.get(k);
                                                var ASIModels = ASISubGroup.getAsiList();
                                                if (ASIModels) {
    
                                                    for (var m = 0; m < ASIModels.size(); m++) {
                                                        var ASIModel = ASIModels.get(m);
                                                        if (ASIModel && severity && ASIModel.getAsiName() == 'Severity') {
                                                            // set severity
                                                            ASIModel.setAttributeValue(severity);
                                                        }
    
                                                        if (ASIModel && correctiveAction && ASIModel.getAsiName() == 'Corrective Action') {
                                                            // set corrective action
                                                            ASIModel.setAttributeValue(correctiveAction);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
    
                            //Update the guidesheet
                            var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj, guideSheetObj.getAuditID());
                            if (updateResult.getSuccess()) {
                                logDebug("Successfully updated " + guidesheetName + " on inspection " + inspectionId + ".");
                            } else {
                                logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                            }
                        }
                    }

                } else {
                    // if there are guidesheets
                    logDebug("No guidesheets for this inspection");
                }
            }
        }
    } else {
        logDebug("No inspections on the record");
    }
}
