var EMAIL_FROM = "accela-noreply@marionhealth.org";
//GQ: Ticket #173
//Checks results for 2 unsatisfactory in a row, or 3 in 6 weeks and adds a condition

if (String(inspType) == "Pool Test Results" && String(inspResult) == "Unsatisfactory") {

    //GQ: TICKET #263 -- RESCHEDULE & NOTIFY
    var assignedToRecord = getAssignedToRecord();

    var capContactResult = aa.people.getCapContactByCapID(capId);
    var emailAddress="";
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts)
            if (Contacts[yy].getCapContactModel().getPrimaryFlag() == "Y")
                if (Contacts[yy].getEmail() != null)
                    emailAddress = "" + Contacts[yy].getEmail();
    }

    if (emailAddress.indexOf("@") > 0) {
        var eParams = aa.util.newHashtable();
        eParams.put("$$CAPID$$", capIDString);
        eParams.put("$$INSPTYPE$$", inspType);
        eParams.put("$$inspResult$$", inspResult);	
        /*
        sendNotification(
            EMAIL_FROM
            , String(emailAddress)
            , ""
            , "EMSE_POOL_TEST_UNSATISFACTORY"
            , eParams
            , [], capId
        );
        */
        
    }
    else {
        showMessage = true;
        comment("Primary Contact has no email for auto notification, please notify primary contact.")
    }

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
        scheduleInspectDate('Recheck', dateAdd(null, 1, true), assignedToRecord);
    }
}

if (String(inspType) == "Pool Test Results" && String(inspResult) == "Satisfactory") {
    var capConditions = aa.capCondition.getCapConditions(capId);

    if (capConditions.getSuccess()) {
        var conditionsOut = capConditions.getOutput();
        if (conditionsOut.length > 0) {
            for (i in conditionsOut) {
                if (conditionsOut[i].conditionDescription == 'Unsatisfactory Test Results' && conditionsOut[i].conditionStatus == 'Applied') {
                    //aa.capCondition.deleteCapCondition(capId, conditionsOut[i].conditionNumber);
                    conditionsOut[i].setConditionStatus('Condition Met');
		    conditionsOut[i].setConditionStatusType('Not Applied');
                    conditionsOut[i].setImpactCode("");

		   aa.capCondition.editCapCondition(conditionsOut[i]);
                }
            }
        }
        addCondition = false;
    }
}

var asiClosedBy = getGuidesheetASIValue(inspId, 'WQ_Pool_Routine','Pool Routine Detail Information', 'WQ_PR_CKL', 'POOL_ROUTINE', 'Pool Closed by');

if (asiClosedBy && asiClosedBy == 'MCPHD') {
    updateTask('Issuance', 'Suspended', 'Updated by Script', 'Suspended');
    //updateAppStatus('Suspended','Suspended by Script - Closed by MCPHD');
}
