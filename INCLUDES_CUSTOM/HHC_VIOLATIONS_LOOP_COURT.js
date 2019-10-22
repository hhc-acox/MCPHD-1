function HHC_VIOLATIONS_LOOP_COURT() 
{
	try{
		crtVIOLATIONS = loadASITable('VIOLATIONS');
		AllFinaled = false;
		if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
			fixVIOLATIONS = loadASITable('VIOLATIONS');
			iRows = fixVIOLATIONS.length;
			iFins = 0;
			removeASITable('VIOLATIONS');
		}

		if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
			for(i in fixVIOLATIONS) {
				eachrow = fixVIOLATIONS[i];
				{
					if (matches(eachrow['Status'],'Final')) {
					iFins=iFins+1;
					}
				}
					if (matches(eachrow['Status'],'Open')) {
					fixVIOLATIONS[i]['Status'] ='Court';
					}
			}
		}

		if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
		addASITable('VIOLATIONS',fixVIOLATIONS);
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP_COURT:  " + err.message);
		logDebug(err.stack);
	}
}
