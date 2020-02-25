try {
    var gs = getGuideSheetObjects(inspId);
    for (xx in gs){
        if (gs[xx].text == 'Notification of Operation without a License' && gs[xx].status == 'Yes'){
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
} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message);
}
