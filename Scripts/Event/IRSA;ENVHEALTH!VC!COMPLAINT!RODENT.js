//IRSA;ENVHEALTH!VC!COMPLAINT!RODENT.js
var resultDate = sysDate;
var resultComment = 'Updated by Script';
var inspStatus = 'Closed';
if ((getInspector('Rodents') != null) && (matches(inspResult,'undefined',' ',''))) {
updateAppStatus("Assigned");
}
if (!matches(inspResult,'',' ', null,'undefined')) {
//aa.inspection.resultInspection(capId, inspId, inspStatus, resultDate, resultComment, currentUserID);
updateAppStatus("Closed");
}
