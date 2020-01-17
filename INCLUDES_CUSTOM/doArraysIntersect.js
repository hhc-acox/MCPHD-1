function doArraysIntersect(first, second) {
	for (i in first) {
		for (j in second) {
			if (first[i] == second[j]) {
				return true;
			}
		}
	}
	return false;
}
