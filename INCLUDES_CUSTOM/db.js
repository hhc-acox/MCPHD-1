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
            var ds = initialContext.lookup("java:/MCPHD");
            var conn = ds.getConnection();
            var sStmt = aa.db.prepareStatement(conn, sql);
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
            var ds = initialContext.lookup("java:/MCPHD");
            var conn = ds.getConnection();
            var sStmt = aa.db.prepareStatement(conn, sql);
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
            var ds = initialContext.lookup("java:/MCPHD");
            var conn = ds.getConnection();
            var sStmt = aa.db.prepareStatement(conn, sql);
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
