showDebug = true; 
showMessage = true; 

if ((appTypeString.indexOf('WQ') > -1 || appTypeString.indexOf('Radon') > -1) && appTypeString.indexOf('Watershed') < 0) {
    if (inspResult && inspResult != '' && inspResult != 'Scheduled') {
        addSupervisorReview(capId, "INSPECTION", inspId, null, null);
    }
}

addCurrentViolations();
