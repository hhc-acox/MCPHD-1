function HHC_getMyTeamLeadersUserID(username)
{
	try{
		var suo = aa.person.getUser(username).getOutput(); 
		var dpt = aa.people.getDepartmentList(null).getOutput();
		if (suo != null) {
			var suof = suo.deptOfUser;
			var deptstring = suof.split("/");
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();
				var n = deptstring[0] + "/" + deptstring[1] + "/" + deptstring[2] + "/" + deptstring[3] + "/" + deptstring[4] + "/" + deptstring[5] + "/NA";
					if (n == m){
						var peo = aa.people.getSysUserList(null).getOutput();
							for(x in peo){
								var p = peo[x];
								var q = (p.getServiceProviderCode() + "/" + p.getAgencyCode() + "/" + p.getBureauCode() + "/" + p.getDivisionCode() + "/" + p.getSectionCode() + "/" + p.getGroupCode() + "/" + p.getOfficeCode());
									if (q == n){
									return(p.getUserID());
						}
					}		
				}
			}
		}
	}
	catch(err)
	{
	logDebug("A JavaScript Error occurred: HHC_getMyTeamLeadersUserID:  " + err.message);
	logDebug(err.stack);
	}
}
