//lwacht: 181031 #210: Wellfield Inspections
try{
	if(!checkInspectionResult("Recheck","Scheduled") && !matches(AInfo["Inspection Cycle"], "","undefined",null) ) {
		var inspCycle = ""+ AInfo["Inspection Cycle"];
		switch(inspCycle){
			case "1 Year":
				var sDate = dateAdd(null,364);
				var schDate = nextWorkDay(sDate);
				break;
			case "2 Year":
				var sDate = dateAddMonths(null,24);
				var schDate = nextWorkDay(sDate);
				break;
			case "3 Months":
				var sDate = dateAddMonths(null,3);
				var schDate = nextWorkDay(sDate);
				break;
			case "3 Year":
				var sDate = dateAddMonths(null,36);
				var schDate = nextWorkDay(sDate);
				break;
			case "5 Year":
				var sDate = dateAddMonths(null,60);
				var schDate = nextWorkDay(sDate);
				break;
			case "6 Months":
				var sDate = dateAddMonths(null,6);
				var schDate = nextWorkDay(sDate);
				break;
		}
		var inspUserId = getInspector("Initial Inspection");
		if(inspUserId){
			scheduleInspectDate("Recheck",schDate,inspUserId);
		}else{
			scheduleInspectDate("Recheck",schDate);
		}
	}else{
		if(matches(AInfo["Inspection Cycle"], "","undefined",null)){
			showMessage=true;
			comment("Inspection Cycle custom field is blank--no recheck was scheduled.");
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: IRSA:EnvHealth/WQ/Wellfield/*: " + err.message);
	logDebug(err.stack)
}
//lwacht: 181031: #210: end