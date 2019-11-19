
function getAssignedUser(itemCap) {
	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (cdScriptObjResult.getSuccess()) {
		cdScriptModel = cdScriptObjResult.getOutput();
		cd = cdScriptModel.getCapDetailModel();
		asgnStaff = cd.getAsgnStaff();
		if (asgnStaff && asgnStaff != "") return asgnStaff;
	}
	return null;
}