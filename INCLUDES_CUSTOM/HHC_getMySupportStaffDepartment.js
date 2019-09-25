function HHC_getMySupportStaffDepartment(username)
	{
		try{
			if (username.length>0){
			var suo = aa.person.getUser(username).getOutput(); 
			var dpt = aa.people.getDepartmentList(null).getOutput();
			var suof = suo.deptOfUser;
			var deptstring = suof.split("/");
			var n = ''; zero = deptstring[0]; one = deptstring[1]; two = deptstring[2]; three = deptstring[3]; four = deptstring[4]; five = deptstring[5]; six = "/SUPP";
				switch (true) {
						case deptstring[3] == 'EHSM':
						case deptstring[3] == 'FOODS':
						case deptstring[3] == 'WQ':
							four = "NA"; 
							five = "NA";
							break;
						case deptstring[3] == 'HHECMSC':
							four = "NA"; 
							five = "CLINTEAM";
							break;					
						case deptstring[3] == 'VECTOR':
							four = "MOSQCTL"; 
							five = "NA"; 
							break;
						case deptstring[3] == 'HOUSING':
							four = "MGRB";
							five = "TEAMG";
							break;
						default:
							four = "NA"; 
							five = "NA";
				}
				n = zero + "/" + one + "/" + two + "/" + three + "/" + four + "/" + five + six;
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();
					if (n == m){
							return(p);	
					}		
				}
			}
			}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHC_getMySupportStaffDepartment:  " + err.message);
		logDebug(err.stack);
		}
	}
