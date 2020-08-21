function validateContactsForCourt() {
    var contacts = getContactObjs(capId);

	for (var x in contacts) {
        thisContact = contacts[x];
        thisPerson = thisContact.people;

        if (matches(thisPerson.getContactType(), 'Property Owner','Tenant','Responsible Party') || (appTypeString.indexOf('WQ') > -1 && thisPerson.getRelation() == 'Responsible Party')) {
            var firstName = thisPerson.getFirstName();
            var lastName = thisPerson.getLastName();
            var businessName = thisPerson.getBusinessName();
            var fullName = thisPerson.getFullName();
    
            var validIndividual = false;
            var validBusiness = false;
    
            if(firstName && firstName != '' && lastName && lastName != '' && fullName && fullName != '') {
                validIndividual = true;
            }
            
            if (businessName && businessName != '' && fullName && fullName != '') {
                validBusiness = true;
            }
    
            if (!validBusiness && !validIndividual) {
                return false;
            }
        }
    }
    
    return true;
}
