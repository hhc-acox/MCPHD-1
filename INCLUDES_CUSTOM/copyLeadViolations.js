function copyLeadViolations(inspId) {

	var conn = new db();
	var sql = "SELECT G6_ACT_NUM FROM dbo.G6ACTION WHERE SERV_PROV_CODE='{0}' AND B1_PER_ID1='{1}' AND B1_PER_ID2='{2}' AND B1_PER_ID3='{3}' AND G6_ACT_TYP in ('Initial Lead Inspection', 'Reinspection', 'Yearly Lead Inspection') and g6_status = 'In Violation' and rec_status != 'I' ORDER BY G6_COMPL_DD DESC";
	sql = sql.replace("{0}", String(aa.getServiceProviderCode()))
		.replace("{1}", String(capId.getID1()))
		.replace("{2}", String(capId.getID2()))
		.replace("{3}", String(capId.getID3()));
	var ds = conn.dbDataSet(sql, 1);

	var lastInsp = null;
	if (ds.length) {
		lastInsp = parseInt(ds[0]["G6_ACT_NUM"], 10);
		logDebug("Found " + lastInsp);
	}
	if (lastInsp == null) {
		logDebug("No prior inspection"); return;
	}
	// find LHH_Violations checklist on last inspection.
	var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
	var qf = new com.accela.aa.util.QueryFormat();
	var gs = gsb.getGGuideSheetWithItemsByInspectID(capId, lastInsp,qf);
	if (gs == null) {
		logDebug("No Guidesheets to copy");
		return;
	}
	var gsa = gs.result.toArray();
	if (gsa.length < 1) {
		logDebug("No Guideitems to copy");
		return;
	}
	dg = null;
	for (var gsIndex in gsa) {
		gs = gsa[gsIndex];
		gsType = gs.getGuideType();
		if (gsType == "LHH_Violations") {
			dg = gs;
			break;
		}
	}
	if (dg != null) {
		var guidesheetItemArr = dg.getItems().toArray();
		var item = null;
		for (var itemIndex in guidesheetItemArr) {
			item = guidesheetItemArr[itemIndex];
			if (item.getGuideItemText() == "Violations") 
				break;
		}
		if (item != null) {
			logDebug("Found guideitem to copy from");
			var gio = new guideSheetObject(dg, item);
			gio.loadInfoTables();
			if (gio.validTables) {
				table = gio.infoTables["VIOLATIONS"];
				aa.print(table.length); 
				
				// get guideitem on the current inspection
				gs = gsb.getGGuideSheetWithItemsByInspectID(capId, parseInt(inspId), qf);
				if (gs == null) {
					logDebug("No Guidesheets to copy to");
					return;
				}
				var gsa = gs.result.toArray();
				if (gsa.length < 1) {
					logDebug("No Guideitems to copy to");
					return;
				}
				dg = null;
				for (var gsIndex in gsa) {
					gs = gsa[gsIndex];
					gsType = gs.getGuideType();
					if (gsType == "LHH_Violations") {
						dg = gs;
						break;
					}
				}
				if (dg != null) {
					var guidesheetItemArr = dg.getItems().toArray();
					var newItem = null;
					for (var itemIndex in guidesheetItemArr) {
						newItem = guidesheetItemArr[itemIndex];
						if (newItem.getGuideItemText() == "Violations") 
							break;
					}
					if (newItem != null) {
						logDebug("Adding table to new item");
						addToGASIT(newItem, "VIOLATIONS", table);
					}
				}
			}
		}
	}
}
