if(wfStatus == 'Approved' && wfTask == 'Site Survey') {
	var assignToUser = hhcgetUserByDiscipline('WQPoolsSupp');
	updateTask('Issuance', 'Ready for Issuance Fees Due', 'Updated by script', 'Ready for Issuance Fees Due');
	assignTask('Issuance', assignToUser);
}

if(wfStatus == 'Approved' && wfTask == 'Application Review') {
	var assignToUser = hhcgetUserByDiscipline('WQPoolsSupp');
	updateTask('Permit Issuance', 'Pending', 'Updated by script', 'Pending');
	assignTask('Permit Issuance', assignToUser);
}

if(wfStatus == 'Approved' && wfTask == 'Inspection' && appMatch('EnvHealth/WQ/Pool/Construction Permit')) {
	var assignToUser = hhcgetUserByDiscipline('WQPoolsSupp');
	updateTask('Final Permit Creation', 'Pending', 'Updated by script', 'Pending');
	assignTask('Final Permit Creation', assignToUser);
}
