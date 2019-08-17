function HHC_CREATE_BODYART_LICENSE() {
	try{
		showMessage = true;
		var saveID = capId;
		var currDate = new Date();
		var assignedInspector = HHC_getCapAssignment();
		currDate = dateAdd(null,0);
		//EnvHealth/WQ/Body Art/License
		newChildID = createChild('EnvHealth','WQ','Body Art','License','');
		copyAppSpecific(newChildID);
		copyOwner(saveID, newChildID);
		copyASITables(saveID,newChildID);
		updateAppStatus('Active','Created from Body Art Application',newChildID);
		assignCap(areaInspector,newChildID);
		updateTask('Issuance','Active',null, null, null,newChildID);
		capId = newChildID;
		scheduleInspectDate('Initial',nextWorkDay(dateAdd(null,89)),assignedInspector);
		capId = saveID;
		HHC_GET_ADDRESS_FOR_CHILD();	
	}
	catch(err){
		logDebug("A JavaScript Error occurred: HHC_CREATE_BODYART_LICENSE:  " + err.message);
		logDebug(err.stack);
	}
}
