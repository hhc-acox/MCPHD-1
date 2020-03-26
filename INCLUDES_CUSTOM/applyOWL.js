function applyOWL(tCapId) {
    var r = aa.inspection.getInspections(tCapId);

    if (r.getSuccess()) {
        var inspArray = r.getOutput();

        for (i in inspArray) {
            if (inspArray[i].getIdNumber() == inspId) {
                var inspModel = inspArray[i].getInspection();

                var gs = inspModel.getGuideSheets();

                if (gs) {
                    for (var i = 0; i < gs.size(); i++) {
                        var guideSheetObj = gs.get(i);
                        var guidesheetName = guideSheetObj.getGuideType()

                        if (guidesheetName.indexOf('License Notifications') > -1) {
                            var guidesheetItem = guideSheetObj.getItems();

                            for (var j = 0; j < guidesheetItem.size(); j++) {
    
                                var item = guidesheetItem.get(j);
    
                                if (item) {
                                    if (item.getGuideItemText() == 'Notification of Operation without a License' && item.getGuideItemStatus() == 'Yes') {
                                        var typeOfEst = getAppSpecific("Total Square Feet of the Facility DD");
                                        var tfeeAmt = 0;
                                
                                        if (typeOfEst == '0-3,000'){
                                            tfeeAmt = 98;
                                        } else if (typeOfEst == '3,000-30,000'){
                                            tfeeAmt = 129.75;
                                        } else if (typeOfEst == '30,001-40,000'){
                                            tfeeAmt = 159.5;
                                        } else if (typeOfEst == '40,001-60,000'){
                                            tfeeAmt = 194.5;
                                        } else if (typeOfEst == '60,0001+' || typeOfEst == '60,001+'){
                                            tfeeAmt = 232.75;
                                        }
                                
                                        if (tfeeAmt > 0){
                                            // apply fee
                                            feeSeq = addFee('FS0030', 'FS_GENERAL', 'FINAL', tfeeAmt, 'Y');
                                        }
                                    }
                                }
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
