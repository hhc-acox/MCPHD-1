//lwacht: 181012: calculate area on checklist custom table
try{
	if (GuidesheetModel && "VC_LARVICIDE"== GuidesheetModel.getGuideType().toUpperCase()) {
		var siteBreeding = getGuidesheetASIValue(inspId,"VC_Larvicide","SITE INFORMATION","VC_LVCCKLST","LARVICIDE","Is Site Breeding");
		logDebug("siteBreeding: " + siteBreeding);
		if(siteBreeding=="Yes"){
			var guidesheetItem = GuidesheetModel.getItems();
			for(var j=0;j< guidesheetItem.size();j++) {
				var item = guidesheetItem.get(j);
				var guideItemASITs = item.getItemASITableSubgroupList();
				if (guideItemASITs!=null){
					for(var j = 0; j < guideItemASITs.size(); j++){
						var guideItemASIT = guideItemASITs.get(j);
						if(guideItemASIT && "TREATMENT INFORMATION" == guideItemASIT.getTableName()){
							var tableArr = new Array();
							var columnList = guideItemASIT.getColumnList();
							if(columnList.length<1){
								cancel=true;
								showMessage=true;
								comment("At least one row needs to be populated in the Treatment table when 'Is Site Breeding' is set to 'Yes'.");
							}
/*							for (var k = 0; k < columnList.size() ; k++ ){
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
								//logDebug(val +" : " + thisRow[val]);
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
									var updateResult = aa.guidesheet.updateGGuidesheet(GuidesheetModel,GuidesheetModel.getAuditID());
									if (updateResult.getSuccess()) {
										logDebug("Successfully updated " + GuidesheetModel.getGuideType() + ".");
									} else {
										logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
									}
								}
							}
						*/}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/VC/LARVICIDESITE/NA: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181012: end
