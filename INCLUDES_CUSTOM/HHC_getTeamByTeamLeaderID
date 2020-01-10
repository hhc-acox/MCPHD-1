function HHC_getTeamByTeamLeaderID(username)
	{
		try{
			var suo = aa.person.getUser(username).getOutput(); 
			var suof = suo.deptOfUser;
			var deptstring = suof.split("/");
			var n = deptstring[5];
				return(n);	// Here are the pieces --> //deptstring[0]/deptstring[1]/deptstring[2]/deptstring[3]/deptstring[4]/deptstring[5]/deptstring[6]
							// Here is how it appears --> //MCPHD/MCPHD/EH/HOUSING/MGRA/TEAMC/NA
							//return(n); is TEAMC           		
			}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHC_getMyDepartment:  " + err.message);
		logDebug(err.stack);
		}
	}
