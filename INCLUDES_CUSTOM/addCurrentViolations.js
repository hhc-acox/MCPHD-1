function addCurrentViolations() {
    if (appTypeString.indexOf('LHH') > -1) {
        var asitRes = aa.appSpecificTableScript.getAppSpecificTableModel(capId, 'VIOLATIONS');

        if (asitRes.getSuccess()) {
            removeASITable('VIOLATIONS');
            try {
                inspResultObj = aa.inspection.getInspections(capId);

                if (inspResultObj.getSuccess()) {
                    inspList = inspResultObj.getOutput();

                    for (i in inspList) {
                        if (inspId == inspList[i].getIdNumber()) {
                            var gs = getGuideSheetObjects(inspList[i].getIdNumber());

                            for (i in gs) {
                                if (gs[i].gsType == 'LHH_Violations') {
                                    gs[i].loadInfoTables();

                                    var tableRows = gs[i].infoTables["VIOLATIONS"];

                                    for (j in tableRows) {
                                        var status = tableRows[j]["Status"];
                                        var date = tableRows[j]["Date"];
                                        var violation = tableRows[j]["Violation"];
                                        var xrf = tableRows[j]["XRF Result"];
                                        var explanation = tableRows[j]["Explanation"];
                                        var location = tableRows[j]["Location"];
                                        var dir = tableRows[j]["DIR"];
                                        var dhcb = tableRows[j]["DH/CB"];
                                        var oc = tableRows[j]["OC"];
                                        var ip = tableRows[j]["IP"];
                                        var other = tableRows[j]["Other"];

                                        if (!status) {
                                            status = "";
                                        }
                                        if (!date) {
                                            date = "";
                                        }
                                        if (!violation) {
                                            violation = "";
                                        }
                                        if (!xrf) {
                                            xrf = "";
                                        }
                                        if (!explanation) {
                                            explanation = "";
                                        }
                                        if (!location) {
                                            location = "";
                                        }
                                        if (!dir) {
                                            dir = "";
                                        }
                                        if (!dhcb) {
                                            dhcb = "";
                                        }
                                        if (!oc) {
                                            oc = "";
                                        }
                                        if (!ip) {
                                            ip = "";
                                        }
                                        if (!other) {
                                            other = "";
                                        }
                                        var rowVals = new Array();
                                        rowVals["Status"] = new asiTableValObj("Status", status, "Y");
                                        rowVals["Date"] = new asiTableValObj("Date", date, "Y");
                                        rowVals["Violation"] = new asiTableValObj("Violation", violation, "Y");
                                        rowVals["XRF Result"] = new asiTableValObj("XRF Result", xrf, "Y");
                                        rowVals["Explanation"] = new asiTableValObj("Explanation", explanation, "Y");
                                        rowVals["Location"] = new asiTableValObj("Location", location, "Y");
                                        rowVals["DIR"] = new asiTableValObj("DIR", dir, "Y");
                                        rowVals["DH/CB"] = new asiTableValObj("DH/CB", dhcb, "Y");
                                        rowVals["OC"] = new asiTableValObj("OC", oc, "Y");
                                        rowVals["IP"] = new asiTableValObj("IP", ip, "Y");
                                        rowVals["Other"] = new asiTableValObj("Other", other, "Y");
                                        var asitName = "VIOLATIONS";
                                        addToASITable(asitName, rowVals, capId);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                logDebug("A JavaScript Error occurred: Adding Violations to ASIT:  " + err.message);
                logDebug(err.stack);
            }
        }
    } else {
        var asitRes = aa.appSpecificTableScript.getAppSpecificTableModel(capId, 'CURRENT VIOLATIONS');

        if (asitRes.getSuccess()) {
            try {
                inspResultObj = aa.inspection.getInspections(capId);

                if (inspResultObj.getSuccess()) {
                    inspList = inspResultObj.getOutput();
                    var appInspector = getInspectorByInspID(inspId);

                    // Clear CURRENT VIOLATIONS if submitted inspection is an Initial or Routine, but not recheck
                    if ((inspType.indexOf('Initial') > -1 || inspType.indexOf('Routine') > -1) && inspType.indexOf('Recheck') < 0) {
                        removeASITable('CURRENT VIOLATIONS');
                    }

                    for (i in inspList) {
                        if (inspId == inspList[i].getIdNumber()) {
                            var tInspDate = inspList[i].getInspectionDate();
                            var tInspDateStr = tInspDate.getMonth() + "/" + tInspDate.getDayOfMonth() + "/" + tInspDate.getYear();
                            var gs = getGuideSheetObjects(inspList[i].getIdNumber());
                            for (i in gs) {
                                var chpt = "";
                                var vioDesc = "";

                                if (gs[i].gsType.indexOf('Failed') > -1 && gs[i].status == 'IN') {
                                    // Handle failed checklist in compliance
                                    var n = gs[i].text.indexOf('|');
                                    var iTextLength = gs[i].text.lastIndexOf("");

                                    if (n == -1) {
                                        chpt = gs[i].text;
                                    } else {
                                        chpt = gs[i].text.slice(0, n - 1);
                                        vioDesc = gs[i].text.slice(n + 2, iTextLength);
                                    }

                                    var srchTable = new Array();
                                    var tableUpdated = false;
                                    srchTable = loadASITable('CURRENT VIOLATIONS');

                                    var srchTableHist = new Array();
                                    var histUpdated = false;
                                    srchTableHist = loadASITable('VIOLATION HISTORY');

                                    if (srchTable) {
                                        for (x in srchTable) {
                                            var thisRow = srchTable[x];

                                            if (thisRow['Chapter'].toString() == chpt && thisRow['Checklist Item'].toString() == vioDesc) {
                                                tableUpdated = true;
                                                thisRow['Status'] = new asiTableValObj("Status", 'IN', "N");
                                                thisRow['Corrected Date'] = new asiTableValObj("Corrected Date", tInspDateStr, "N");
                                            }
                                        }
                                    }

                                    if (srchTableHist) {
                                        for (x in srchTableHist) {
                                            var thisRow = srchTableHist[x];

                                            if (thisRow['Chapter'].toString() == chpt && thisRow['Checklist Item'].toString() == vioDesc) {
                                                histUpdated = true;
                                                thisRow['Status'] = new asiTableValObj("Status", 'IN', "N");
                                            }
                                        }
                                    }

                                    if (tableUpdated) {
                                        removeASITable('CURRENT VIOLATIONS');
                                        addASITable('CURRENT VIOLATIONS', srchTable);
                                    }

                                    if (histUpdated) {
                                        removeASITable('VIOLATION HISTORY');
                                        addASITable('VIOLATION HISTORY', srchTableHist);
                                    }
                                    
                                } else if ((gs[i].status == 'OUT' || gs[i].status == 'COS') && gs[i].gsType.indexOf('Failed') < 0) {
                                    // Handle new violations
                                    var tableRows = new Array();
                                    var locations = new Array();
                                    var location = "";

                                    gs[i].loadInfoTables();

                                    var n = gs[i].text.indexOf('|');
                                    var iTextLength = gs[i].text.lastIndexOf("");

                                    if (n == -1) {
                                        chpt = gs[i].text;
                                    } else {
                                        chpt = gs[i].text.slice(0, n - 1);
                                        vioDesc = gs[i].text.slice(n + 2, iTextLength);
                                    }

                                    // Handle Location
                                    if (appTypeString.indexOf('WQ') > -1) {
                                        tableRows = gs[i].infoTables["LOCATION"];
                                    }

                                    if (appTypeString.indexOf('Food') > -1) {
                                        tableRows = gs[i].infoTables["LOCATION-EQUIPMENT-TEMPERATURE"];
                                    }

                                    for (j in tableRows) { 
                                        var tLoc = tableRows[j]["Location"];

                                        if (tLoc) {
                                            locations.push(tLoc);
                                        }
                                    } 
                                    
                                    location = locations.join(', ');

                                    if (inspType.indexOf('Initial') > -1 || inspType.indexOf('Routine') > -1 || inspType.indexOf('Recheck') > -1 || inspType.indexOf('Complaint') > -1) {	
                                        var itemExists = searchASITableThreeVal("CURRENT VIOLATIONS", "Inspection Number", inspId, "Chapter", chpt, "Checklist Item", vioDesc, capId);

                                        if (!itemExists) {
                                            var rowVals = new Array();
                                            rowVals["Chapter"] = new asiTableValObj("Chapter", chpt, "N");
                                            rowVals["Checklist Item"] = new asiTableValObj("Checklist Item", vioDesc, "N");
                                            rowVals["Status"] = new asiTableValObj("Status", gs[i].status, "N");
                                            rowVals["Location"] = new asiTableValObj("Location", location, "N");
                                            rowVals["Violation"] = new asiTableValObj("Violation", gs[i].comment, "N");
                                            rowVals["Inspection Date"] = new asiTableValObj("Inspection Date", tInspDateStr, "N");
                                            rowVals["Inspection Number"] = new asiTableValObj("Inspection Number", inspId.toString(), "Y");
                                            rowVals["Inspection Type"] = new asiTableValObj("Inspection Type", inspType, "N");
                                            rowVals["Inspector"] = new asiTableValObj("Inspector", appInspector, "N");
    
                                            var rowVals2 = rowVals;
                                            rowVals2["Corrected Date"] = new asiTableValObj("Corrected Date", "", "N");
    
                                            if (appTypeString.indexOf('Food') > -1) {
                                                rowVals2["Guidesheet Sequence"] = new asiTableValObj("Guidesheet Sequence", gs[i].gsSequence.toString(), "Y");
                                                rowVals2["Item Sequence"] = new asiTableValObj("Item Sequence", gs[i].item.getGuideItemSeqNbr().toString(), "Y");
                                            }
    
                                            var asitName = "CURRENT VIOLATIONS";
                                            addToASITable(asitName, rowVals2, capId);
        
                                            var itemExistsHistory = searchASITableThreeVal("VIOLATION HISTORY", "Inspection Number", inspId, "Chapter", chpt, "Checklist Item", vioDesc, capId)

                                            if (!itemExistsHistory && appTypeString.indexOf('Food') < 0) {
                                                addToASITable("VIOLATION HISTORY", rowVals, capId);
                                            } else if (!itemExistsHistory) {
                                                addToASITable("VIOLATION HISTORY", rowVals2, capId);
                                            }
    
                                            if (appTypeString.indexOf('Food') > -1) {
                                                // Handle ASI
                                                gs[i].loadInfo();
                                                var asi = gs[i].info;
    
                                                var rowValsASI = new Array();
                                                rowValsASI["Violation Description"] = new asiTableValObj("Violation Description", asi["Violation Description"], "N");
                                                rowValsASI["Severity"] = new asiTableValObj("Severity", asi["Severity"], "N");
                                                rowValsASI["Citation"] = new asiTableValObj("Citation", asi["Citation"], "N");
                                                rowValsASI["Corrective Action"] = new asiTableValObj("Corrective Action", asi["Corrective Action"], "N");
                                                rowValsASI["Inspection Number"] = new asiTableValObj("Inspection Number", inspId.toString(), "Y");
                                                rowValsASI["Guidesheet Sequence"] = new asiTableValObj("Guidesheet Sequence", gs[i].gsSequence.toString(), "Y");
                                                rowValsASI["Item Sequence"] = new asiTableValObj("Item Sequence", gs[i].item.getGuideItemSeqNbr().toString(), "Y");
    
                                                addToASITable("AUX", rowValsASI, capId);
                                                
                                                // Handle ASIT
                                                for (k in tableRows) { 
                                                    var temp = "";
    
                                                    if (tableRows[k]["Temperature"]) {
                                                        temp = tableRows[k]["Temperature"].toString();
                                                    }
    
                                                    var locationASIT = "";
    
                                                    if (tableRows[k]["Location"]) {
                                                        locationASIT = tableRows[k]["Location"];
                                                    }
    
                                                    var equipment = "";
    
                                                    if (tableRows[k]["Equipment"]) {
                                                        equipment = tableRows[k]["Equipment"];
                                                    }
    
                                                    var rowValsASIT = new Array();
                                                    rowValsASIT["Location"] = new asiTableValObj("Location", locationASIT, "N");
                                                    rowValsASIT["Equipment"] = new asiTableValObj("Equipment", equipment, "N");
                                                    rowValsASIT["Temperature"] = new asiTableValObj("Temperature", temp, "N");
                                                    rowValsASIT["Inspection Number"] = new asiTableValObj("Inspection Number", inspId.toString(), "Y");
                                                    rowValsASIT["Guidesheet Sequence"] = new asiTableValObj("Guidesheet Sequence", gs[i].gsSequence.toString(), "Y");
                                                    rowValsASIT["Item Sequence"] = new asiTableValObj("Item Sequence", gs[i].item.getGuideItemSeqNbr().toString(), "Y");
                                                    
                                                    addToASITable("TEMPERATURE", rowValsASIT, capId);
                                                }
                                            }
    
                                            location = "";
                                        } else {
                                            var srchTable = new Array();
                                            var tableUpdated = false;
                                            srchTable = loadASITable('CURRENT VIOLATIONS');

                                            var srchTableHist = new Array();
                                            var histUpdated = false;
                                            srchTableHist = loadASITable('VIOLATION HISTORY');

                                            if (srchTable) {
                                                for (x in srchTable) {
                                                    var thisRow = srchTable[x];

                                                    if (thisRow['Chapter'].toString() == chpt && thisRow['Checklist Item'].toString() == vioDesc && thisRow["Inspection Number"].toString() == inspId.toString() && thisRow["Violation"].toString() != gs[i].comment) {
                                                        tableUpdated = true;
                                                        thisRow["Violation"] = new asiTableValObj("Violation", gs[i].comment, "N");
                                                    }
                                                }
                                            }

                                            if (srchTableHist) {
                                                for (x in srchTableHist) {
                                                    var thisRow = srchTableHist[x];

                                                    if (thisRow['Chapter'].toString() == chpt && thisRow['Checklist Item'].toString() == vioDesc && thisRow["Inspection Number"].toString() == inspId.toString() && thisRow["Violation"].toString() != gs[i].comment) {
                                                        histUpdated = true;
                                                        thisRow["Violation"] = new asiTableValObj("Violation", gs[i].comment, "N");
                                                    }
                                                }
                                            }

                                            if (tableUpdated) {
                                                removeASITable('CURRENT VIOLATIONS');
                                                addASITable('CURRENT VIOLATIONS', srchTable);
                                            }
        
                                            if (histUpdated) {
                                                removeASITable('VIOLATION HISTORY');
                                                addASITable('VIOLATION HISTORY', srchTableHist);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                logDebug("A JavaScript Error occurred: Adding Violations to ASIT:  " + err.message);
                logDebug(err.stack);
            }
        }
    }
}
