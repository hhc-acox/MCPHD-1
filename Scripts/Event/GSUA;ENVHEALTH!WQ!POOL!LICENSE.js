if (GuidesheetModel && "POOL TEST RESULTS"== GuidesheetModel.getGuideType().toUpperCase()) {
		capAssignee = capDetail.getAsgnStaff();
		var pResult = aa.person.getUser(userName);
		if (pResult.getSuccess()) {
			var p = pResult.getOutput();
			if (p != null)  {
				toAddr = p.getEmail();
				if (toAddr && toAddr.length > 0) {
					eBody = "Pool Test Results checklist updated on " + capIDString;
					aa.sendMail("no_reply_@accela.com", toAddr, "", "Checklist updated", eBody);
				}
			}
		}
	}