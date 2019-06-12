// IRSA;ENVHEALTH!HOUSING!TRA!~
if (isTaskActive('Reinspection') && matches(inspResult,'In Violation','In Violation - Ticket Issued')) {
	closeTask('Reinspection','In Violation','Updated by Script');
        activateTask("Additional Processing");
	assignTask('Additional Processing',AInfo['Assigned To']);
	}

if (isTaskActive('Reinspection') && matches(inspResult,'In Compliance')) {
	branchTask('Reinspection','In Compliance','Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('Reinspection') && matches(inspResult,'Non-Compliance/Case Closed')) {
	branchTask('Reinspection','Non-Compliance/Case Closed','Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('Initial Processing') && matches(inspResult,'Non-Compliance/Case Closed')) {
	closeTask('Initial Processing','Non-Compliance/Case Closed','Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('Final Processing') && matches(inspResult,'Non-Compliance/Case Closed','In Compliance') && balanceDue == 0) {
	closeTask('Final Processing','Finaled','Updated by Script');
	deactivateTask('Recurring Inspection');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('Final Processing') && matches(inspResult,'Non-Compliance/Case Closed','In Compliance') && balanceDue > 0) {
	updateTask('Final Processing','Closed/Fees Outstanding','Updated by Script');
	deactivateTask('Recurring Inspection');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Non-Compliance/Case Closed','In Compliance') && balanceDue > 0) {
	branchTask('Additional Processing','Closed/Fees Outstanding','Updated by Script');
	deactivateTask('Recurring Inspection');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'In Compliance') && balanceDue == 0) {
	branchTask('Additional Processing','In Compliance','Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Non-Compliance/Case Closed') && balanceDue == 0) {
	branchTask('Additional Processing','Non-Compliance/Case Closed','Updated by Script');
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}
