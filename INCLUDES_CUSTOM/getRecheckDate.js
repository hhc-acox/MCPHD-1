function getRecheckDate(capId){
	var r = aa.inspection.getInspections(capId)

	if (r.getSuccess()) {
		var inspArray = r.getOutput();

		for (i in inspArray) {
			if (inspArray[i].getIdNumber() == inspId) {
				var inspModel = inspArray[i].getInspection();

				var gs = inspModel.getGuideSheets()

				if (gs) {
					gsArray = gs.toArray();
					for (var loopk in gsArray) {
						if (gsArray[loopk].guideType == 'FCS Standard Information') {
							var gsItems = gsArray[loopk].getItems().toArray()
							for (var loopi in gsItems) {
								//exploreObject(gsItems[loopi]);
								var asitArr = gsItems[loopi].getItemASISubgroupList().toArray()
								for (var loopj in asitArr) {
									var asitArr2 = asitArr[loopj].getAsiList().toArray();
									for(var loopl in asitArr2) {
										if(asitArr2[loopl].asiName == 'Recheck Date') {
											return asitArr2[loopl].attributeValue;
										}
									}
								}
							}
						}
					}
				} // if there are guidesheets
				else {
					logDebug("No guidesheets for this inspection");
				} // if this is the right inspection
			} // for each inspection
		} // if there are inspections
	}
}
