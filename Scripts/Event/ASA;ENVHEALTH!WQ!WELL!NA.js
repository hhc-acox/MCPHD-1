//GQ TICKET 259
if (!publicUser) {

    //runs async after record created so that assignment happens properly
    var parameters = aa.util.newHashMap();       

    parameters.put("recordId",String(capIDString)); 
    parameters.put("AsyncScriptName","ASYNC:"+String(appTypeString).toUpperCase()); 
    parameters.put("currentUserID",currentUserID);         
    
    aa.runAsyncScript("EVENT_FOR_ASYNC", parameters);
}
