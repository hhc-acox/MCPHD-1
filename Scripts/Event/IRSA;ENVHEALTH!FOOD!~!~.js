try {
    applyOWL(capId);
} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message);
}
try {
    applyCitationAmount(capId);
} catch (err) {
    logDebug("A JavaScript Error occured applying citation: " + err.message);
}
