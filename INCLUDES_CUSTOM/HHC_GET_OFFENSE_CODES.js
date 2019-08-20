function HHC_GET_OFFENSE_CODES() {
		try {
			showMessage = true;
			showDebug = true; 
			masterArray = [];
			elementArray = [];
			code10or19 = AInfo['Ordinance Chapter'];
	//var saveID = capId;
//1. get Violation Table from Parent and interrogate each violation and determine the violation column value
			var v = ''; 
			var vioCodeNums = '';
			var newVioCode = '';
			loadASITable('VIOLATIONS');
				if (tableHasRows('VIOLATIONS')) {
					crtVIOLATIONS = loadASITable('VIOLATIONS');
					for(a in crtVIOLATIONS) {
						thisrow = crtVIOLATIONS[a];
						if (matches(thisrow['Status'],'Court') && !matches(thisrow['Violation'],null)) {
//3. for each value look up the corresponding codes in the translation table that fits the case and push each code set to an array:
							//Trash Occupied - Residential - VioCode_Chpt10_Occ
							if (parseInt(code10or19) == 10 && AInfo['Property Type'] == 'Occupied') {
								v = lookup('VioCode_Chpt10_Occ',crtVIOLATIONS[a]['Violation']);	
								v = v.replace(/-/g,'');
								vioCodeNums = vioCodeNums+v.replace(/\//g,'IO');
								vioCodeNums = vioCodeNums+'IO';
								v = '';
							}
							//Trash on vacant lot - Residential - VioCode_Chpt10_VL
							if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'],'Vacant Lot')){
								v = lookup('VioCode_Chpt10_VL',crtVIOLATIONS[a]['Violation']);
								v = v.replace(/-/g,'');
								vioCodeNums = vioCodeNums+v.replace(/\//g,'IO');
								vioCodeNums = vioCodeNums+'IO';
								v = '';
							}
							//Trash on vacant structure - Residential - VioCode_Chpt10_VS
							if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'],'Vacant Structure')) {
								v = lookup('VioCode_Chpt10_VS',crtVIOLATIONS[a]['Violation']);
								v = v.replace(/-/g,'');
								vioCodeNums = vioCodeNums+v.replace(/\//g,'IO');
								vioCodeNums = vioCodeNums+'IO';
								v = '';
							}
							//Trash Occupied - Commercial - VioCode_Chpt19
							if (parseInt(code10or19) == 19 && AInfo['Property Type'] == 'Occupied') {
								v = lookup('VioCode_Chpt19',crtVIOLATIONS[a]['Violation']);
								v = v.replace(/-/g,'');
								vioCodeNums = vioCodeNums+v.replace(/\//g,'IO');
								vioCodeNums = vioCodeNums+'IO';
								v = '';
							}
							//Trash on vacant structure - Commercial - VioCode_Chpt19_VS
							if (parseInt(code10or19) == 19 && matches(AInfo['Property Type'],'Vacant Structure')) {
								v = lookup('VioCode_Chpt19_VS',crtVIOLATIONS[a]['Violation']);
								v = v.replace(/-/g,'');
								vioCodeNums = vioCodeNums+v.replace(/\//g,'IO');
								vioCodeNums = vioCodeNums+'IO';
								v = '';
							} 

//4. Take the complete array and loop through the list doing the following:
	//for each item remove the part of the string before the "/" and put it in a field in a new array, remove the "/" and do this again for the number of "/" in the string until all string parts are in their own row in the new array.
	//For each row in the column:
	  // remove the "-" and add "OI" at the end
						}
						
						newVioCode = vioCodeNums.match(/.{1,7}/g);
						comment('the value is: '+newVioCode);
									//elementArray['OFFENSE CODE'] = newVioCode;
									//masterArray['OFFENSE CODE'] = newVioCode;
									//comment('elementArray: '+elementArray['OFFENSE CODE'].value);
							//		comment('y: '+y);
							//		comment('x: '+x);
									//comment('elementArray: '+elementArray[y]);
									//comment('masterArray: '+masterArray[0]);
								//	comment('masterArray: '+masterArray[y]);
							//		newVioCode = '';
							//		y++;
						//} 

					}
						comment('the length of the string is: '+newVioCode.length);
						comment('the number of loops should be: '+newVioCode.length/5);
						comment('the value of newVioCode is '+newVioCode);
						comment('element 1 of newVioCode is ' newVioCode[0]);
						elementArray['OFFENSE CODE'] = [[0][newVioCode[0]]];
						//addASITable('OFFENSE CODES',elementArray, newChildID);
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);

				}
 				//if(y>0){
				//	masterArray.push(elementArray);
				//	addASITable('OFFENSE CODES',masterArray, newChildID);
				//for(var z=1; z<y; z++){
				//	addToASITable('OFFENSE CODES',masterArray[z], newChildID);
				//	comment('masterArray: '+masterArray);
				//	}
				//}					
			}
		catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_OFFENSE_CODES:  " + err.message);
			logDebug(err.stack);
		}
	}
