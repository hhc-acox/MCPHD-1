function HHC_CREATE_CRT_CASES() {
	try{
		showMessage = true;
		comment('cases to create '+concnt);
		fixNameArr= new Array();
		fixNameArr=crtConAry;
		cContactAry = new Array();
		var cContactResult = AInfo[''];
		cContactsExist = false;
		ccnt=0;
		cContactResult = aa.people.getCapContactByCapID(capId);
			if (cContactResult.getSuccess()) 
				{
					cContactsExist = true;
					}

			if (cContactsExist) 
				{
					cContactAry = cContactResult.getOutput();
					}

			if (cContactsExist) 
				{
					for (i=0; i<concnt; i++) 

					{
					cContactResult = AInfo[''];
					cContactsExist = false;
					cContactAry = new Array();
					nextNameArr = new Array();
					prevName = 'Start';
					cTempAry = new Array();
					var saveID = capId;
					comment("THE SAVEID IS "+saveID);
					cCapContactModel = AInfo[''];
					cContactSeqNumber = 0;
					cPeopleModel = AInfo[''];
					cc = 0;
					y = 0;
				{
					newChildID = createChild('EnvHealth','CRT','NA','NA','');
					copyAppSpecific(newChildID);
					comment('New child app id = '+ newChildID);
					masterArray = new Array();
					elementArray = new Array();
					code10or19 = AInfo['Ordinance Chapter'];
					updateAppStatus('Legal Review','Initial Status',newChildID);
					assignCap('BGREGORY@HAHPDC1.HHCORP.ORG',newChildID);
					editAppSpecific('Parent Case',capIDString,newChildID);
					
					if (appMatch('*/*/LHH/*')) 
					{
						editAppSpecific('Case Type','Lead',newChildID);
						editAppSpecific('Parent Case',saveID,newChildID);
						editAppSpecific('EHS Court Day','THURS',newChildID);
						editAppSpecific('EHS Court Time','1:00 PM',newChildID);
						}
					//This entire section needs to be rewritten to do the following:
					//1. Interrogate the parent case and get all of the Section Codes from the Violations, remove any / or - and put them in a string comma separated
					//2. split the string into individual numbers with "OI" at the end of each number.
					//3. Push each new number string to an array.
					//4. push the array to the CRT Offense Codes table.
					if (parseInt(code10or19) == 10 && appMatch('*/*/TRA/*') && AInfo['Property Type'] == 'Occupied') 
					{
						elementArray['OFFENSE CODE'] = '10301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						elementArray['OFFENSE CODE'] = '10302OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						elementArray['OFFENSE CODE'] = '10303OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						}

					if (parseInt(code10or19) == 10 && appMatch('*/*/TRA/*') && matches(AInfo['Property Type'],'Vacant Lot', 'Vacant Structure')) 
					{
						elementArray['OFFENSE CODE'] = '10301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						elementArray['OFFENSE CODE'] = '10303OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						}

					if (parseInt(code10or19) == 19 && appMatch('*/*/TRA/*') && AInfo['Property Type'] == 'Occupied') 
					{
						elementArray['OFFENSE CODE'] = '19301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						elementArray['OFFENSE CODE'] = '19302OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						elementArray['OFFENSE CODE'] = '19304OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						}

					if (parseInt(code10or19) == 19 && appMatch('*/*/TRA/*') && matches(AInfo['Property Type'],'Vacant Lot', 'Vacant Structure')) 
					{
						elementArray['OFFENSE CODE'] = '19301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						elementArray['OFFENSE CODE'] = '19303OI';
						addToASITable('OFFENSE CODES',elementArray, newChildID);
						}

					if (parseInt(code10or19) == 10 && appMatch('*/*/HSG/*')) 
					{
						elementArray['OFFENSE CODE'] = '10303OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						}

					if (parseInt(code10or19) == 19 && appMatch('*/*/HSG/*')) 
					{
						elementArray['OFFENSE CODE'] = '19301OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						}

					if (appMatch('*/*/LHH/*')) 
					{
						elementArray['OFFENSE CODE'] = '10303OI';
						masterArray.push(elementArray);
						addASITable('OFFENSE CODES',masterArray, newChildID);
						}
						
					HHC_GET_ADDRESS_FOR_CHILD();
				}
				ccnt++;
				comment('ccnt = '+ccnt);
				capId = newChildID;
				comment("NEW CHILD ID IS "+newChildID);
				cContactResult = aa.people.getCapContactByCapID(capId);
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				if (cContactResult.getSuccess()) 
				{
					cContactsExist = true;
					}

					if (cContactsExist) 
					{
						for(yy in cContactAry) 

						HHC_SORT_CONTACTS();
						}

					if (cContactsExist) 
					{
						for(yy in cTempAry) 

						HHC_CheckContact();
						}

					if (cContactsExist) 
					{
						for(yy in nextNameArr) 
							
						nextNameArr.sort();
						}	
						for(ii=0;ii<cc;ii++) 

						{
							var csortContactNum = nextNameArr[ii][0];
							var csortContactNameToCheckFor = nextNameArr[ii][1];
							var csortContactTypeToCheckFor = nextNameArr[ii][2];
							var csortContactSeqNum = nextNameArr[ii][3];
							var cContactDelete = true;
							cCapContactModel = cContactAry[ii].getCapContactModel();
							if (parseInt(ccnt) == parseInt(csortContactNum)) 
							{
								cContactDelete = false;
								}

							if (!matches(csortContactTypeToCheckFor, 'Property Owner', 'Owner/Operator', 'Facility Owner','Business Owner','Tenant')) 
							{
								cContactDelete = true;
								}

							if (cContactDelete) {
								cPeopleModel = cCapContactModel.getPeople();
								}

							if (cContactDelete) 
							{
								cContactSeqNumber = parseInt(csortContactSeqNum);
								}

							if (cContactDelete) 
							{
								aa.people.removeCapContact(capId, cContactSeqNumber);
								}

							showMessage = true;
							comment(ccnt +' - '+nextNameArr[ii][0]+' ii= '+ii+' - '+nextNameArr[ii][1]+' - '+nextNameArr[ii][2]+' - '+nextNameArr[ii][3]+' ---- '+cContactDelete+' - '+cContactSeqNumber+' - '+csortContactSeqNum);

							}

			capId = saveID;
			comment("the saved capId is "+saveID);

						}

				}
			}
		catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CREATE_CRT_CASES:  " + err.message);
			logDebug(err.stack);
			}
	}
