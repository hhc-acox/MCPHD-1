function hhcgetInspRecheckDate(inspId) {
   try {
	   if (inspId == 'undefined' || inspId == null) {
		   inspId = 0;
	   }
       var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
       var ds = initialContext.lookup("java:/AA");
       var conn = ds.getConnection();
       // Get the Recheck date using SQL
       var selectString = "select G6_DESI_DD from G6ACTION where G6_ACT_NUM = '" + inspId + "'";
       //aa.print(selectString)
       var SQLStatement = conn.prepareStatement(selectString);
       var rSet = SQLStatement.executeQuery();
       var arrDatelist = new Array();
       while (rSet.next()) {
          
           aa.print(rSet.getString("G6_DESI_DD"));
           arrDatelist.push(rSet.getString("G6_DESI_DD"))
       }
       return arrDatelist[0];
   }
   catch (e) {
       aa.print("Exception getting data from G6ACTION: " + e.message);
   }
   finally {
	    if (rSet != null || rSet != 'undefined') try { rSet.close(); } catch (e) {aa.print("Exception getting data from rSet: " + e.message); } 
	    if (SQLStatement != null || rSet != 'undefined') try { SQLStatement.close(); } catch (e) {aa.print("Exception getting data from SQLStatement: " + e.message); }
	    if (conn != null || rSet != 'undefined') try { conn.close(); } catch (e) {aa.print("Exception getting data from conn: " + e.message); }
        if (initialContext != null || rSet != 'undefined') try { initialContext.close(); } catch (e) {aa.print("Exception getting data from initialContext: " + e.message); }
           
   }
}

//var mytest = getRecheckDate(30516045);