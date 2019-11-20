function HHC_SORT_CONTACTS() 
{
	try{
		showMessage=true;
		appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
		if (!matches(cContactAry[yy].getCapContactModel().getPeople().getRelation(),'Responsible Party')) {
			appConType = cContactAry[yy].getCapContactModel().getContactType();
		}
		else 
		{appConType =cContactAry[yy].getCapContactModel().getPeople().getRelation();}
		appSeqNum = cContactAry[yy].getCapContactModel().getPeople().getContactSeqNumber();
		
		if appConType
		cTempAry[yy] = [[appName],[appConType],[appSeqNum]];
		cTempAry.sort();
		comment(cTempAry[yy][0]+' - '+cTempAry[yy][1]+' - '+cTempAry[yy][2]);
			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_SORT_CONTACTS:  " + err.message);
			logDebug(err.stack);
			}
}
