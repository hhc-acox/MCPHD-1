function isSupervisor(userID) {
	dept = getDepartmentName(userID);
	if (dept & dept != "") {
		if (matches(dept, "WQ Supervisor A EHS", "WQ Supervisor A", "WQ Team A EHS", "WQ Team A Leader", "WQ Supervisor B EHS", "WQ Supervisor B", "WQ Supervisor C EHS", "WQ Supervisor C")) {
			return true;
		}
	}

	return false;
}