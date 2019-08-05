function addTrashTicketFee() {
	try{
	var tFee='H_T';
		tFee+=AInfo['Ticket Fee'];
			if (!feeExists(tFee,'INVOICED')) {
				updateFee(tFee,'H_TRA','FINAL',1,'Y');	
	}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getTSIfieldValue:  " + err.message);
		logDebug(err.stack);
	}

}
