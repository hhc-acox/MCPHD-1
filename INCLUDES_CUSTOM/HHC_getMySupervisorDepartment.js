function HHC_getMySupervisorDepartment(username)
	{
		try{
			var suo = aa.person.getUser(username).getOutput(); 
			var dpt = aa.people.getDepartmentList(null).getOutput();
			var suof = suo.deptOfUser;
			var deptstring = suof.split("/");
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();
				var n = deptstring[0] + "/" + deptstring[1] + "/" + deptstring[2] + "/" + deptstring[3] + "/" + deptstring[4] + "/" + deptstring[5] + "/NA";
					if (n == m){
							return(p);	
							//return(n); //MCPHD/MCPHD/EH/HOUSING/MGRA/TEAMC/NA
					}		
				}
			}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHC_getMyDepartment:  " + err.message);
		logDebug(err.stack);
		}
	}