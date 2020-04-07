	if (publicUser && !appMatch("EnvHealth/CRT/*/*") && !appMatch("EnvHealth/Housing/*/*")) {
		copyOwnerToContact("Property Owner", "Responsible Party", capId);
	}
