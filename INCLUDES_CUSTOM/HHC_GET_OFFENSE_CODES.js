function HHC_GET_OFFENSE_CODES(saveID,childID) {
			try {
				if (!childID) {
					logDebug("Required parameter child ID is null");
					return;
				}
				capId = saveID;
				var code10or19 = AInfo['Ordinance Chapter']+'';
				logDebug("HHC_GET_OFFENSE_CODES: Starts here");
				//get Violation Table from current record and interrogate each violation and determine the violation column value
				var v = ''; 
				var vioCodeNums = '';
				var newVioCode = '';
				var uniqVioCodes = '';
				if (matches(appTypeArray[2],'HSG','TRA')){
				crtVIOLATIONS = loadASITable('VIOLATIONS');
				if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
					for(a in crtVIOLATIONS) {
						thisrow = crtVIOLATIONS[a];
						if (matches(thisrow['Status'],'Court') && !matches(thisrow['Violation'],null)) {
							//for each value look up the corresponding codes in the translation table that fits the case and push each code set to an array:
							//HSG Cases
								
								if (matches(appTypeArray[2],'HSG')){
									logDebug("HHC_GET_OFFENSE_CODES: Housing Case");
									logDebug("HHC_GET_OFFENSE_CODES: parseInt(code10or19) - "+parseInt(code10or19));
									if (parseInt(code10or19) == 10) {
										v = lookup('VioCode_Chpt10_Occ',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									if (parseInt(code10or19) == 19) {
										v = lookup('VioCode_Chpt19',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}	
							}													
							//TRA Cases
								if (matches(appTypeArray[2],'TRA')){
								//Trash Occupied - Residential - VioCode_Chpt10_Occ
								logDebug("HHC_GET_OFFENSE_CODES: Trash Case");
									if (parseInt(code10or19) == 10 && AInfo['Property Type'] == 'Occupied') {
										v = lookup('VioCode_Chpt10_Occ',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									//Trash on vacant lot - Residential - VioCode_Chpt10_VL
									if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'],'Vacant Lot')){
										v = lookup('VioCode_Chpt10_VL',crtVIOLATIONS[a]['Violation']);
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									//Trash on vacant structure - Residential - VioCode_Chpt10_VS
									if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'],'Vacant Structure')) {
										v = lookup('VioCode_Chpt10_VS',crtVIOLATIONS[a]['Violation']);
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									//Trash Occupied - Commercial - VioCode_Chpt19
									if (parseInt(code10or19) == 19 && AInfo['Property Type'] == 'Occupied') {
										v = lookup('VioCode_Chpt19',crtVIOLATIONS[a]['Violation']);
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									//Trash on vacant structure - Commercial - VioCode_Chpt19_VS
									if (parseInt(code10or19) == 19 && matches(AInfo['Property Type'],'Vacant Structure')) {
										v = lookup('VioCode_Chpt19_VS',crtVIOLATIONS[a]['Violation']);
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									} 
								}

							}
							else {
								logDebug("Status is not court or violation is null");
							}
						} // end for each row
					}
				}
			
									//LHH Cases using Guidesheets
								
								if (matches(appTypeArray[2],'LHH')){
									logDebug("HHC_GET_OFFENSE_CODES: LHH Case");
									logDebug("HHC_GET_OFFENSE_CODES: parseInt(code10or19) - "+parseInt(code10or19));
									if (parseInt(code10or19) == 10) {
										/* v = lookup('VioCode_Chpt10_Occ',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = ''; */
										vioCodeNums = '10307OI'
									}
									if (parseInt(code10or19) == 19) {
										/* v = lookup('VioCode_Chpt19',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = ''; */
										vioCodeNums = '19306OI'
									}	
							}
							
							if (matches(appTypeArray[1],'Food')){
									logDebug("HHC_GET_OFFENSE_CODES: Food Case");
										vioCodeNums = '19301OI'

									}	
							if (matches(appTypeArray[1],'WQ')){
									logDebug("HHC_GET_OFFENSE_CODES: Water Quality Case");
									//loadASITables();
									//var crtVIOLATIONS = [];
									var crtVIOLATIONS = loadASITable('CURRENT VIOLATIONS');
									//comment("this is what the thing looks like"+crtVIOLATIONS[0][0]);
										if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
											for(a in crtVIOLATIONS) {
												thisrow = crtVIOLATIONS[a];
													if (matches(thisrow['Status'],'Court') && !matches(thisrow['Violation'],null)) {
														v = thisrow['Chapter'];	
														v = v.replace(/-/g,'');
														vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
														vioCodeNums = vioCodeNums+'OI';
														v = '';
												}
											}
										}
							}
							var newVioCodes = vioCodeNums.match(/.{1,7}/g);	
							if (newVioCodes != null) {							
							logDebug('New Viocodes length for '+appTypeArray[2]+' - '+newVioCodes.length);
							} else {
							//newVioCodes.length = 0;	
							}
							for (z in newVioCodes) {
								thisVioCode = newVioCodes[z];
								newOffenseRow = new Array();
								newOffenseRow['OFFENSE CODE'] = new asiTableValObj("OFFENSE CODE", thisVioCode, 'N');
								addToASITable('OFFENSE CODES',newOffenseRow, childID);
							}	
		}	
		catch(err) {
			logDebug("A JavaScript Error occurred: HHC_GET_OFFENSE_CODES:  " + err.message);
			logDebug(err.stack);
		}
	}
