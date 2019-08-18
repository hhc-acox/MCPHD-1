	function HHC_GET_OFFENSE_CODES() {
		try {
			masterArray = new Array();
			elementArray = new Array();
			code10or19 = AInfo['Ordinance Chapter'];
	//var saveID = capId;
//1. get Violation Table from Parent and interrogate each violation and determine the violation column value
			var v = ''; 
			var numsOnlyGetter = /[0-9]/g;
			var vioCodeNums = '';
			var newVioCode = '';
			loadASITable('VIOLATIONS');
				if (tableHasRows('VIOLATIONS')) {
					fixVIOLATIONS = loadASITable('VIOLATIONS');
					for(i in fixVIOLATIONS) {
						eachrow = fixVIOLATIONS[i];
						if (matches(eachrow['Status'],'Court') && !matches(eachrow['Violation'],null)) {
//3. for each value look up the corresponding codes in the translation table that fits the case and push each code set to an array:
							//Trash Occupied - Residential - VioCode_Chpt10_Occ
							if (parseInt(code10or19) == 10 && AInfo['Property Type'] == 'Occupied') 
								v = lookup('VioCode_Chpt10_Occ',fixVIOLATIONS[i]['Violation']);	
								vioCodeNums = v.match(numsOnlyGetter);
									for(var x=0;x<vioCodeNums.length;x+5){
									newVioCode = vioCodeNums.substr(x, 5)+'IO';	
									elementArray['OFFENSE CODE'] = newVioCode;
									masterArray.push(elementArray);
									}
							//Trash on vacant lot - Residential - VioCode_Chpt10_VL
							if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'],'Vacant Lot')) 
								v = lookup('VioCode_Chpt10_VL',fixVIOLATIONS[i]['Violation']);
							//Trash on vacant structure - Residential - VioCode_Chpt10_VS
							if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'],'Vacant Structure')) 
								v = lookup('VioCode_Chpt10_VS',fixVIOLATIONS[i]['Violation']);
							//Trash Occupied - Commercial - VioCode_Chpt19
							if (parseInt(code10or19) == 19 && AInfo['Property Type'] == 'Occupied') 
								v = lookup('VioCode_Chpt19',fixVIOLATIONS[i]['Violation']);
							//Trash on vacant structure - Commercial - VioCode_Chpt19_VS
							if (parseInt(code10or19) == 19 && matches(AInfo['Property Type'],'Vacant Structure')) 
								v = lookup('VioCode_Chpt19_VS',fixVIOLATIONS[i]['Violation']);
//4. Take the complete array and loop through the list doing the following:
	//for each item remove the part of the string before the "/" and put it in a field in a new array, remove the "/" and do this again for the number of "/" in the string until all string parts are in their own row in the new array.
	//For each row in the column:
	  // remove the "-" and add "OI" at the end
						}
					}
				}
				addASITable('OFFENSE CODES',masterArray, newChildID);
			}
		catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP:  " + err.message);
			logDebug(err.stack);
		}
	}
