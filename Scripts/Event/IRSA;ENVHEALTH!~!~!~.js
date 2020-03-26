showDebug = true; 
showMessage = true; 

if (appTypeString.indexOf('WQ') > -1 || appTypeString.indexOf('Radon')) {
    addSupervisorReview(capId, "INSPECTION", inspId, null, null);
}

addCurrentViolations();
