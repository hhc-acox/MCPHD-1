function invoiceOneNow(feeSeq, paymentPeriod, itemCap) {

	var feeSeqList = new Array();
	feeSeqList[0] = feeSeq;

	paymentPeriodList = new Array();
	if (paymentPeriod == null) 
		paymentPeriodList[0] = "APPLICATION";
	else 
		paymentPeriodList[0] = paymentPeriod;
	var invoiceResult = aa.finance.createInvoice(itemCap, feeSeqList, paymentPeriodList);
	if (!invoiceResult.getSuccess())
		logDebug("ERROR", "Invoicing the fee items was not successful.  Reason: " +  invoiceResult.getErrorMessage());
}