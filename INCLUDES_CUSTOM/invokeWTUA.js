function invokeWTUA(twfTask, twfStatus) // optional app type string 
{  
    var tAppTypeString = null;

    // set globals
    wfTask = twfTask;
    wfStatus = twfStatus;

    // handle optional appTypeString param
    if (arguments.length >= 3 && arguments[2] != null && arguments[2] != '') {
        tAppTypeString = arguments[2];
    } else {
        tAppTypeString = appTypeString;
    }

    if (tAppTypeString) {
        // get pieces of appTypeString
        var tappTypeSpl = tAppTypeString.split("/");
        
        // if the appTypeString supplied is valid
        if (tappTypeSpl.length = 4) {
            // include WTUA:EnvHealth/*/*/*
            var baseString = "WTUA:EnvHealth/*/*/*";
            try {
                include(String(baseString)); // invoke WTUA:EnvHealth/*/*/*
            } catch (err) {
                logDebug("An error occurred invoking " + baseString + " in invokeWTUA(): " + err.message);
                logDebug(err.stack)
            }
    
            // include WTUA:EnvHealth/Type/*/*
            var typeString = "WTUA:EnvHealth/" + tappTypeSpl[1] + "/*/*";
            try {
                include(String(typeString)); // invoke WTUA:EnvHealth/Type/*/*
            } catch (err) {
                logDebug("An error occurred invoking " + typeString + " in invokeWTUA(): " + err.message);
                logDebug(err.stack)
            }
            // include WTUA:EnvHealth/Type/Subtype/*
            var subtypeString = "WTUA:EnvHealth/" + tappTypeSpl[1] + "/" + tappTypeSpl[2] + "/*";
            try {
                include(String(subtypeString)); // invoke WTUA:EnvHealth/Type/Subtype/*
            } catch (err) {
                logDebug("An error occurred invoking " + subtypeString + " in invokeWTUA(): " + err.message);
                logDebug(err.stack)
            }
            // include WTUA:EnvHealth/Type/Subtype/Category
            var categoryString = "WTUA:EnvHealth/" + tappTypeSpl[1] + "/" + tappTypeSpl[2] + "/" + tappTypeSpl[3];
            try {
                include(String(categoryString)); //  invoke WTUA:EnvHealth/Type/Subtype/Category
            } catch (err) {
                logDebug("An error occurred invoking " + categoryString + " in invokeWTUA(): " + err.message);
                logDebug(err.stack)
            }
        } else {
            logDebug('Cannot execute invokeWTUA(): appTypeString does not include a valid 4 part Accela record structure.');
        }
    } else {
        logDebug('Cannot execute invokeWTUA(): appTypeString is null or undefined.');
    }
    
}
