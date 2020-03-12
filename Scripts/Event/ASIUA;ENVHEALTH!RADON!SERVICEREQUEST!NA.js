var vCapId = getCapId();
var asitRes = aa.appSpecificTableScript.getAppSpecificTableModel(capId, 'DEVICE PLACEMENT RESULTS');

if (asitRes.getSuccess()) {
	var deviceTable = asitRes.getOutput().getAppSpecificTableModel();
	var fld = deviceTable.getTableField().toArray();

	var newArr = new Array();
	var rowMax = fld.length / 12;
	var calcInd = 8;
	var placedInd = 6;
	var retrievedInd = 7;
	var oneDay = 24 * 60 * 60 * 1000;

	if (rowMax) {
		removeASITable('DEVICE PLACEMENT RESULTS');
	}

	for (var i = 0; i < rowMax; i++) {
		newArr.push(fld.splice(0, 12));
	}

	for (k in newArr) {
		
			var isDuplicate = "";
			
			for (var j = 0; j < k; j++) {
				var s = newArr[j];
				var t = newArr[k];
				if (s[1] == t[1] && s[2] == t[2] && s[3] == t[3]) {
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

                                if (!placed){
                                    diffDays = "";
                                }
				newArr[k][calcInd] = diffDays.toString();

			}
                        else {
                            newArr[k][calcInd] = "0";
                        }
		var rowVals = new Array();
		rowVals["Sample ID Number"] = new asiTableValObj("Sample ID Number", newArr[k][0], "N");
		rowVals["Room Use"] = new asiTableValObj("Room Use", newArr[k][1], "N");
		rowVals["Floor Level"] = new asiTableValObj("Floor Level", newArr[k][2], "N");
		rowVals["Placement"] = new asiTableValObj("Placement", newArr[k][3], "N");
		rowVals["If Other, provide details"] = new asiTableValObj("If Other, provide details", newArr[k][4], "N");
		rowVals["Duplicate"] = new asiTableValObj("Duplicate", "" + isDuplicate, "N");
		rowVals["Installation Date"] = new asiTableValObj("Installation Date", newArr[k][6], "N");
		rowVals["Removal Date"] = new asiTableValObj("Removal Date", newArr[k][7], "N");
		rowVals["Number of Sampling Days"] = new asiTableValObj("Number of Sampling Days", newArr[k][8], "Y");
		rowVals["Sent to Lab"] = new asiTableValObj("Sent to Lab", newArr[k][9], "N");
		rowVals["Retrieved from Lab"] = new asiTableValObj("Retrieved from Lab", newArr[k][10], "N");
		rowVals["Results (pCi/L Radon)"] = new asiTableValObj("Results (pCi/L Radon)", newArr[k][11], "N");
		addToASITable('DEVICE PLACEMENT RESULTS', rowVals, capId);
	}
}
