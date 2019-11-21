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
					for (i=0; i<concnt; i++) {
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
					newChildID = createChild('EnvHealth','CRT','NA','NA','');
					copyAppSpecific(newChildID);
					comment('New child app id = '+ newChildID);
					masterArray = new Array();
					elementArray = new Array();
					code10or19 = AInfo['Ordinance Chapter'];
					updateAppStatus('Legal Review','Initial Status',newChildID);
					assignCap('CSANDERS',newChildID);
					editAppSpecific('Parent Case',capIDString,newChildID);
					ccnt++;
					comment('ccnt = '+ccnt); //This is wrong only shows 1 case
					capId = newChildID;
					comment("NEW CHILD ID IS "+newChildID); //makes it here 1 time
					cContactResult = aa.people.getCapContactByCapID(capId);
					cContactAry = cContactResult.getOutput();
					cc = cContactAry.length;
					
					if (appMatch('*/*/LHH/*')) 
					{
						editAppSpecific('Case Type','Lead',newChildID);
						editAppSpecific('Parent Case',saveID,newChildID);
						editAppSpecific('EHS Court Day','THURS',newChildID);
						editAppSpecific('EHS Court Time','1:00 PM',newChildID);
					}

					HHC_GET_OFFENSE_CODES(newChildID);	
					HHC_GET_ADDRESS_FOR_CHILD();	

				if (cContactResult.getSuccess()) 
				{
					cContactsExist = true;
					}

					if (cContactsExist) 
					{
						for(yy in cContactAry) 

						HHC_SORT_CONTACTS(); //makes it here 1 time
						}

					if (cContactsExist) 
					{
						for(yy in cTempAry) 

						HHC_CheckContact(); //makes it here 1 time
						}

					if (cContactsExist) 
					{
						for(yy in nextNameArr) 
							
						nextNameArr.sort();
						comment('Deletes begin here');
						}	
						for(ii=0;ii<cc;ii++) 

						{
							var csortContactNum = nextNameArr[ii][0];
							var csortContactNameToCheckFor = nextNameArr[ii][1];
							var csortContactSeqNum = nextNameArr[ii][3];
							
							var cContactDelete = true;
							cCapContactModel = cContactAry[ii].getCapContactModel();
							if (parseInt(ccnt) == parseInt(csortContactNum)) 
							{
								cContactDelete = false;
								}
								
							comment('Contact type checking for deletes begin here');
							if ((!matches(cContactTypeToCheckFor, 'Property Owner','Tenant','Responsible Party')))	
						    //Each person on their CRT is always Primary
							{
								cContactDelete = true;
								}

							if (cContactDelete) {
								cPeopleModel = cCapContactModel.getPeople();
								}
							comment('Parse Int begins here');
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
