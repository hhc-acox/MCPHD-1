function HHC_VALIDATE_OFFENSE_CODES() {
    try {
        var code10or19 = AInfo['Ordinance Chapter'] + '';
        //get Violation Table from current record and interrogate each violation and determine the violation column value
        var vioCodeNums = '';
        var violations = new Array();
        var newVioCode = '';
        var uniqVioCodes = '';
        if (matches(appTypeArray[2], 'HSG', 'TRA')) {
            crtVIOLATIONS = loadASITable('VIOLATIONS');
            if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
                for (a in crtVIOLATIONS) {
                    thisrow = crtVIOLATIONS[a];
                    if (matches(thisrow['Status'], 'Court') && !matches(thisrow['Violation'], null)) {
                        //for each value look up the corresponding codes in the translation table that fits the case and push each code set to an array:
                        //HSG Cases
                        var v = '';

                        if (matches(appTypeArray[2], 'HSG')) {
                            if (parseInt(code10or19) == 10) {
                                v = lookup('VioCode_Chpt10_Occ', crtVIOLATIONS[a]['Violation']);
                            }
                            if (parseInt(code10or19) == 19) {
                                v = lookup('VioCode_Chpt19', crtVIOLATIONS[a]['Violation']);
                            }
                            if (!v || v == '' || v == null || v == 'null') {
                                v = thisrow['Other/Violation Description'].toString();
                                if (v.indexOf(' ') > -1) {
                                    v = v.substr(0, v.indexOf(' '));
                                }  
                            }
                        }
                        //TRA Cases
                        if (matches(appTypeArray[2], 'TRA')) {
                            //Trash Occupied - Residential - VioCode_Chpt10_Occ
                            if (parseInt(code10or19) == 10 && AInfo['Property Type'] == 'Occupied') {
                                v = lookup('VioCode_Chpt10_Occ', crtVIOLATIONS[a]['Violation']);
                            }
                            //Trash on vacant lot - Residential - VioCode_Chpt10_VL
                            if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'], 'Vacant Lot')) {
                                v = lookup('VioCode_Chpt10_VL', crtVIOLATIONS[a]['Violation']);
                            }
                            //Trash on vacant structure - Residential - VioCode_Chpt10_VS
                            if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'], 'Vacant Structure')) {
                                v = lookup('VioCode_Chpt10_VS', crtVIOLATIONS[a]['Violation']);
                            }
                            //Trash Occupied - Commercial - VioCode_Chpt19
                            if (parseInt(code10or19) == 19 && AInfo['Property Type'] == 'Occupied') {
                                v = lookup('VioCode_Chpt19', crtVIOLATIONS[a]['Violation']);
                            }
                            //Trash on vacant structure - Commercial - VioCode_Chpt19_VS
                            if (parseInt(code10or19) == 19 && matches(AInfo['Property Type'], 'Vacant Structure')) {
                                v = lookup('VioCode_Chpt19_VS', crtVIOLATIONS[a]['Violation']);
                            }
                            if (parseInt(code10or19) == 19 && matches(AInfo['Property Type'], 'Vacant Lot')) {
                                v = lookup('VioCode_Chpt19_VS', crtVIOLATIONS[a]['Violation']);
                            }
                            if (!v || v == '' || v == null || v == 'null') {
                                v = thisrow['Other'].toString();

                                if (v.indexOf(' ') > -1) {
                                    v = v.substr(0, v.indexOf(' '));
                                }                                
                            }
                        }                        
                            
                        v = v.replace(/[^\d/]/g, '');
                        var vioSpl = v.split('/');

                        for (b in vioSpl) {
                            violations.push(vioSpl[b]);
                        }
                    }
                } // end for each row
            }
        }

        //LHH Cases using Current Violations
        if (matches(appTypeArray[2], 'LHH')) {
            var crtVIOLATIONS = loadASITable('VIOLATIONS');
            if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
                for (a in crtVIOLATIONS) {
                    thisrow = crtVIOLATIONS[a];
                    if (matches(thisrow['Status'], 'Court') && !matches(thisrow['Violation'], null, '')) {
                        var v = '';
                        if (parseInt(code10or19) == 10) {
                            v = lookup('VioCode_Chpt10_Occ',crtVIOLATIONS[a]['Violation']);
                        }
                        if (parseInt(code10or19) == 19) {
                            v = lookup('VioCode_Chpt19',crtVIOLATIONS[a]['Violation']);
                        }

                        if (v && v != '' && v != null) {
                            v = v.replace(/[^\d/]/g, '');
                            var vioSpl = v.split('/');

                            for (b in vioSpl) {
                                violations.push(vioSpl[b]);
                            }
                        }
                    }
                }
            }
        }

        if (matches(appTypeArray[1], 'Food') || matches(appTypeArray[1], 'WQ')) {
            var crtVIOLATIONS = loadASITable('CURRENT VIOLATIONS');
            if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
                for (a in crtVIOLATIONS) {
                    thisrow = crtVIOLATIONS[a];
                    if (matches(thisrow['Status'], 'OUT', 'COS', 'OUT - COS') && !matches(thisrow['Violation'], null)) {
                        var v = thisrow['Chapter'].toString();
                        v = v.replace(/[^\d,]/g, '');
                        var vioSpl = v.split(',');

                        for (b in vioSpl) {
                            violations.push(vioSpl[b]);
                        }
                    }
                }
            }
        }

        for (z in violations) {
            thisVioCode = violations[z];
            if (thisVioCode.indexOf('null') < 0 && thisVioCode != '' && thisVioCode != null) {
                return true;
            }
        }
        return false;
    } catch (err) {
        logDebug("A JavaScript Error occurred: HHC_VALIDATE_OFFENSE_CODES:  " + err.message);
        logDebug(err.stack);
    }
}
