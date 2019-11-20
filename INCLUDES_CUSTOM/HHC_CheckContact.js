function HHC_CheckContact() 
{
	try{
		showMessage=true;
		appName = cTempAry[yy][0];
		cContactTypeToCheckFor = cTempAry[yy][1];
		cContactSeqNum = cTempAry[yy][2];
		cContactRelate = cTempAry[yy][3];
			if (appName != prevName && (matches(cContactTypeToCheckFor, 'Deed Holder','Occupant') || cContactRelate == 'Responsible Party')) 
			
			{
				addCourtCase = true;
			}

			if (addCourtCase) {
				y++;
			}

		nextNameArr[yy] = [[y],[appName],[cContactTypeToCheckFor],[cContactSeqNum],[cContactRelate]];
		comment(nextNameArr[yy][0]+' - '+nextNameArr[yy][1]+' - '+nextNameArr[yy][2]+' - '+nextNameArr[yy][3]+' - '+nextNameArr[yy][4]);
		prevName=String(appName);
		addCourtCase = false;
		cContactTypeToCheckFor = '';

		}	
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CheckContact:  " + err.message);
			logDebug(err.stack);
		}
}
