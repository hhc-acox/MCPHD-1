function isSupervisor(userID) {
	var suo = aa.person.getUser(userID); 
	
	if(suo.getSuccess()){
                var suoOut = suo.getOutput();
		
		if(suoOut.officeCode == 'NA') {
			return true;
		}
	}
	
	return false;
}
