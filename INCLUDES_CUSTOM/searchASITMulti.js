function searchASITMulti(asiTable, values, vCapId) {
    /* This function uses a 2D array ([[]]) to seearch multiple values in ASIT */
    logDebug("Searching Table Name: " + asiTable + " in Field Name: " + fieldName + " for value: " + fieldValue);
    if (vCapId == null) {
        var vCapId = capId;
    }
    
    srchTable = new Array();
    srchTable = loadASITable(asiTable, vCapId);

    if (srchTable) {
        for (x in srchTable) {
            thisRow = srchTable[x];
            var rowMatch = true;

            for (y in values) {
                valRow = values[y];
                
                if (thisRow[valRow[0]].toString() != valRow[1].toString()) {
                    rowMatch = false;
                }
            }

            if (rowMatch) {
                return true;
            }
        }

        return false;
    }
}
