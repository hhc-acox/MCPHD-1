function scheduleFoodInspectionsByDate(iType, dateToSched, inspectorId, tCapId) {
    var inspRes = scheduleInspectDateAndReturnId(iType, dateToSched, inspectorId);

    if (inspRes) {
        doFoodsChecklists(inspRes, tCapId);
    }
}
