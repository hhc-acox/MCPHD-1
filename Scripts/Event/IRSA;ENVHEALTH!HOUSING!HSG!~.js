// IRSA;ENVHEALTH!HOUSING!HSG!~
if (isTaskActive('Reinspection') && matches(inspResult,'In Compliance')) {
	branchTask('Reinspection','In Compliance','Updated by Script');
	
HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Reinspection') && matches(inspResult,'Non-Compliance/Case Closed')) {
	branchTask('Reinspection','Non-Compliance/Case Closed','Updated by Script');
	
HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Initial Processing') && matches(inspResult,'In Compliance')) {
	closeTask('Initial Processing','In Compliance','Updated by Script');
	
HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Initial Processing') && matches(inspResult,'Non-Compliance/Case Closed')) {
	closeTask('Initial Processing','Non-Compliance/Case Closed','Updated by Script');
	
HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Final Processing') && matches(inspResult,'Non-Compliance/Case Closed','In Compliance')) {
	closeTask('Final Processing','Closed','Updated by Script');
	deactivateTask('Recurring Inspection');
	
HHC_VIOLATIONS_LOOP();
	}
