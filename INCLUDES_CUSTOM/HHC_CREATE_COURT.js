function HHC_CREATE_COURT(){
	try{
		HHC_ODYSSEY_PROCESS();
		crtConAry=nextNameArr;
		concnt = y;
		HHC_CREATE_CRT_CASES();
			}
	catch(err){
	logDebug("A JavaScript Error occurred: HHC_CREATE_COURT:  " + err.message);
	logDebug(err.stack);
				}
}