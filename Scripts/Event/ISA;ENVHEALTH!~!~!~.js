showDebug = true;
showMessage = true;

if (inspId) {
    var capContactResult = aa.people.getCapContactByCapID(capId);
    var phoneNumber = "";
    var contactname = "";
    var seqNubr = "";
    var cm = null;
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {

            if (Contacts[yy].getCapContactModel().getPrimaryFlag() == "Y") {
                if (Contacts[yy].getCapContactModel().getPhone3() != null) {
                    phoneNumber = String(Contacts[yy].getCapContactModel().getPhone3()); //business
                }
                else if (Contacts[yy].getCapContactModel().getPhone2() != null) {
                    phoneNumber = String(Contacts[yy].getCapContactModel().getPhone2()); //cell
                }
                else if (Contacts[yy].getCapContactModel().getPhone1() != null) {
                    phoneNumber = String(Contacts[yy].getCapContactModel().getPhone1()); //home
                }

                if (Contacts[yy].getCapContactModel().getFullName() != null) {
                    contactname = String(Contacts[yy].getCapContactModel().getFullName()); //Get name
                }
                else if (Contacts[yy].getCapContactModel().getBusinessName() != null) {
                    contactname = String(Contacts[yy].getCapContactModel().getBusinessName()); //Get Business
                }

                //seqNbr = String(Contacts[yy].getCapContactModel().getContactSeqNumber());
                cm = Contacts[yy].getCapContactModel();
            }
        }
    }
    if(contactname != "" && phoneNumber != ""){
        var pi = aa.inspection.getInspection(capId, inspId).getOutput();
        var newComment = "Inspection Contact: " + contactname + "\r\nInspection Contact Number: " + phoneNumber + "\r\n" + (String(pi.getInspectionComments()) == "null" ? "" : String(pi.getInspectionComments()));
        logDebug("new request comment: " + newComment);
        pi.setInspectionComments(newComment);
        var isOk = aa.inspection.editInspection(pi);
        logDebug("Updated = " + isOk.getSuccess());
    }
    else{
        logDebug("Missing primary contact");
    }
  
}
