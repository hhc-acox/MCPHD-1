function HHC_myTeamLeadersDepartment(username)
	{
		try{
	var suo = aa.person.getUser(username).getOutput(); 
	var dpt = aa.people.getDepartmentList(null).getOutput();
	for (var thisdpt in dpt)
	  	{
	  	var m = dpt[thisdpt];
		var n = m.getServiceProviderCode() + "/" + m.getAgencyCode() + "/" + m.getBureauCode() + "/" + m.getDivisionCode() + "/" + m.getSectionCode() + "/" + m.getGroupCode() + "/" + m.getOfficeCode();
			if (n.equals(suo.deptOfUser))
					{
		
					var sup = aa.people.getDepartmentList(null).getOutput();
					for (s in sup)
						if(sup[s].getGroupCode() == m.getGroupCode() && sup[s].getOfficeCode() == 'NA')
						{
					return(sup[s]);
				}
			}
		}
	}
	catch(err){
	logDebug("A JavaScript Error occurred: HHC_myTeamLeadersDepartment" + err.message);
	logDebug(err.stack)
	}
}
//CCLARK@HAHPDC1.HHCORP.ORG