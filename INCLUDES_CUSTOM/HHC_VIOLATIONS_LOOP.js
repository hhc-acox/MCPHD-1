function HHC_VIOLATIONS_LOOP() 
{
	try{
		finVIOLATIONS = loadASITable('VIOLATIONS');
			if (finVIOLATIONS && finVIOLATIONS.length > 0) {
				fixVIOLATIONS = loadASITable('VIOLATIONS');
				removeASITable('VIOLATIONS');
			}
			if (finVIOLATIONS && finVIOLATIONS.length > 0) {
				for(i in fixVIOLATIONS) {
					eachrow = fixVIOLATIONS[i];
					if (matches(eachrow['Status'],'Open', 'Court')) {
						fixVIOLATIONS[i]['Status'] ='Final';
					}

				}

			}

		if (finVIOLATIONS && finVIOLATIONS.length > 0) {
			addASITable('VIOLATIONS',fixVIOLATIONS);
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP:  " + err.message);
		logDebug(err.stack);
	}
}
