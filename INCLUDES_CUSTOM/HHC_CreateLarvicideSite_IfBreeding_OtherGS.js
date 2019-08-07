function HHC_CreateLarvicideSite_IfBreeding_OtherGS(gName,gItem,asiGroup,asiSubGroup){
	try{
		var asiLabel = "Is Site Breeding";
		var myResult = getGuidesheetASIValue(inspId,gName,gItem,asiGroup,asiSubGroup,asiLabel);
			if(myResult=="Yes"){
			//Create the Larvicide Site Case
			newChildID = createChild('EnvHealth','VC','LarvicideSite','NA','');
			// Add Case and Data Fields Info
			copyAppSpecific(newChildID);
						}
}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: CreateLarvicideSite_IfBreeding_OtherGS:  " + err.message);
		logDebug(err.stack);
	}
}