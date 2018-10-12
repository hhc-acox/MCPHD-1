//lwacht: 181011: reschedule inspection if site is breeding
try{
	if(matches(appTypeArray[2],"LarvicideSite","MonitorSite")){
		if(inspResult!="Unable to Inspect"){
			var siteBreeding = getGuidesheetASIValue(inspId,"VC_Larvicide","SITE INFORMATION","VC_LVCCKLST","LARVICIDE","Is Site Breeding");
			logDebug("siteBreeding: " + siteBreeding);
			if(siteBreeding=="Yes" && !getScheduledInspId("Recheck")){
				scheduleInspectDate("Recheck",dateAdd(null,14));
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/VC/*/NA: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181011: end
