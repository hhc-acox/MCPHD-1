try {
    doFoodsChecklists(inspId, capId)
} catch (err) {
    logDebug("A JavaScript Error occured populating checklists: " + err.message);
}
