function searchASITableThreeVal(asiTable, fieldName, fieldValue, fieldName2, fieldValue2, fieldName3, fieldValue3, vCapId) {
    /*This function will search an ASI table for a specific value in a specific fieldname. 
    Will return the Row Nbr containing the value if the value is found, or zero if not.
    To use this function: pass the name of the ASI table to search,the fieldname to search,
    the value to search for, and the capId (optional, only pass if not the current CAP). */
    logDebug("Searching Table Name: " + asiTable + " in Field Name: " + fieldName + " for value: " + fieldValue);
    if (vCapId == null) {
        var vCapId = capId;
    }
    fieldValueStr = fieldValue.toString();
    fieldValueStr2 = fieldValue2.toString();
    fieldValueStr3 = fieldValue3.toString();
    srchTable = new Array();
    valueFound = "No";
    rowNbr = 0;
    srchTable = loadASITable(asiTable, vCapId);

    if (srchTable) {
        for (x in srchTable) {
            thisRow = srchTable[x];
            if (thisRow[fieldName].toString() == fieldValueStr && thisRow[fieldName2].toString() == fieldValueStr2 && thisRow[fieldName3].toString() == fieldValueStr3) {
                valueFound = "Yes";
                rowNbr = parseInt(x) + 1;
                logDebug("Value " + fieldValue + " found: " + valueFound + "---In row " + rowNbr);

                return true;
            }
        }

        return false;
    }
}
