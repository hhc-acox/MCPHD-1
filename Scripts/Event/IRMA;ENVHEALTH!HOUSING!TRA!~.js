// IRMA;ENVHEALTH!HOUSING!TRA!~
if (isTaskActive('Initial Processing') && matches(inspResult,'In Compliance')) {
	closeTask('Initial Processing','In Compliance','Updated by Script');
	
HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Reinspection') && matches(inspResult,'In Violation','In Violation - Ticket Issued')) {
	closeTask('Reinspection','In Violation','Updated by Script');
	assignTask('Additional Processing',AInfo['Assigned To']);  //assignment not working - investigate
	}

if (isTaskActive('Reinspection') && matches(inspResult,'In Compliance')) {
	branchTask('Reinspection','In Compliance','Updated by Script');

HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Reinspection') && matches(inspResult,'Non-Compliance/Case Closed')) {
	branchTask('Reinspection','Non-Compliance/Case Closed','Updated by Script');

HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Non-Compliance/Case Closed') && balanceDue > 0) {
	branchTask('Additional Processing','Non-Compliance/Case Closed','Updated by Script');
	deactivateTask('Recurring Inspection');

HHC_VIOLATIONS_LOOP();
	}
	
if (isTaskActive('Additional Processing') && matches(inspResult,'In Compliance') && balanceDue > 0) {
	branchTask('Additional Processing','In Compliance','Updated by Script');
	deactivateTask('Recurring Inspection');

HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'In Compliance') && balanceDue == 0) {
	branchTask('Additional Processing','In Compliance','Updated by Script');

HHC_VIOLATIONS_LOOP();
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Non-Compliance/Case Closed') && balanceDue == 0) {
	branchTask('Additional Processing','Non-Compliance/Case Closed','Updated by Script');

HHC_VIOLATIONS_LOOP();
	}
	
if (isTaskActive('Final Processing') && matches(inspResult,'Non-Compliance/Case Closed','In Compliance')) {
	closeTask('Final Processing','Finaled','Updated by Script');
	deactivateTask('Recurring Inspection');

HHC_VIOLATIONS_LOOP();
	}
