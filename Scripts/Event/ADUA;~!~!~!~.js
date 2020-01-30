showDebug = true;
showMessage = true;

var capDetail = aa.cap.getCapDetail(capId);
var capConditions = aa.capCondition.getCapConditions(capId);
var addCondition = true;

if (capDetail.getSuccess() && capConditions.getSuccess()){
	if (capDetail.getOutput().infractionFlag == 'N') {
		var conditionsOut = capConditions.getOutput();
		if (conditionsOut.length > 0) {
			for (i in conditionsOut) {
				if (conditionsOut[i].conditionComment == 'Do Not Accept Checks.' && conditionsOut[i].conditionStatus == 'Applied') {
					addCondition = false;
				}
			}
		}
	}
	if (capDetail.getOutput().infractionFlag == 'Y') {
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
	var today = new Date();
	var day = today.getDate();
	var month = today.getMonth() + 1;
	var year = today.getFullYear() + 2;
	var schedDate = aa.date.parseDate(month + '/' + day + '/' + year)
	aa.print('Adding NSF Condition');		
	addStdCondition("Payment Methods", "Non Sufficient Funds");
	
	var newConditions = aa.capCondition.getCapConditions(capId).getOutput();
	if (newConditions.length > 0) {
		for (i in newConditions) {
			if (newConditions[i].conditionComment == 'Do Not Accept Checks.' && newConditions[i].conditionStatus == 'Applied') {
				var condition = newConditions[i];
				condition.setExpireDate(schedDate);
				var result = aa.capCondition.editCapCondition(condition)
			}
		}
	}
}
