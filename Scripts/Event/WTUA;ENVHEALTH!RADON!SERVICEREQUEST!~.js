//WTUA;EnvHealth!Radon!ServiceRequest!~
var assignedTo = getAssignedToRecord();
if (wfTask == 'Initial Visit' && matches(wfStatus,'Initial Contact') && getTSIfieldValue('Inspection Date', 'Initial Visit') != null) {
	//scheduleInspectDate('Radon Detector Placement',getTSIfieldValue('Inspection Date', 'Case Intake'), assignedTo);
	}
if (wfTask == 'Initial Visit' && matches(wfStatus,'Initial Contact') && getTSIfieldValue('Inspection Date', 'Initial Visit') == null) {
	//scheduleInspectDate('Radon Detector Placement',nextWorkDay(dateAdd(null,0)), assignedTo);
	}
