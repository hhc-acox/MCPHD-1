// IRMA;ENVHEALTH!HOUSING!TRA!~
if (isTaskActive('Reinspection') && matches(inspResult,'In Violation','In Violation - Ticket Issued')) {
	closeTask('Reinspection','In Violation','Updated by Script');
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

if (isTaskActive('Additional Processing') && matches(inspResult,'In Compliance')) {
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Non-Compliance/Case Closed')) {
	
//replaced branch(ES_VIOLATIONS_LOOP)
ES_VIOLATIONS_LOOP();
	}
