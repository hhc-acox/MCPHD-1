function scheduleFoodInspectionsByDate(iType, dateToSched, inspectorId, tCapId) {
    var inspRes = scheduleInspectDateAndReturnId(iType, dateToSched, inspectorId);

    if (inspRes) {
        doGuidesheetAutomation(inspRes, iType);
        doFoodsChecklists(inspRes, tCapId);
    }
}
