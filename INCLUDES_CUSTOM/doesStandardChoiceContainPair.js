function doesStandardChoiceContainPair(stdChoiceName, key, value) {
	var stdChoiceArr = getStandardChoiceValues(stdChoiceName);
	
	for(index in stdChoiceArr) {
		if(stdChoiceArr[index].key == key && stdChoiceArr[index].value == value) {
			return true;
		}
	}
	return false;
}
