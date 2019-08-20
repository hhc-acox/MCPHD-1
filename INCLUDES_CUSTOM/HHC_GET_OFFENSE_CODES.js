function HHC_GET_OFFENSE_CODES() {
		try {
			showMessage = true;
			showDebug = true; 
			masterArray = [];
			elementArray = [];
			code10or19 = AInfo['Ordinance Chapter'];
//get Violation Table from Parent and interrogate each violation and determine the violation column value
			var v = ''; 
			var vioCodeNums = '';
			var newVioCode = '';
			var uniqVioCodes = '';
			loadASITable('VIOLATIONS');
				if (tableHasRows('VIOLATIONS')) {
					crtVIOLATIONS = loadASITable('VIOLATIONS');
					for(a in crtVIOLATIONS) {
						thisrow = crtVIOLATIONS[a];
						if (matches(thisrow['Status'],'Court') && !matches(thisrow['Violation'],null)) {
//for each value look up the corresponding codes in the translation table that fits the case and push each code set to an array:
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
							}
							newVioCode = vioCodeNums.match(/.{1,7}/g);
						
						}
							comment('the value of newVioCode is '+newVioCode);
							comment('element 1 of newVioCode is ' +newVioCode[0]);
							uniqVioCodes = newVioCode.filter(onlyUnique);
							comment('the value of uniqVioCodes is '+uniqVioCodes);
							comment('element 1 of uniqVioCodes is ' +uniqVioCodes[0]);
							var w = 0;
							var x = 0;
							var y = 0;
							var z = '';
							x = uniqVioCodes.length;
							for (w in uniqVioCodes){
							z = uniqVioCodes[w];	
							elementArray['OFFENSE CODE'] = z;
							addToASITable('OFFENSE CODES',elementArray, newChildID);
					}

				}
				
			}
		catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_OFFENSE_CODES:  " + err.message);
			logDebug(err.stack);
		}
	}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
