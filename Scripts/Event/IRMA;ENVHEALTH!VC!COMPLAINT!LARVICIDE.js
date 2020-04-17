// Enter your script here...

if (matches(inspResult,'Tech Complete - New Site','Tech Complete - Existing Site')) {
	//assign to Mosquito Control Biology
	var userID = hhcgetUserByDiscipline('VCBiology');
	assignInspection(inspId, userID);
	
	//create site if new
	if (matches(inspResult, 'Tech Complete - New Site')) {
		//CreateLarvicideSite_IfBreeding(capId);	
	}
}
