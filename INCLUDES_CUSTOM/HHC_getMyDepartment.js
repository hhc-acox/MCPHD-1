function HHC_getMyDepartment(username)
	{
		try{
			if (username != null) {
			var suo = aa.person.getUser(username).getOutput(); 
			var dpt = aa.people.getDepartmentList(null).getOutput();
			if(!suo.getSuccess()){
				continue;
			}
			else{
			var suof = '';
			if (suo.deptOfUser != null){
				suof = suo.deptOfUser;
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();
				var n = m.getServiceProviderCode() + "/" + m.getAgencyCode() + "/" + m.getBureauCode() + "/" + m.getDivisionCode() + "/" + m.getSectionCode() + "/" + m.getGroupCode() + "/" + m.getOfficeCode();
					if (n == suof){
							return(p);	
						}					
					}		
				}
			}
			}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHC_getMyDepartment:  " + err.message);
		logDebug(err.stack);
		}
	}
