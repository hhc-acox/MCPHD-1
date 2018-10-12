//lwacht: 181011: reschedule inspection if site is breeding
try{
	//updates the guidesheet ID to nGuideSheetID if not currently populated
	//optional capId
	var r = aa.inspection.getInspections(capId);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			if (inspArray[i].getIdNumber() == inspId) {
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					for(var i=0;i< gs.size();i++) {
						var guideSheetObj = gs.get(i);
						if (guideSheetObj && "VC_LARVICIDE"== guideSheetObj.getGuideType().toUpperCase()) {
							var guidesheetItem = guideSheetObj.getItems();
							for(var j=0;j< guidesheetItem.size();j++) {
								var item = guidesheetItem.get(j);
								var guideItemASITs = item.getItemASITableSubgroupList();
								if (guideItemASITs!=null){
									for(var j = 0; j < guideItemASITs.size(); j++){
										var guideItemASIT = guideItemASITs.get(j);
										if(guideItemASIT && "TREATMENT INFORMATION" == guideItemASIT.getTableName()){
											var tableArr = new Array();
											var columnList = guideItemASIT.getColumnList();
											for (var k = 0; k < columnList.size() ; k++ ){
												var column = columnList.get(k);
												var values = column.getValueMap().values();
												var iteValues = values.iterator();
												while(iteValues.hasNext()){
													var i = iteValues.next();
													var zeroBasedRowIndex = i.getRowIndex()-1;
													if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
													tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue();
												}
											}
										}
										for(row in tableArr){
											thisRow = tableArr[row];
											for(val in thisRow){
												logDebug(val +" : " + thisRow[val]);
												if(val == "Length"){
													var rLen = thisRow[val];
												}
												if(val == "Width"){
													var rWid = thisRow[val];
												}
												if(val == "Area (sq ft)"){
													thisRow[val]= rLen * rWid;
												}
											}
										}
										for (var k = 0; k < columnList.size() ; k++ ){
											var column = columnList.get(k);
											var values = column.getValueMap().values();
											var iteValues = values.iterator();
											while(iteValues.hasNext()){
												var i = iteValues.next();
												var zeroBasedRowIndex = i.getRowIndex()-1;
												if(column.getColumnName() == "Area (sq ft)"){
													i.setAttributeValue(tableArr[zeroBasedRowIndex]["Area (sq ft)"]);
											}
									}
								}
							}							
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
				}
			}
		}
	} else {
		logDebug("No inspections on the record");
	}
	logDebug("No checklist item found.");
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/VC/LARVICIDESITE/NA: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181011: end
