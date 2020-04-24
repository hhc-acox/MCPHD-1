function scheduleFoodInspections(iType, DaysAhead, inspectorId, tCapId) {
    var inspRes = scheduleInspectionAndReturnId(iType, DaysAhead, inspectorId);

    if (inspRes) {
        doGuidesheetAutomation(inspRes, iType);
        doFoodsChecklists(inspRes, tCapId);
    }
}
