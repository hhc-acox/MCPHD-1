	if (publicUser && !appMatch("EnvHealth/CRT/*/*") && !appMatch("EnvHealth/Housing/*/*")) {
		copyOwnerToContact("Owner", "Responsible Party", capId);
	}