//lwacht: 190318: require at least one field in the pool status table
try{
	if (GuidesheetModel && "POOL TEST RESULTS"== GuidesheetModel.getGuideType().toUpperCase()) {
		var guidesheetItem = GuidesheetModel.getItems();
		for(var j=0;j< guidesheetItem.size();j++) {
			var item = guidesheetItem.get(j);
			var guideItemASITs = item.getItemASITableSubgroupList();
			if (guideItemASITs!=null){
				for(var jj = 0; jj < guideItemASITs.size(); jj++){
					var guideItemASIT = guideItemASITs.get(jj);
					if(guideItemASIT && "POOL STATUS" == guideItemASIT.getTableName().toUpperCase()){
						var tableArr = new Array();
						var columnList = guideItemASIT.getColumnList();
							for (var k = 0; k < columnList.size() ; k++ ){
								var column = columnList.get(k);
								var values = column.getValueMap().values();
								var iteValues = values.iterator();
								for(xx in iteValues){
									if(typeof(iteValues[xx])!="function"){
										logDebug(xx +  ": " + iteValues[xx]);
									}
								}
								while(iteValues.hasNext()){
									var i = iteValues.next();
									var zeroBasedRowIndex = i.getRowIndex()-1;
									if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
									tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue();
								}
							}
						if(!columnList || columnList.length<1 || columnList.length=="undefined"){
							cancel=true;
							showMessage=true;
							comment("At least one row needs to be populated in the Pool Status table.");
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: GSUB:EnvHealth/WQ/Pool/License: " + err.message);
	logDebug(err.stack)
}
//lwacht: 190318: end
