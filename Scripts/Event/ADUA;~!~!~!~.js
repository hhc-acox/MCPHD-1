showDebug = true;
showMessage = true;

var capDetail = aa.cap.getCapDetail(capId);
var capConditions = aa.capCondition.getCapConditions(capId);
var addCondition = true;

if (capDetail.getSuccess() && capConditions.getSuccess()){
	if (capDetail.getOutput().infractionFlag == 'Y') {
		var conditionsOut = capConditions.getOutput();
			if (conditionsOut.length > 0) {
				for (i in conditionsOut) {
					if (conditionsOut[i].conditionComment == 'Do Not Accept Checks.' && conditionsOut[i].conditionStatus == 'Applied') {
						addCondition = false;
					}
				}
			}
	}
	if (capDetail.getOutput().infractionFlag == 'N') {
		var conditionsOut = capConditions.getOutput();
			if (conditionsOut.length > 0) {
				for (i in conditionsOut) {
					if (conditionsOut[i].conditionComment == 'Do Not Accept Checks.' && conditionsOut[i].conditionStatus == 'Applied') {
						aa.capCondition.deleteCapCondition(capId, conditionsOut[i].conditionNumber);
					}
				}
			}
		addCondition = false;
	}
}

if (addCondition) {
	aa.print('Adding NSF Condition');		
	addStdCondition("Payment Methods", "Non Sufficient Funds");
}
