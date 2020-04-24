function doGuidesheetAutomation() {
    try{
        var tinspId = inspId;
        var tinspType = inspType;

        if (arguments.length == 1) {
            tinspId = arguments[0];
        }

        if (arguments.length == 2) {
            tinspId = arguments[0];
            tinspType = arguments[1];
        }

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
                    var sepRules = loadASITable("APPLY DYNAMIC GUIDESHEET",cfgCapId);

                    if (sepRules) {
                        if(sepRules.length>0){
                            for(row in sepRules){
                                if(sepRules[row]["Active"]=="Yes"){
                                    var cInspType = ""+sepRules[row]["Inspection Type"];
    
                                    var appMatch = true;
                                    var excludeApp = false;
                                    var excludeInsp  = false;
                                    var customValid = true;
    
                                    var recdType = ""+sepRules[row]["Record Type"];
                                    var recdTypeArr = "" + recdType;
                                    var arrAppType = recdTypeArr.split("/");
    
                                    var exrecdType = ""+sepRules[row]["Exclude Record Type"];
                                    var exrecdTypeArr = "" + exrecdType;
                                    var exarrAppType = exrecdTypeArr.split(",");
    
                                    var exInspType = ""+sepRules[row]["Exclude Inspection Type"];
                                    var exInspTypeArr = "" + exInspType;
                                    var exarrInspType = exInspTypeArr.split(",");
    
                                    var guideType = ""+sepRules[row]["Include Guidesheet"];
                                    var guideTypeArr = "" + guideType;
                                    var arrGuideType = guideTypeArr.split(",");
    
                                    var cFld = ""+sepRules[row]["Custom Field Name"];
                                    var custFld = cFld.trim();
                                    var cVal = ""+sepRules[row]["Custom Field Value"];
                                    var custVal = cVal.trim();
    
                                    if (!matches(custFld,"",null,"undefined")) {
                                        if (getAppSpecific(custFld) != custVal) {
                                            customValid = false;
                                        }
                                    }
    
                                    for(exType in exarrAppType) {
                                        exarrAppType[exType] = exarrAppType[exType].split("/");
                                    }
    
                                    if (arrAppType.length != 4){
                                        logDebug("The record type is incorrectly formatted: " + recdType);
                                        return false;
                                    }else{
                                        for (xx in arrAppType){
                                            if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
                                                appMatch = false;
                                            }
                                        }
    
                                        for (yy in exarrAppType) {
                                            if ((exarrAppType[yy][1] == arrAppType[1] || arrAppType[1] == '*') && (exarrAppType[yy][2] == arrAppType[2] || arrAppType[2] == '*') && (exarrAppType[yy][3] == arrAppType[3] || arrAppType[3] == '*')) {
                                                excludeApp = true;
                                            }
                                        }
    
                                        for (zz in exarrInspType) {
                                            if (exarrInspType == tinspType) {
                                                excludeInsp = true;
                                            }
                                        }
                                    }
                                    
                                    if(appMatch && !excludeApp && !excludeInsp && customValid && (cInspType == tinspType || cInspType == 'any' || cInspType == '')) {
                                        var tProxy = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness");
    
                                        if (tProxy.getSuccess()) {
                                            var tProxyOut = tProxy.getOutput();
                                            var inspIdInt = parseInt(tinspId);
                                            var guidesheets = tProxyOut.getGGuideSheetByInspectionID(capId,inspIdInt);
    
                                            if (guidesheets) {
                                                for (var j = 0; j < guidesheets.size(); j++) {
                                                    var removeGGD = true;
                                                    var tGuideSheet = guidesheets.get(j);
    
                                                    if (tGuideSheet) {
                                                        for (jj in arrGuideType) {
                                                            if (arrGuideType[jj] == tGuideSheet.getGuideType()) {
                                                                removeGGD = false;
                                                            }
                                                        }
    
                                                        if (removeGGD) {
                                                            logDebug('Removing: ' + tGuideSheet.getGuideType());
                                                            var res = tProxyOut.removeGGuideSheet(capId,tinspId,tGuideSheet.getGuideType(),'ADMIN');
                                                        }
                                                    }
                                                }
                                            }
                                        }
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
        logDebug("A JavaScript Error occurred: function doGuidesheetAutomation:  " + err.message);
        logDebug(err.stack)
    }
}
