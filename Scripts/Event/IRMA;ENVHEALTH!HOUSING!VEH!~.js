// IRSA;ENVHEALTH!HOUSING!VEH!~
if (isTaskActive('Reinspection') && matches(inspResult,'In Violation')) {
	closeTask('Reinspection','In Violation','Updated by Script');
	assignTask('Additional Processing',AInfo['Assigned To']);
	}

if (isTaskActive('Reinspection') && matches(inspResult,'In Compliance','Non-Compliance/Case Closed')) {
	branchTask('Reinspection',inspResult,'Updated by Script');
	}

if (isTaskActive('Towing Inspection') && matches(inspResult,'In Violation')) {
	closeTask('Inspection','In Violation','Updated by Script');
	assignTask('Final Processing',AInfo['Assigned To']);
	}

if (isTaskActive('Towing Inspection') && matches(inspResult,'In Compliance','Non-Compliance/Case Closed')) {
	branchTask('Towing Inspection',inspResult,'Updated by Script');
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'In Compliance')) {
	closeTask('Additional Processing','In Compliance','Updated by Script');
	deactivateTask('Towing Inspection');
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Non-Compliance/Case Closed')) {
	closeTask('Additional Processing','Non-Compliance/Case Closed','Updated by Script');
	deactivateTask('Towing Inspection');
	
	}
