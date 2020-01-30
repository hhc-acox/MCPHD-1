//GQ: Ticket #173
//Checks results for 2 unsatisfactory in a row, or 3 in 6 weeks and adds a condition
if (String(inspType) == "Pool Test Results" && String(inspResult) == "Unsatisfactory") {
    var inspArr = aa.inspection.getInspections(capId).getOutput();
    var checkDate = new Date(dateAdd(null, -42));
    var inspFound = 0;
    var doAddConn = false;
    var checkArr = [];
    for (var i in inspArr) {
        var insp = inspArr[i];
        if (String(insp.getInspectionType()) == "Pool Test Results") {
            var rdt = insp.getInspectionStatusDate();
            if (rdt != null) {
                var ludt = new Date(dateAdd(rdt, 0));
                if (ludt.getTime() > checkDate.getTime()) {
                    if (matches(String(insp.getInspectionStatus()), "Unsatisfactory", "Satisfactory")) {
                        checkArr.push(insp); //add all to check array for 2 sequential check
                        if (matches(String(insp.getInspectionStatus()), "Unsatisfactory")) {
                            inspFound++;
                            if (inspFound >= 3) {
                                doAddConn = true;
                                logDebug("3 unsatisfactory in prior 42 days");
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    if (!doAddConn) {
        if (checkArr.length > 1) {
            checkArr = checkArr.sort(function (a, b) {
                var z = new Date(dateAdd(a.getInspectionStatusDate(), 0));
                var y = new Date(dateAdd(b.getInspectionStatusDate(), 0));
                if (z.getTime() > y.getTime()) return -1;
                if (z.getTime() < y.getTime()) return 1;
                return 0;
            });

            if (matches(matches(String(checkArr[0].getInspectionStatus()), "Unsatisfactory") && String(checkArr[1].getInspectionStatus()), "Unsatisfactory")) {
                doAddConn = true;
                logDebug("2 sequential unsatisfactory");
            }
        }
    }
    if (doAddConn) {
        logDebug("Add Condition");
        addStdCondition("Test Results", "Unsatisfactory Test Results");
    }
}

if (String(inspType) == "Pool Test Results" && String(inspResult) == "Satisfactory"){
	var capConditions = aa.capCondition.getCapConditions(capId);
	
	if (capConditions.getSuccess()){
		var conditionsOut = capConditions.getOutput();
		if (conditionsOut.length > 0) {
			for (i in conditionsOut) {
				if (conditionsOut[i].conditionDescription == 'Unsatisfactory Test Results' && conditionsOut[i].conditionStatus == 'Applied') {
					aa.capCondition.deleteCapCondition(capId, conditionsOut[i].conditionNumber);
				}
			}
		}
		addCondition = false;
	}
}
