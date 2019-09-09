function HHC_assignDeptCap(Department) // optional CapId
	{
		try{
	var itemCap = capId;
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

		cd = cdScriptObj.getCapDetailModel();

		var dpt = aa.people.getDepartmentList(null).getOutput();
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();

					if (p == Department){
							cd.setAsgnDept(Department);	
							cdWrite = aa.cap.editCapDetail(cd);
					}
				}
		}
		catch(err){
			logDebug("A JavaScript Error occurred: HHC_assignDeptCap: " + err.message);
			logDebug(err.stack)
		}
	}				
