if (isTaskActive('Inspection') && matches(inspResult,'Unjustified')) {
	branchTask('Inspection','Unjustified','Updated by Script');
	}

if (isTaskActive('Inspection') && matches(inspResult,'Duplicate')) {
	branchTask('Inspection','Duplicate INV - Case Finaled','Updated by Script');
	}

if (isTaskActive('Inspection') && matches(inspResult,'Pending Order')) {
	branchTask('Inspection','Pending Order - Case Finaled','Updated by Script');
	}

if (isTaskActive('Inspection') && matches(inspResult,'In Violation')) {
	closeTask('Inspection','In Violation','Updated by Script');
	editAppSpecific('Resulted in Violation','Yes');
	}

if (matches(inspType, 'Initial Inspection','Reinspection') && matches(inspResult,'In Violation')) {
	inspIDate = inspObj.getInspectionDate().getMonth() + '/' + inspObj.getInspectionDate().getDayOfMonth() + '/' + inspObj.getInspectionDate().getYear();
	editAppSpecific('Initial Inspection Date',inspIDate);
	}
