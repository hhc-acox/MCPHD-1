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
							if (matches(appTypeArray[1],'WQ')){
									logDebug("HHC_GET_OFFENSE_CODES: Water Quality Case");
									loadASITables();
									var crtVIOLATIONS = loadASITable('CURRENT VIOLATIONS');
										if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
											for(a in crtVIOLATIONS) {
												thisrow = crtVIOLATIONS[a];
													if (matches(thisrow['Status'],'OUT','COS') && !matches(thisrow['Violation'],null)) {
														v = thisrow['Chapter'].toString();
														v = v.replace(/^\s+|\s+$/g,''); //Trims the string of leading and trailing spaces
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
