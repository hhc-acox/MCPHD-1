function HHC_VIOLATIONS_LOOP() 
{
	try{
		loadASITable('VIOLATIONS');
			if (tableHasRows('VIOLATIONS')) {
				fixVIOLATIONS = loadASITable('VIOLATIONS');
				removeASITable('VIOLATIONS');
			}
			if (tableHasRows('VIOLATIONS')) {
				for(i in fixVIOLATIONS) {
					eachrow = fixVIOLATIONS[i];
					if (matches(eachrow['Status'],'Open', 'Court')) {
						fixVIOLATIONS[i]['Status'] ='Final';
					}

				}

			}

		if (tableHasRows('VIOLATIONS')) {
			addASITable('VIOLATIONS',fixVIOLATIONS);
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP:  " + err.message);
		logDebug(err.stack);
	}
}