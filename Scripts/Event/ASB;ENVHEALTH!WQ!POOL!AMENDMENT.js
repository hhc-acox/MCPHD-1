try {	
	var arrContacts = getPeople(capId);
	for(cn in arrContacts){
		sourcePeopleModel = arrContacts[cn];
		var getUserResult = aa.publicUser.getPublicUserByEmail(sourcePeopleModel.getEmail());
		comment("sourcePeopleModel.getEmail(): " + sourcePeopleModel.getEmail());
		comment("sourcePeopleModel.getPeople().getContactTypeFlag(): " + sourcePeopleModel.getPeople().getContactTypeFlag());
		if (!getUserResult.getSuccess()) {
			cancel = true;
			showMessage = true;
			comment("This contact does not have an associated ACA user--please contact this user to set up their ACA account: " + sourcePeopleModel.getEmail()+".");
		}
		if(sourcePeopleModel.getPeople().getContactTypeFlag()=="organization"){
			cancel = true;
			showMessage = true;
			comment("This contact must be set as an individual (not organization)--please update before continuing: " + sourcePeopleModel.getEmail()+".");
		}
	}
} catch (err) {
	handleError(err, "Page Flow Script");
}

function getPeople(capId)
{
  capPeopleArr = null;
  var s_result = aa.people.getCapContactByCapID(capId);
  if(s_result.getSuccess())
  {
    capPeopleArr = s_result.getOutput();
    if (capPeopleArr == null || capPeopleArr.length == 0)
    {
      aa.print("WARNING: no People on this CAP:" + capId);
      capPeopleArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());
    capPeopleArr = null;  
  }
  return capPeopleArr;
}
