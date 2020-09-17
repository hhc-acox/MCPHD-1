if (matches(wfStatus, "Court", "Court Case", "Refer to Court", "Reinspection", "Complete Reinspection Ltr", "Reinspection Letter", "Complete Reinspection Letter")) {
    validateAdditionalViolations();
}

if (matches(wfStatus, "Court", "Court Case", "Refer to Court")) {
    if(!HHC_VALIDATE_OFFENSE_CODES()){
        cancel = true;
        showMessage = true;
        comment("<font color=red><b>Cannot file a court case without offense codes. Please make sure at least one violation matches to an offense code.</b></font>");
        aa.print("Cannot file a court case with offense codes. Please make sure at least one violation matches to an offense code.");
    }
}
