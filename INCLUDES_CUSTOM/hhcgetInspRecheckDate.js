function hhcgetInspRecheckDate(capId,inspId) {
   try {
	   var l = aa.inspection.getInspection(capId,inspId).getOutput();
	   inspObj = l.getInspection().getActivity();
	   var theDate = inspObj.getDesiredDate();
	   return theDate;
   }
      catch (e) {
       aa.print("Exception getting data from hhcgetInspRecheckDate2: " + e.message);
   }
}
