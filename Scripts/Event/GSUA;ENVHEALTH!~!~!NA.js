//lwacht: 190117

try{
	if (GuidesheetModel && "LAB SAMPLES" == GuidesheetModel.getGuideType().toUpperCase()) {
		for(xx in GuidesheetModel){ 
			if(typeof(GuidesheetModel[xx])!="function"){
				logDebug(xx+": " + GuidesheetModel[xx]);
			}
		}
		var thisCapId = GuidesheetModel.capID;
		var addResult = aa.address.getAddressByCapId(thisCapId);
		if (addResult.getSuccess()){
			var aoArray = addResult.getOutput();
		}else{ 
			logDebug("**ERROR: getting address by cap ID: " + addResult.getErrorMessage());
		}
		if (aoArray.length){ 
			var ao = aoArray[0]; 
		}else{
			logDebug("**WARNING: no address for comparison:");
		} 
		var fullAddress = [ao.getHouseNumberStart(),ao.getStreetDirection(),ao.getStreetName(),ao.getStreetSuffix(),,ao.getCity(),,ao.getState(),ao.getZip()].filter(Boolean).join(" ");
		var currUser = aa.person.getUser(currentUserID).getOutput();
		var inspFullString = ""+currUser;
		var firstPos = inspFullString.lastIndexOf("/")+1;
		var lastPos = inspFullString.length;
		var inspName = inspFullString.substr(firstPos,lastPos);
		var dataJsonArray = [];
		var guidesheetItem = GuidesheetModel.getItems();
		for(var j=0;j< guidesheetItem.size();j++) {
			var item = guidesheetItem.get(j);
			//logDebug("item.getGuideItemStatus(): " + item.getGuideItemStatus());
			var chkStatus = ""+item.getGuideItemStatus();
			if(chkStatus=="Send to LIMS"){
			//if(item.getGuideItemStatus()==item.getGuideItemStatus()){
				var guideItemASITs = item.getItemASITableSubgroupList();
				if (guideItemASITs!=null){
					for(var l = 0; l < guideItemASITs.size(); l++){
						var guideItemASIT = guideItemASITs.get(l);
						//logDebug("guideItemASIT.getTableName(): " +guideItemASIT.getTableName());
						if(guideItemASIT && "SAMPLE SUMMARY" == guideItemASIT.getTableName().toUpperCase()){
							var tableArr = new Array();
							var columnList = guideItemASIT.getColumnList();
							for (var k = 0; k < columnList.size() ; k++ ){
								var column = columnList.get(k);
								var values = column.getValueMap().values();
								var iteValues = values.iterator();
								while(iteValues.hasNext())
								{
									var m = iteValues.next();
									var zeroBasedRowIndex = m.getRowIndex()-1;
									if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
									tableArr[zeroBasedRowIndex][column.getColumnName()] = m.getAttributeValue();
								}
							}
						}
					}
				}
				//return tableArr;
				for(row in tableArr){
					var thisRow = tableArr[row];
					var limsReason = lookup("Sample_Reasons",""+tableArr[row]["Reason"]);
					if(matches(limsReason,null,false,"undefined")){
						limsReason="TOT";
					}
					var jsonResult = {
						"SampleID": ""+tableArr[row]["Sample ID"],
						//"SampleID": "345987",
						"SampleAddress": fullAddress,
						"Reason": limsReason,
						"SampleLocation": [""+tableArr[row]["Sample Location"],tableArr[row]["Other Sample Location"]].filter(Boolean).join(": "),
						"FieldNotes": ""+tableArr[row]["Field Notes"],
						"InspectorName": inspName,
						"SampleType": ""+tableArr[row]["Sample Type"],
						"InspectionID": ""+GuidesheetModel.activityNumber,
						"ChecklistID": ""+GuidesheetModel.guidesheetSeqNbr,
						"ChecklistItemID": ""+item.guideItemSeqNbr,
						"RecordID": ""+capIDString
					};
					dataJsonArray.push(jsonResult);
					//for(col in thisRow){
					//	logDebug("Here: " + col + ": " + thisRow[col]);
					//}
				}
				var nData = {
					"Samples":  dataJsonArray
				};
				var nDataJson = JSON.stringify(nData);
				logDebug("myJSON: " + nDataJson)							
				//urlLIMS is stored in INCLUDES_CUSTOM_FUNCTIONS
				var postResp = httpClientPut(urlLIMS, nDataJson, 'application/json', 'utf-8');
				var theResp = postResp.getOutput();
				if(theResp["resultCode"]!="200"){
					item.setGuideItemStatus("In Lab");
					var updateResult = aa.guidesheet.updateGGuidesheet(GuidesheetModel,GuidesheetModel.getAuditID());
					if (updateResult.getSuccess()) {
						logDebug("Successfully updated " + GuidesheetModel.getGuideType() + ".");
					} else {
						logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
					}
				}else{
					showMessage=true;
					comment("Error sending data to LIMS. Please correct: " + theResp["result"]);
				}
			}
		}
	}
}catch (err){
	logDebug("A JavaScript Error occurred: GSUA:EnvHealth/VC/LARVICIDESITE/NA: LIMS Interface: " + err.message);
	logDebug(err.stack);
} 

/*lwacht 190307: moved to different event
try{
	if (GuidesheetModel && "LAB SAMPLES"== GuidesheetModel.getGuideType().toUpperCase()) {
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
					}
				}
			}
		}			
	}
}catch(err){
	logDebug("A JavaScript Error occurred: GSUA:EnvHealth/VC/LARVICIDESITE/NA: update area field: " + err.message);
	logDebug(err.stack)
}
lwacht: 181012: end */
