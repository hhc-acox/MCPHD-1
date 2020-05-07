function addToGASIT(gsi, pTableName, pArrayToAdd) {
    var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
 //   logDebug("**GUIDESHEET ITEM: " + gsi.getGuideItemText());
    var gsAsitGrpList = gsi.getItemASITableSubgroupList();
    if (gsAsitGrpList != null) {
        for (var j = 0; j < gsAsitGrpList.size(); j++) {
            var guideItemASIT = gsAsitGrpList.get(j);
            // dumpObj(guideItemASIT);
            var cASIGroup = guideItemASIT.getGroupName();
            var tableArr = new Array();
            if (guideItemASIT.getTableName() == pTableName) {
                var newColumnList = guideItemASIT.getColumnList();
                for (var k = 0; k < newColumnList.size(); k++) {
                    if (!updateComplete) // right column but row not found create a new row.
                    {
                        var column = newColumnList.get(k);
                        for (l = 0; l < pArrayToAdd.length; l++) {
                            if (pArrayToAdd[l]) {
                                var cValueMap = column.getValueMap();
                                var newColumn = new com.accela.aa.inspection.guidesheet.asi.GGSItemASITableValueModel;
                                var pReadOnly = "F";
                                //logDebug(pArrayToAdd[l][column.getColumnName()]);
                                newColumn.setColumnIndex(j);
                                newColumn.setRowIndex(l);
    
                                if (!column) {
                                    newColumn.setAttributeValue("");
                                } else {
                                    newColumn.setAttributeValue((pArrayToAdd[l][column.getColumnName()] == null || pArrayToAdd[l][column.getColumnName()] == 'undefined' ? "" : pArrayToAdd[l][column.getColumnName()]));
                                }
                                newColumn.setAuditDate(new java.util.Date());
                                newColumn.setAuditID("ADMIN");
                                cValueMap.put(l, newColumn);
                            }
                        }
                    }
                }
                var updateComplete = true;
            }
        }
    }
    if (updateComplete) {
        gsb.updateGuideSheetItem(gsi, "ADMIN");
    }
}
