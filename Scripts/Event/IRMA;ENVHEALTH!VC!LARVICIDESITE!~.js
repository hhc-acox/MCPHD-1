var resultDate = sysDate;
var resultComment = 'Updated by Script';

gName = "VC_LARVICIDE";
gItem = "SITE INFORMATION";
asiGroup = "VC_LVCCKLST";
asiSubGroup = "LARVICIDE";
asiLabel = "Is Site Breeding";
asiLabelSample = "Sample Collected?";
var myResult = getGuidesheetASIValue(inspId, gName, gItem, asiGroup, asiSubGroup, asiLabel);
var sampleResult = getGuidesheetASIValue(inspId, gName, gItem, asiGroup, asiSubGroup, asiLabelSample);
copyParcelGisObjects4XAPO();
var aZone = getAppSpecific('Zone');
if (aZone.indexOf('Vector') < 0) {
    aZone = 'Vector Zone ' + zeroPad(aZone, 2);
}

if (matches(inspResult, 'Technician Complete')) {
    //assign to Mosquito Control Team Leader
    var userID = hhcgetUserByDiscipline('VCMosquito');

    //if (isSupervisor(currentUserID)) {
        if (sampleResult == "Y" || sampleResult == "Yes") {
            userID = hhcgetUserByDiscipline('VCBiology2'); // bio 2 if zone 9 or above
    
            var vcZone = aZone;
            logDebug('Zone: ' + vcZone);
            if (vcZone) {
                vcZone = vcZone.slice(-2);
                logDebug('Zone Substr: ' + vcZone);
                vcZone = parseInt(vcZone);
                logDebug('Zone Parsed: ' + vcZone);
                if (vcZone > 8) {
                    userID = hhcgetUserByDiscipline('VCBiology'); // bio 1 if zone 1-8
                }
            }
            aa.inspection.resultInspection(capId, inspId, 'Waiting on Lab', resultDate, resultComment, getInspector(inspType));
            assignCap(userID);
        }
    //}
    //assignInspection(inspId, userID);
}

if (matches(inspResult, 'Supervisor Reviewed')) {
    //assign to Mosquito Control Biology
    if (sampleResult == "Y" || sampleResult == "Yes") {
        var userID = hhcgetUserByDiscipline('VCBiology2'); // bio 2 if zone 9 or above

        var vcZone = aZone;
        logDebug('Zone: ' + vcZone);
        if (vcZone) {
            vcZone = vcZone.slice(-2);
            logDebug('Zone Substr: ' + vcZone);
            vcZone = parseInt(vcZone);
            logDebug('Zone Parsed: ' + vcZone);
            if (vcZone > 8) {
                userID = hhcgetUserByDiscipline('VCBiology'); // bio 1 if zone 1-8
            }
        }
        aa.inspection.resultInspection(capId, inspId, 'Waiting on Lab', resultDate, resultComment, getInspector(inspType));
        assignCap(userID);
        //assignInspection(inspId, userID);
    }
}

if (matches(inspResult, 'Lab Complete')) {
    var techByZone = lookup("GIS - Larvicide Techs", aZone);
    logDebug('Breeding: ' + myResult);
    logDebug('Sample: ' + sampleResult);
    if (myResult == "Y" || myResult == "Yes") {
        scheduleInspectDate("Larvicide", nextWorkDay(dateAdd(inspResultDate, 13)), getInspector(inspType));
        //aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
        updateAppStatus("Active");
    }
    if (sampleResult == "Y" || sampleResult == "Yes") {
        var userID = hhcgetUserByDiscipline('VCBiology2'); // bio 2 if zone 9 or above

        var vcZone = aZone;
        logDebug('Zone: ' + vcZone);
        if (vcZone) {
            vcZone = vcZone.slice(-2);
            logDebug('Zone Substr: ' + vcZone);
            vcZone = parseInt(vcZone);
            logDebug('Zone Parsed: ' + vcZone);
            if (vcZone > 8) {
                userID = hhcgetUserByDiscipline('VCBiology'); // bio 1 if zone 1-8
            }
        }
        assignCap(userID);
    }
}
