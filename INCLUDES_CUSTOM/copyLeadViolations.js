
function copyLeadViolations(inspId) {

	var conn = new db();
	var sql = "SELECT G6_ACT_NUM FROM G6ACTION WHERE SERV_PROV_CODE='{0}' AND B1_PER_ID1='{1}' AND B1_PER_ID2='{2}' AND B1_PER_ID3='{3}' AND G6_ACT_TYP in ('Initial Lead Inspection', 'Reinspection', 'Yearly Lead Inspection') and g6_status = 'In Violation' and rec_status != 'I' ORDER BY G6_COMPL_DD DESC";
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
	



function db() {
    this.version = function () {
        return 1.0;
    }

    /**
     * Executes a sql statement and returns rows as dataset
     * @param {string} sql 
     * @param {integer} maxRows 
     * @return {string[]}
     */
    this.dbDataSet = function (sql, maxRows) {
        var dataSet = new Array();
        if (maxRows == null) {
            maxRows = 100;
        }
        try {
            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup("java:/AA");
            var conn = ds.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(maxRows);
            var rSet = sStmt.executeQuery();
            while (rSet.next()) {
                var row = new Object();
                var maxCols = sStmt.getMetaData().getColumnCount();
                for (var i = 1; i <= maxCols; i++) {
                    row[sStmt.getMetaData().getColumnName(i)] = rSet.getString(i);
                }
                dataSet.push(row);
            }
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("dbDataSet: " + err);
        }
        return dataSet;
    }

    /**
     * Executes a sql statement and returns nothing
     * @param {string} sql 
     */
    this.dbExecute = function (sql) {
        try {
            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup("java:/AA");
            var conn = ds.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(1);
            var rSet = sStmt.executeQuery();
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("deExecute: " + err);
        }
    }

    /**
     * Returns first row first column of execute statement
     * @param {string} sql
     * @returns {object}  
     */
    this.dbScalarExecute = function (sql) {
        var out = null;
        try {
            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup("java:/AA");
            var conn = ds.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(1);
            var rSet = sStmt.executeQuery();

            if (rSet.next()) {
                out = rSet.getString(1);
            }
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("dbScalarValue: " + err);
        }
        return out;
    }
    return this;
}
