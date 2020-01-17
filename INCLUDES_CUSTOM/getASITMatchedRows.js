function getASITMatchedRows(asiTable, fieldName, fieldValue, vCapId) {
    /*This function will search an ASI table for a specific value in a specific fieldname. 
    Will return an array of rownums, or false if not.
    To use this function: pass the name of the ASI table to search,the fieldname to search,
    the value to search for, and the capId (optional, only pass if not the current CAP). */
    logDebug("Searching Table Name: " + asiTable + " in Field Name: " + fieldName + " for value: " + fieldValue);
    if (vCapId == null) {
        var vCapId = capId;
    }
    fieldValueStr = fieldValue.toString();
    srchTable = new Array();
	var resultArr = new Array();
    valueFound = "No";
    rowNbr = 0;
    srchTable = loadASITable(asiTable, vCapId);

    if (srchTable) {
        for (x in srchTable) {
            thisRow = srchTable[x];
            if (thisRow[fieldName].toString() == fieldValueStr) {
                valueFound = "Yes";
                rowNbr = parseInt(x) + 1;
                logDebug("Value " + fieldValue + " found: " + valueFound + "---In row " + rowNbr);
				resultArr.push(rowNbr);
            }
        }
		if(resultArr.length) {
			return resultArr;
		}

        return false;
    }
}
