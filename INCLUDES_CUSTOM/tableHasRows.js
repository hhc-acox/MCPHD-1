function tableHasRows(t) {
	try{
		eval("if (typeof(" + t + ") != \"undefined\" ) var o = " + t);
			if (typeof(o) == "object" && o.length > 0) {
				return true;
	} 		else {
				return false;
	}
	}
	catch(err)
		{
		logDebug("A JavaScript Error occurred: tableHasRows:  " + err.message);
		logDebug(err.stack);
		}
	
}