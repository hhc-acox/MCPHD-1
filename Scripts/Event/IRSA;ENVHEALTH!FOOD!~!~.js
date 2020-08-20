try {
    applyOWL(capId);
} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message);
}
try {
    applyCitationAmount(capId);
} catch (err) {
    logDebug("A JavaScript Error occured applying citation: " + err.message);
}
try {
    if (inspType && inspResult) {
        if ((inspType == 'Routine' ||(inspType == 'Recheck' && appTypeString.indexOf('Application') < 0)) && (inspResult == 'In Compliance' || inspResult == 'Non-Compliance/Case Closed')) {
            var risk = getAppSpecific('Risk');
            var riskInt = 90;
    
            if (risk && risk != '') {
                riskInt = parseInt(risk, 10);
            }
    
            var recordInspector = getAssignedToRecord();
    
            if (recordInspector && recordInspector != '') {
                scheduleFoodInspectionsByDate('Routine', nextWorkDay(dateAdd(null,riskInt)), recordInspector, capId);
            } else {
                scheduleFoodInspectionsByDate('Routine', nextWorkDay(dateAdd(null,riskInt)), null, capId);
            }
        }
    }
} catch (err) {
    logDebug("A JavaScript Error occured scheduling routine: " + err.message);
}
