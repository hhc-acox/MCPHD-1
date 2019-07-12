function hhcgetUserByDiscipline(userDiscipline){
	try{
	var userObjArray = new Array();
	var sysUserList
	var sysUserResult = aa.people.getSysUserListByDiscipline(userDiscipline);
	
	if (sysUserResult.getSuccess()) {
			sysUserList = sysUserResult.getOutput().toArray();
		} else {
			logDebug("**ERROR: getUserObjsByDiscipline: " + sysUserResult.getErrorMessage());
			return userObjArray;
		}
	
			for(var iUser in sysUserList){
				var userId = sysUserList[iUser].getUserID();
		}
	
			return userId;
		} 
	catch(err)
	{
	logDebug("A JavaScript Error occurred: getUserByDiscipline:  " + err.message);
	logDebug(err.stack);
	}
}
