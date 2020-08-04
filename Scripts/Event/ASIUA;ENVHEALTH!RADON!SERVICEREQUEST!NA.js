var vCapId = getCapId();
var asitRes = aa.appSpecificTableScript.getAppSpecificTableModel(capId, 'DEVICE PLACEMENT RESULTS');

if (asitRes.getSuccess()) {
    var deviceTable = asitRes.getOutput().getAppSpecificTableModel();
    var fld = deviceTable.getTableField().toArray();

    var newArr = new Array();
    var rowMax = fld.length / 13;
    var calcInd = 9;
    var placedInd = 7;
    var retrievedInd = 8;
    var oneDay = 24 * 60 * 60 * 1000;

    var labComplete = true;
    var labSent = true;

    if (rowMax) {
        removeASITable('DEVICE PLACEMENT RESULTS');
    }

    for (var i = 0; i < rowMax; i++) {
        newArr.push(fld.splice(0, 13));
    }

    if (newArr.length == 0) {
        labComplete = false;
        labSent = false;
    }

    for (k in newArr) {

        var isDuplicate = "";

        for (var j = 0; j < k; j++) {
            var s = newArr[j];
            var t = newArr[k];
            if (s[1] == t[1] && s[2] == t[2] && s[3] == t[3] && s[4] == t[4]) {
                isDuplicate = "CHECKED";
            }
        }
        var placed = newArr[k][placedInd];
        var retrieved = newArr[k][retrievedInd];
        if (placed && retrieved) {
            var placedSpl = placed.split('/');
            var retrievedSpl = retrieved.split('/');
            var placedDate = new Date(placedSpl[2], placedSpl[0], placedSpl[1]);
            var retrievedDate = new Date(retrievedSpl[2], retrievedSpl[0], retrievedSpl[1]);

            var diffDays = Math.round(Math.abs((retrievedDate - placedDate) / oneDay));

            if (!placed) {
                diffDays = "";
            }
            newArr[k][calcInd] = diffDays.toString();

        } else {
            newArr[k][calcInd] = "0";
        }

        if (isNaN(newArr[k][calcInd])) {
            newArr[k][calcInd] = "";
        }

        if(!newArr[k][11] || newArr[k][11] == '') {
            labComplete = false;
        }

        if(!newArr[k][10] || newArr[k][10] == '') {
            labSent = false;
        }

        var rowVals = new Array();
        rowVals["Sample ID Number"] = new asiTableValObj("Sample ID Number", newArr[k][0], "N");
        rowVals["Test Type"] = new asiTableValObj("Test Type", newArr[k][1], "N");
        rowVals["Room Use"] = new asiTableValObj("Room Use", newArr[k][2], "N");
        rowVals["Floor Level"] = new asiTableValObj("Floor Level", newArr[k][3], "N");
        rowVals["Placement"] = new asiTableValObj("Placement", newArr[k][4], "N");
        rowVals["If Other, provide details"] = new asiTableValObj("If Other, provide details", newArr[k][5], "N");
        rowVals["Duplicate"] = new asiTableValObj("Duplicate", "" + isDuplicate, "Y");
        rowVals["Installation Date"] = new asiTableValObj("Installation Date", newArr[k][7], "N");
        rowVals["Removal Date"] = new asiTableValObj("Removal Date", newArr[k][8], "N");
        rowVals["Number of Sampling Days"] = new asiTableValObj("Number of Sampling Days", newArr[k][9], "Y");
        rowVals["Sent to Lab"] = new asiTableValObj("Sent to Lab", newArr[k][10], "N");
        rowVals["Retrieved from Lab"] = new asiTableValObj("Retrieved from Lab", newArr[k][11], "N");
        rowVals["Results (pCi/L Radon)"] = new asiTableValObj("Results (pCi/L Radon)", newArr[k][12], "N");
        addToASITable('DEVICE PLACEMENT RESULTS', rowVals, capId);
    }

    if (labSent && !labComplete && isTaskActive('Followup Visit')) {
        updateTask('Followup Visit', 'Sample Sent to Lab', 'Closed by Script', 'Sample Sent to Lab');
    }

    if (labComplete && isTaskActive('Followup Visit')) {
        closeTask('Followup Visit', 'Lab Results Recorded', 'Closed by Script', 'Lab Results Recorded');
    }
}
