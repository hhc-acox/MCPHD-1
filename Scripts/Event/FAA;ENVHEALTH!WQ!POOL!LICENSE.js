pId = getParent();
if (pId && appMatch("EnvHealth/WQ/Pool/Facility", pId)) {
	var feeA = loadFees();
	for (x in feeA)	{
		thisFee = feeA[x];
		if (thisFee.status == "NEW") {
			addFeeWithExtraData(thisFee.code,thisFee.sched,thisFee.period,thisFee.unit,"N",pId,capId.getCustomID(),null,null);
			editResult = aa.finance.removeFeeItem(capId, thisFee.sequence);
			if (editResult.getSuccess()) {
				logDebug("Removed existing Fee Item: " + thisFee.code);
			} else {
				logDebug("**ERROR: removing fee item " + editResult.getErrorMessage());
			}
		}
	}
}
