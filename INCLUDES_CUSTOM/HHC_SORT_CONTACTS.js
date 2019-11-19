function HHC_SORT_CONTACTS() 
{
	try{
		showMessage=true;
		appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
		appConType = cContactAry[yy].getCapContactModel().getContactType();
		appSeqNum = cContactAry[yy].getCapContactModel().getPeople().getContactSeqNumber();
		appConRelate = cContactAry[yy].getCapContactModel().getPeople().getRelation();
		cTempAry[yy] = [[appName],[appConType],[appConRelate],[appSeqNum]];
		cTempAry.sort();
		comment(cTempAry[yy][0]+' - '+cTempAry[yy][1]+' - '+cTempAry[yy][2]+' - '+cTempAry[yy][3]);
			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_SORT_CONTACTS:  " + err.message);
			logDebug(err.stack);
			}
}
