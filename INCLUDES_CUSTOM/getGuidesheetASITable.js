function getGuidesheetASITable(inspId,gName,asitName) {
try{
	//updates the guidesheet ID to nGuideSheetID if not currently populated
	//optional capId
	var itemCap = capId;
	if (arguments > 6) itemCap = arguments[7];
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			if (inspArray[i].getIdNumber() == inspId) {
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					for(var i=0;i< gs.size();i++) {
						var guideSheetObj = gs.get(i);
						if (guideSheetObj && gName.toUpperCase() == guideSheetObj.getGuideType().toUpperCase()) {
							var guidesheetItem = guideSheetObj.getItems();
							for(var j=0;j< guidesheetItem.size();j++) {
								var item = guidesheetItem.get(j);
								var guideItemASITs = item.getItemASITableSubgroupList();
								if (guideItemASITs!=null){
									for(var j = 0; j < guideItemASITs.size(); j++){
										var guideItemASIT = guideItemASITs.get(j);
										if(guideItemASIT && asitName == guideItemASIT.getTableName()){
											var tableArr = new Array();
											var columnList = guideItemASIT.getColumnList();
											for (var k = 0; k < columnList.size() ; k++ ){
												var column = columnList.get(k);
												var values = column.getValueMap().values();
												var iteValues = values.iterator();
												while(iteValues.hasNext())
												{
													var i = iteValues.next();
													var zeroBasedRowIndex = i.getRowIndex()-1;
													if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
													tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue();
												}
											}
										}
									}
								}
								return tableArr;
							}							
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No checklist item found.");
	return false;
}catch(err){
	logDebug("A JavaScript Error occurred: getGuidesheetASITable: " + err.message);
	logDebug(err.stack);
}}