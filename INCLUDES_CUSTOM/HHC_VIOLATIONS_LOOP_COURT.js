function HHC_VIOLATIONS_LOOP_COURT() 
{
	try{
		loadASITable('VIOLATIONS');
		AllFinaled = false;
		if (tableHasRows('VIOLATIONS')) {
			fixVIOLATIONS = loadASITable('VIOLATIONS');
			iRows = fixVIOLATIONS.length;
			iFins = 0;
			removeASITable('VIOLATIONS');
		}

		if (tableHasRows('VIOLATIONS')) {
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

		if (tableHasRows('VIOLATIONS')) {
		addASITable('VIOLATIONS',fixVIOLATIONS);
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP_COURT:  " + err.message);
		logDebug(err.stack);
	}
}