function HHC_CREATE_RCP_CASE() {
	try{
		showMessage = true;
		var saveID = capId;
		var currDate = new Date();
		var asgnTo = getAppSpecific('Assigned To');
		currDate = dateAdd(null,0);
		var crtOrder = 'No';
		//var aStatus = getAppStatus();
		//var isItPM = 'No';
		if(isTaskStatus('Requesting Admin Court Order','Admin Court Order Obtained')){crtOrder = 'Yes';}
		//if (aStatus = 'Permanent Injuction'){isItPM = 'Yes';}
		newChildID = createChild('EnvHealth','EHSM','RCP','NA','');
		copyAppSpecific(newChildID);
		editAppSpecific('TRA Case',capIDString,newChildID);
		editAppSpecific('Assigned To EHS',asgnTo,newChildID);
		editAppSpecific('Referral Date',currDate,newChildID);
		editAppSpecific('Court Order',crtOrder,newChildID);
		//editAppSpecific('Permanent Injunction',isItPM,newChildID);
		copyASITables(saveID,newChildID);
		HHC_GET_ADDRESS_FOR_CHILD();	
	}
	catch(err){
		logDebug("A JavaScript Error occurred: HHC_CREATE_RCP_CASE:  " + err.message);
		logDebug(err.stack);
	}
}
