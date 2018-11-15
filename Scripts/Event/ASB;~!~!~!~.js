try{
	var reqDocs = sepGetReqdDocs();
	if(reqDocs.length>0){
		cancel = true;
		showMessage = true;
		logDebug("The following documents are required: ");
		for (x in reqDocs){
			logDebug(reqDocs[x]["docGroup"] + " - " + reqDocs[x]["docType"]  + br);
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: ASB:*/*/*/*: " + err.message);
	logDebug(err.stack)
}



