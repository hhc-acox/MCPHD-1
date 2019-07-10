//IRSA;ENVHEALTH!HOUSING!HISTORIC!SEC
if (isTaskActive('Additional Processing') && matches(inspResult,'Owner Secured')) {
	branchTask('Additional Processing','Owner Secured','Updated by Script');
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Finaled')&& balanceDue > 0) {
	branchTask('Final Processing','Closed/Fees Outstanding','Updated by Script');
	deactivateTask('Additional Processing');
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Finaled') && balanceDue == 0) {
	taskCloseAllExcept('Finaled','Updated by Script');
	deactivateTask('Final Processing');
	}

if (isTaskActive('Additional Processing') && matches(inspResult,'Contractor Secured') && balanceDue > 0) {
	branchTask('Final Processing','Closed/Fees Outstanding','Updated by Script');
	deactivateTask('Additional Processing');
	}

if (isTaskActive('Final Processing') && matches(inspResult,'Finaled')&& balanceDue > 0) {
	updateTask('Final Processing','Closed/Fees Outstanding','Updated by Script');
	}

if (isTaskActive('Final Processing') && matches(inspResult,'Finaled') && balanceDue == 0) {
	taskCloseAllExcept('Finaled','Updated by Script');
	deactivateTask('Final Processing');
	}

