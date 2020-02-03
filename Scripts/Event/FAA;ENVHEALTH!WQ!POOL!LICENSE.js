pId = getParent();
if (pId && appMatch("EnvHealth/WQ/Pool/Facility", pId)) {
	var feeA = loadFees();
	for (x in feeA)	{
		thisFee = feeA[x];
		if (thisFee.status == "NEW") {
			addFee(thisFee.code,thisFee.sched,thisFee.period,thisFee.unit,"N",pId)
			editResult = aa.finance.removeFeeItem(capId, thisFee.sequence);
			if (editResult.getSuccess()) {
				logDebug("Removed existing Fee Item: " + thisFee.code);
			} else {
				logDebug("**ERROR: removing fee item " + editResult.getErrorMessage());
			}
		}
	}
}