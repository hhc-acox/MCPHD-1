function HHC_CheckContact() 
{
	try{
		showMessage=true;
		appName = cTempAry[yy][0];
		cContactTypeToCheckFor = cTempAry[yy][1];
		cContactSeqNum = cTempAry[yy][2];
		
			if (appName != prevName && (matches(cContactTypeToCheckFor, 'Property Owner','Tenant','Responsible Party'))) 
						
			{
				addCourtCase = true;
			}

			if (addCourtCase) {
				y++;
			}

		nextNameArr[yy] = [[y],[appName],[cContactTypeToCheckFor],[cContactSeqNum]];
		comment(nextNameArr[yy][0]+' - '+nextNameArr[yy][1]+' - '+nextNameArr[yy][2]+' - '+nextNameArr[yy][3]);
		prevName=String(appName);
		addCourtCase = false;
		cContactTypeToCheckFor = '';
		cContactRelate = '';

		}	
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CheckContact:  " + err.message);
			logDebug(err.stack);
		}
}
