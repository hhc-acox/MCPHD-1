function scheduleFoodInspections(iType, DaysAhead, inspectorId, tCapId) {
    var inspRes = scheduleInspectionAndReturnId(iType, DaysAhead, inspectorId);

    if (inspRes) {
        doFoodsChecklists(inspRes, tCapId);
    }
}
