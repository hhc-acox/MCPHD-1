//IRSA;ENVHEALTH!HOUSING!VEH!~.js
	var areaInspector = '';
	var censusTract = '';
		censusTract = AInfo['ParcelAttribute.CensusTract'];
		areaInspector = lookup('Census - Housing EHS',censusTract);
if (isTaskActive('Reinspection') && matches(inspResult,'In Violation')) {
	branchTask('Reinspection','In Violation','Updated by Script');
	assignTask('Additional Processing',areaInspector);
	}

if (isTaskActive('Reinspection') && matches(inspResult,'In Compliance','Non-Compliance/Case Closed')) {
	branchTask('Reinspection',inspResult,'Updated by Script');
	}

if (isTaskActive('Towing Inspection') && matches(inspResult,'In Violation')) {
	closeTask('Inspection','In Violation','Updated by Script');
	assignTask('Final Processing',areaInspector);
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
