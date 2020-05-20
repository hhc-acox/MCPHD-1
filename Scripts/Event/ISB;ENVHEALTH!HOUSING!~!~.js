if(!InspectorFirstName || InspectorFirstName == '') {
    showMessage = true;
    comment("Cannot schedule without inspector");
    cancel = true;
}
