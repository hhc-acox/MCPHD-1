function addSupervisorReview(itemCap, taskType,  inspID, taskName, statusName) {
	assignTo = currentUserID;
	assignTo = getAssignedUser(itemCap);

	if (taskType.toUpperCase() == "WORKFLOW") {
		recordTypeToMatch = lookup("SUPERVISOR_REVIEW_WORKFLOW", "" + taskName + "|" + statusName);
		if (recordTypeToMatch && recordTypeToMatch != "") {
			if (appMatch(recordTypeToMatch, itemCap)) {
				if (!isSupervisor(currentUserID)) {
					addAdHocTask("ADHOC_WORKFLOW", "Supervisor Review Workflow", taskName + "-" + statusName, assignTo);
					logDebug("Added Supervisor Review Workflow task");
					activateTask(taskName);
					updateTask(taskName, "In Progress", "Supervisor Review in progress", "Set by script");
				}
			}
			else {
				logDebug("Record type does not match entry in standard choice SUPERVISOR_REVIEW_WORKFLOW");
			}
		}
		else {
			logDebug("workflow task name and status not found in std choice SUPERVISOR_REVIEW_WORKFLOW");
		}

	}
	else {
		if (taskType.toUpperCase() == "INSPECTION") {	
			if (inspID) {
				iNumber = inspID;
				iObjResult = aa.inspection.getInspection(capId,iNumber);
				if (iObjResult.getSuccess()) { 
					iObj = iObjResult.getOutput();
					inspType = iObj.getInspectionType();				
					recordTypeToMatch = lookup("SUPERVISOR_REVIEW_INSPECTION", inspType);
					if (appMatch(recordTypeToMatch, itemCap)) {
						if (!isSupervisor(currentUserID)) {
							inspDate = "" + iObj.getScheduledDate().getMonth() + iObj.getScheduledDate().getDayOfMonth() +  iObj.getInspectionDate().getYear();
							addAdHocTask("ADHOC_WORKFLOW", "Supervisor Review Inspection", inspDate + "-" + inspType +  "-" + iObj.getInspectionStatus() + "-" + iNumber, assignTo);
							logDebug("Added Supervisor Review Inspection Task");
						}
					}
					else {
						logDebug("Record type does not match entry in standard choice SUPERVISOR_REVIEW_INSPECTION");
					}
				}
				else {
					logDebug("**ERROR retrieving inspection " + iNumber + " : " + iObjResult.getErrorMessage());
				}	
			}
			else {
				logDebug("Incorrect parameters");
			}
		}
		else {
			logDebug("Unknown adhoc task type");
		}
	}

}
function addToGASIT(gsi, pTableName, pArrayToAdd) {
    var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
 //   logDebug("**GUIDESHEET ITEM: " + gsi.getGuideItemText());
    var gsAsitGrpList = gsi.getItemASITableSubgroupList();
    if (gsAsitGrpList != null) {
        for (var j = 0; j < gsAsitGrpList.size(); j++) {
            var guideItemASIT = gsAsitGrpList.get(j);
            // dumpObj(guideItemASIT);
            var cASIGroup = guideItemASIT.getGroupName();
            var tableArr = new Array();
            if (guideItemASIT.getTableName() == pTableName) {
                var newColumnList = guideItemASIT.getColumnList();
                for (var k = 0; k < newColumnList.size(); k++) {
                    if (!updateComplete) // right column but row not found create a new row.
                    {
                        var column = newColumnList.get(k);
                        for (l = 0; l < pArrayToAdd.length; l++) {
                            var cValueMap = column.getValueMap();
                            var newColumn = new com.accela.aa.inspection.guidesheet.asi.GGSItemASITableValueModel;
                            var pReadOnly = "F";
                            //logDebug(pArrayToAdd[l][column.getColumnName()]);
                            newColumn.setColumnIndex(j);
                            newColumn.setRowIndex(l);
                            newColumn.setAttributeValue((pArrayToAdd[l][column.getColumnName()] == null || pArrayToAdd[l][column.getColumnName()] == 'undefined' ? "" : pArrayToAdd[l][column.getColumnName()]));
                            newColumn.setAuditDate(new java.util.Date());
                            newColumn.setAuditID("ADMIN");
                            cValueMap.put(l, newColumn);
                        }
                    }
                }
                var updateComplete = true;
            }
        }
    }
    if (updateComplete) {
        gsb.updateGuideSheetItem(gsi, "ADMIN");
    }
}
function addTrashTicketFee() {
	try{
	var tFee='H_T';
		tFee+=AInfo['Ticket Fee'];
			if (!feeExists(tFee,'INVOICED')) {
				updateFee(tFee,'H_TRA','FINAL',1,'Y');	
	}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getTSIfieldValue:  " + err.message);
		logDebug(err.stack);
	}

}

function arrayContains(arr, key){
    for(var index in arr){
       if(arr[index] == key) {
         return true;
       }
    }
    return false;
}

function convertForAssignedTo(areaInspector){
	try{
	var newAreaInspector = '';
	var str = '';
	var res = '';	
	str = areaInspector;
	var xx = str.indexOf("@");
	if (str.indexOf("@")>-1){
		res = str.substring(0, xx);
	}
	else{
		res = str;
		}
		return res;
	}
		
		catch(err)
	{
		logDebug("A JavaScript Error occurred: convertForAssignedTo:  " + err.message);
		logDebug(err.stack);
	}
}

function copyLeadViolations(inspId) {

	var conn = new db();
	var sql = "SELECT G6_ACT_NUM FROM G6ACTION WHERE SERV_PROV_CODE='{0}' AND B1_PER_ID1='{1}' AND B1_PER_ID2='{2}' AND B1_PER_ID3='{3}' AND G6_ACT_TYP in ('Initial Lead Inspection', 'Yearly Lead Inspection') and g6_status = 'In Violation' ORDER BY G6_COMPL_DD DESC";
	sql = sql.replace("{0}", String(aa.getServiceProviderCode()))
		.replace("{1}", String(capId.getID1()))
		.replace("{2}", String(capId.getID2()))
		.replace("{3}", String(capId.getID3()));
	var ds = conn.dbDataSet(sql, 1);

	var lastInsp = null;
	if (ds.length) {
		lastInsp = parseInt(ds[0]["G6_ACT_NUM"], 10);
		logDebug("Found " + lastInsp);
	}
	if (lastInsp == null) {
		logDebug("No prior inspection"); return;
	}
	// find LHH_Violations checklist on last inspection.
	var gsb = aa.proxyInvoker.newInstance("com.accela.aa.inspection.guidesheet.GGuideSheetBusiness").getOutput();
	var qf = new com.accela.aa.util.QueryFormat();
	var gs = gsb.getGGuideSheetWithItemsByInspectID(capId, lastInsp,qf);
	if (gs == null) {
		logDebug("No Guidesheets to copy");
		return;
	}
	var gsa = gs.result.toArray();
	if (gsa.length < 1) {
		logDebug("No Guideitems to copy");
		return;
	}
	dg = null;
	for (var gsIndex in gsa) {
		gs = gsa[gsIndex];
		gsType = gs.getGuideType();
		if (gsType == "LHH_Violations") {
			dg = gs;
			break;
		}
	}
	if (dg != null) {
		var guidesheetItemArr = dg.getItems().toArray();
		var item = null;
		for (var itemIndex in guidesheetItemArr) {
			item = guidesheetItemArr[itemIndex];
			if (item.getGuideItemText() == "Violations") 
				break;
		}
		if (item != null) {
			logDebug("Found guideitem to copy from");
			var gio = new guideSheetObject(dg, item);
			gio.loadInfoTables();
			if (gio.validTables) {
				table = gio.infoTables["VIOLATIONS"];
				aa.print(table.length); 
				
				// get guideitem on the current inspection
				gs = gsb.getGGuideSheetWithItemsByInspectID(capId, parseInt(inspId), qf);
				if (gs == null) {
					logDebug("No Guidesheets to copy to");
					return;
				}
				var gsa = gs.result.toArray();
				if (gsa.length < 1) {
					logDebug("No Guideitems to copy to");
					return;
				}
				dg = null;
				for (var gsIndex in gsa) {
					gs = gsa[gsIndex];
					gsType = gs.getGuideType();
					if (gsType == "LHH_Violations") {
						dg = gs;
						break;
					}
				}
				if (dg != null) {
					var guidesheetItemArr = dg.getItems().toArray();
					var newItem = null;
					for (var itemIndex in guidesheetItemArr) {
						newItem = guidesheetItemArr[itemIndex];
						if (newItem.getGuideItemText() == "Violations") 
							break;
					}
					if (newItem != null) {
						logDebug("Adding table to new item");
						addToGASIT(newItem, "VIOLATIONS", table);
					}
				}
			}
		}
	}
}
	



function db() {
    this.version = function () {
        return 1.0;
    }

    /**
     * Executes a sql statement and returns rows as dataset
     * @param {string} sql 
     * @param {integer} maxRows 
     * @return {string[]}
     */
    this.dbDataSet = function (sql, maxRows) {
        var dataSet = new Array();
        if (maxRows == null) {
            maxRows = 100;
        }
        try {
            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup("java:/AA");
            var conn = ds.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(maxRows);
            var rSet = sStmt.executeQuery();
            while (rSet.next()) {
                var row = new Object();
                var maxCols = sStmt.getMetaData().getColumnCount();
                for (var i = 1; i <= maxCols; i++) {
                    row[sStmt.getMetaData().getColumnName(i)] = rSet.getString(i);
                }
                dataSet.push(row);
            }
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("dbDataSet: " + err);
        }
        return dataSet;
    }

    /**
     * Executes a sql statement and returns nothing
     * @param {string} sql 
     */
    this.dbExecute = function (sql) {
        try {
            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup("java:/AA");
            var conn = ds.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(1);
            var rSet = sStmt.executeQuery();
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("deExecute: " + err);
        }
    }

    /**
     * Returns first row first column of execute statement
     * @param {string} sql
     * @returns {object}  
     */
    this.dbScalarExecute = function (sql) {
        var out = null;
        try {
            var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
            var ds = initialContext.lookup("java:/AA");
            var conn = ds.getConnection();
            var sStmt = conn.prepareStatement(sql);
            sStmt.setMaxRows(1);
            var rSet = sStmt.executeQuery();

            if (rSet.next()) {
                out = rSet.getString(1);
            }
            rSet.close();
            conn.close();
        }
        catch (err) {
            throw ("dbScalarValue: " + err);
        }
        return out;
    }
    return this;
}

function copyParcelGisObjects4XAPO() {
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
	if (capParcelResult.getSuccess()) {
		var Parcels = capParcelResult.getOutput().toArray();
		for (zz in Parcels) {

			var uid = Parcels[zz].getUID();
			if(uid == null){
				logDebug("Warning: no XAPO Id found");
			}
			var ParcelValidatedNumber = uid.substr(uid.indexOf("$*$")+3);
			logDebug("XAPOID = " + ParcelValidatedNumber);
			var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
			if (gisObjResult.getSuccess())
				var fGisObj = gisObjResult.getOutput();
			else { logDebug("**WARNING: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()); return false }

			for (a1 in fGisObj) // for each GIS object on the Cap
			{
				var gisTypeScriptModel = fGisObj[a1];
				var gisObjArray = gisTypeScriptModel.getGISObjects()
				for (b1 in gisObjArray) {
					var gisObjScriptModel = gisObjArray[b1];
					var gisObjModel = gisObjScriptModel.getGisObjectModel();

					var retval = aa.gis.addCapGISObject(capId, gisObjModel.getServiceID(), gisObjModel.getLayerId(), gisObjModel.getGisId());

					if (retval.getSuccess()) { logDebug("Successfully added Cap GIS object: " + gisObjModel.getGisId()) }
					else { logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()); return false }
				}
			}
		}
	}
	else { logDebug("**ERROR: Getting Parcels from Cap.  Reason is: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()); return false }
}

function CreateLarvicideSite_IfBreeding(capId){
	try{
		gName = "VC_LARVICIDE";
		gItem = "SITE INFORMATION";
		asiGroup = "VC_LVCCKLST";
		asiSubGroup = "LARVICIDE";
		asiLabel = "Is Site Breeding";
		var myResult = getGuidesheetASIValue(inspId,gName,gItem,asiGroup,asiSubGroup, asiLabel);
			if(myResult=="Yes"){
			//Create the Larvicide Site Case
			newChildID = createChild('EnvHealth','VC','LarvicideSite','NA','');
			// Add Case and Data Fields Info
			copyAppSpecific(newChildID);
						}
}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: CreateLarvicideSite_IfBreeding:  " + err.message);
		logDebug(err.stack);
	}
}
function doesTaskHaveActiveSupervisorReview(taskName, inspID) {
	var retValue = false;
	if (taskName && !inspID) {
		var tasks = aa.workflow.getTasks(capId).getOutput();
		for(var x in tasks){
			thisTask = tasks[x];
			thisTaskDesc = "" + thisTask.getTaskDescription();
			if(thisTaskDesc == "Supervisor Review Workflow") {
				if (thisTask.getActiveFlag() == "Y" && thisTask.getCompleteFlag() == "N") {
					taskNote = thisTask.getDispositionNote();
					if (taskNote && taskNote != "") {
						pieces = taskNote.split("-");
						if (pieces && pieces.length == 2) {
							tName = pieces[0];
							if (tName == taskName) retValue = true;
						}
					}
				}
			}
			if(thisTaskDesc == "Supervisor Review Inspection") {
				if (thisTask.getActiveFlag() == "Y" && thisTask.getCompleteFlag() == "N") {
					taskNote = thisTask.getDispositionNote();
					if (taskNote && taskNote != "") {
						pieces = taskNote.split("-");
						if (pieces && pieces.length == 4) {
							iID = pieces[3];
							if (iID == inspID) retValue = false;  // does not prevent inspection actions for now
						}
					}
				}
			}
		}
	}
	return retValue
}
function emailNotifContact(notName, emailRpt, rptName, contactType, respectPriChannel, sysFromEmail) {
try{
	// create a hashmap for report parameters
	var rptParams = aa.util.newHashMap();
	for (var i = 6; i < arguments.length; i = i + 2) {
		rptParams.put(arguments[i], arguments[i + 1]);
	}
	if(emailRpt && matches(rptName,"",null,"undefined")){
		logDebug("A report name is needed when emailRpt param is 'true'.");
		return false;
	}
	var emailNotif = false;
	//lwacht: defect4810 end
	//var emailDRPReport = false;
	var priContact = getContactObj(capId,contactType);
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(!respectPriChannel || priChannel.indexOf("Email") > -1 || priChannel.indexOf("E-mail") > -1){
				emailNotif = true;
			}else{
				if(respectPriChannel && priChannel.indexOf("Postal") > -1){
					var addrString = "";
					var contAddr = priContact.addresses;
					for(ad in contAddr){
						var thisAddr = contAddr[ad];
						for (a in thisAddr){
							if(!matches(thisAddr[a], "undefined", "", null)){
								if(!matches(thisAddr[a].addressType, "undefined", "", null)){
									addrString += thisAddr[a].addressLine1 + br + thisAddr[a].city + ", " + thisAddr[a].state +  " " + thisAddr[a].zip + br;
								}
							}
						}
					}
					if(addrString==""){
						addrString = "No addresses found.";
					}
					if(!matches(rptName, null, "", "undefined")){
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the report " + rptName + " to : " + br + addrString + "</font>");
					}else{
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the notification " + notName + " to : " + br + addrString + "</font>");
					}
				}
			}
		}else{
			logDebug("No primary channel found.  Defaulting to emailing the notification.");
			emailNotif = true;
		}
		if(emailNotif){
			var eParams = aa.util.newHashtable(); 
			addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
			var contPhone = priContact.capContact.phone1;
			if(contPhone){
				var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
			}else{
				var fmtPhone = "";
			}
			addParameter(eParams, "$$altID$$", capId.getCustomID());
			addParameter(eParams, "$$contactPhone1$$", fmtPhone);
			addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
			addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
			addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
			addParameter(eParams, "$$status$$", capStatus);
			//lwacht: 171214: end
			//logDebug("eParams: " + eParams);
			//var drpEmail = ""+priContact.capContact.getEmail();
			var priEmail = ""+priContact.capContact.getEmail();
			//var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
			var rFiles = [];
			if(!matches(rptName, null, "", "undefined")){
				var rFile;
				rFile = generateReport(capId,rptName,"Licenses",rptParams);
				if (rFile) {
					rFiles.push(rFile);
				}
			}
			if(emailRpt){
				sendNotification(sysFromEmail,priEmail,"",notName,eParams, rFiles,capId);
			}else{
				rFiles = [];
				sendNotification(sysFromEmail,priEmail,"",notName,eParams, rFiles,capId);
			}
		}
	}else{
		logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
	}
}catch(err){
	logDebug("An error occurred in emailNotifContact: " + err.message);
	logDebug(err.stack);
}}
//Adulticide Zone Translation (6 zones) 
function getAdulticideZone(capId){
	var aZone = "";
	
	try{
		z1 = getGISInfo("MCPHD","fogging1","foggingname");
		z2 = getGISInfo("MCPHD","fogging2","foggingname");
		z3 = getGISInfo("MCPHD","fogging3","foggingname");
		z4 = getGISInfo("MCPHD","fogging4","foggingname");
		z5 = getGISInfo("MCPHD","fogging5","foggingname");
		z6 = getGISInfo("MCPHD","fogging6","foggingname");
				if (z1 == 1){
		aZone = "Adulticide Zone 01";	
		}
				if (z2 == 2){
		aZone = "Adulticide Zone 02";	
		}
				if (z3 == 3){
		aZone = "Adulticide Zone 03";	
		}
				if (z4 == 4){
		aZone = "Adulticide Zone 04";	
		}
				if (z5 == 5){
		aZone = "Adulticide Zone 05";	
		}
				if (z6 == 6){
		aZone = "Adulticide Zone 06";	
		}
			return aZone;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAdulticideZone:  " + err.message);
		logDebug(err.stack);
	}
}
//Adulticide Zone Number (6 zones) 
function getAdulticideZoneNum(capId){
	var aZone = "";
	
	try{
		z1 = getGISInfo("MCPHD","fogging1","foggingname");
		z2 = getGISInfo("MCPHD","fogging2","foggingname");
		z3 = getGISInfo("MCPHD","fogging3","foggingname");
		z4 = getGISInfo("MCPHD","fogging4","foggingname");
		z5 = getGISInfo("MCPHD","fogging5","foggingname");
		z6 = getGISInfo("MCPHD","fogging6","foggingname");
				if (z1 == 1){
					aZone = z1;	
		}
				if (z2 == 2){
					aZone = z2;
		}
				if (z3 == 3){
					aZone = z3;
		}
				if (z4 == 4){
					aZone = z4;
		}
				if (z5 == 5){
					aZone = z5;
		}
				if (z6 == 6){
					aZone = z6;
		}
			return aZone;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAdulticideZone:  " + err.message);
		logDebug(err.stack);
	}
}
	function getAssignedToRecord() {
	try {
	cap = aa.cap.getCapDetail(capId).getOutput();
	var capAssignPerson = cap.getAsgnStaff();
	return capAssignPerson;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getAssignedToRecord:  " + err.message);
		logDebug(err.stack);
	}
}

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
function getGuidesheetASITable(inspId,gName,asitName) {
try{
	//updates the guidesheet ID to nGuideSheetID if not currently populated
	//optional capId
	var itemCap = capId;
	if (arguments > 6) itemCap = arguments[7];
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			if (inspArray[i].getIdNumber() == inspId) {
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					for(var i=0;i< gs.size();i++) {
						var guideSheetObj = gs.get(i);
						if (guideSheetObj && gName.toUpperCase() == guideSheetObj.getGuideType().toUpperCase()) {
							var guidesheetItem = guideSheetObj.getItems();
							for(var j=0;j< guidesheetItem.size();j++) {
								var item = guidesheetItem.get(j);
								var guideItemASITs = item.getItemASITableSubgroupList();
								if (guideItemASITs!=null){
									for(var j = 0; j < guideItemASITs.size(); j++){
										var guideItemASIT = guideItemASITs.get(j);
										if(guideItemASIT && asitName == guideItemASIT.getTableName()){
											var tableArr = new Array();
											var columnList = guideItemASIT.getColumnList();
											for (var k = 0; k < columnList.size() ; k++ ){
												var column = columnList.get(k);
												var values = column.getValueMap().values();
												var iteValues = values.iterator();
												while(iteValues.hasNext())
												{
													var i = iteValues.next();
													var zeroBasedRowIndex = i.getRowIndex()-1;
													if (tableArr[zeroBasedRowIndex] == null) tableArr[zeroBasedRowIndex] = new Array();
													tableArr[zeroBasedRowIndex][column.getColumnName()] = i.getAttributeValue();
												}
											}
										}
									}
								}
								return tableArr;
							}							
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No checklist item found.");
	return false;
}catch(err){
	logDebug("A JavaScript Error occurred: getGuidesheetASITable: " + err.message);
	logDebug(err.stack);
}}
function getGuidesheetASIValue(inspId,gName,gItem,asiGroup,asiSubGroup, asiLabel) {
try{
	//updates the guidesheet ID to nGuideSheetID if not currently populated
	//optional capId
	var itemCap = capId;
	if (arguments > 6) itemCap = arguments[7];
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			if (inspArray[i].getIdNumber() == inspId) {
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					for(var i=0;i< gs.size();i++) {
						var guideSheetObj = gs.get(i);
						if (guideSheetObj && gName.toUpperCase() == guideSheetObj.getGuideType().toUpperCase()) {
							var guidesheetItem = guideSheetObj.getItems();
							for(var j=0;j< guidesheetItem.size();j++) {
								var item = guidesheetItem.get(j);
								//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
								if(item && gItem == item.getGuideItemText() && asiGroup == item.getGuideItemASIGroupName()) {
									var ASISubGroups = item.getItemASISubgroupList();
									if(ASISubGroups) {
										//2. Filter ASI sub group by ASI Sub Group name
										for(var k=0;k< ASISubGroups.size();k++) {
											var ASISubGroup = ASISubGroups.get(k);
											if(ASISubGroup && ASISubGroup.getSubgroupCode() == asiSubGroup) {
												var ASIModels =  ASISubGroup.getAsiList();
												if(ASIModels) {
													//3. Filter ASI by ASI name
													for( var m = 0; m< ASIModels.size();m++) {
														var ASIModel = ASIModels.get(m);
														if(ASIModel && ASIModel.getAsiName() == asiLabel) {
															//logDebug("Change ASI value from:"+ ASIModel.getAttributeValue() +" to "+newValue);
															//4. Reset ASI value
															//ASIModel.setAttributeValue(newValue);		
															return ASIModel.getAttributeValue();
														}
													}
												}
											}
										}
									}
								}
							}							
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No checklist item found.");
	return false;
}catch(err){
	logDebug("A JavaScript Error occurred: getGuidesheetASIValue: " + err.message);
	logDebug(err.stack);
}}


function getInspectionWithGuideSheets(pcap, pnbr) {
    var insps = aa.inspection.getInspections(pcap).getOutput();
    var d = null;
    for (var i in insps) {
        if (pnbr == insps[i].getIdNumber())
            return insps[i];
    }
    return null;
}

function getLatestScheduledDate()
{	
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
	{
		inspList = inspResultObj.getOutput();
        var array=new Array();  
        var j=0;		
		for (i in inspList)
        {		    			 				
			if (inspList[i].getInspectionStatus().equals("Scheduled"))
			{	                   					
				array[j++]=aa.util.parseDate(inspList[i].getInspection().getScheduledDate());				
			}
		}
		
		var latestScheduledDate=array[0];
		for (k=0;k<array.length;k++)
        {		          	
			temp=array[k];
			if(temp.after(latestScheduledDate))
			{
				latestScheduledDate=temp;
			} 
		}
		return latestScheduledDate;
	}
	return false;
}
function getTSIfieldValue(TSIfieldName, workflowTask) {
	try{
		workflowResult = aa.workflow.getTasks(capId); 
        wfObj = workflowResult.getOutput();
        var useTaskSpecificGroupName = true;
		itemCap = capId;
		var itemName = TSIfieldName;
        var stepnumber = 0;
        var taskName = "";
        var taskStatus = "";
        var procCode = "";
		var processID = ""; 
	for (i in wfObj){ 
		stepnumber = wfObj[i].getStepNumber();
		taskName = wfObj[i].getTaskDescription();
		taskStatus = wfObj[i].getDisposition();
		procCode = wfObj[i].getProcessCode();
		processID = wfObj[i].getProcessID();
if (workflowTask == taskName) {		
			TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap,processID,stepnumber,itemName);
 			if (TSIResult.getSuccess())
 				{
	 			var TSI = TSIResult.getOutput();
				if (TSI != null)
					{
					var TSIArray = new Array();
					TSInfoModel = TSI.getTaskSpecificInfoModel();
					var myValue = TSInfoModel.getChecklistComment();
					logDebug(" Item= " + itemName + " myValue=" + myValue);
					var useTaskSpecificGroupName = false;
					return myValue;
					}	
				}
			}
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getTSIfieldValue:  " + err.message);
		logDebug(err.stack);
	}	
}
//Vector Zone Translation (15 zones)
function getVectorZone(capId){
	var vZone = "";
	var zoneNum = "";
	try{
		x = getGISInfo("MCPHD","VectorZones","vectorzone");
		zoneNum = x.toString();
		if (x<10){
		vZone = "Vector Zone 0"+zoneNum;
		}
		else
		{vZone = "Vector Zone "+zoneNum;}
			return vZone;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getVectorZone:  " + err.message);
		logDebug(err.stack);
	}
}
//Vector Zone Number (15 zones)
function getVectorZoneNum(capId){
	var vZone = "";
	var zoneNum = "";
	try{
		x = getGISInfo("MCPHD","VectorZones","vectorzone");
			return x;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getVectorZone:  " + err.message);
		logDebug(err.stack);
	}
}
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

function hhcgetUserByDiscipline(userDiscipline){
	try{
	var userObjArray = new Array();
	var sysUserList
	var sysUserResult = aa.people.getSysUserListByDiscipline(userDiscipline);
	
	if (sysUserResult.getSuccess()) {
			sysUserList = sysUserResult.getOutput().toArray();
		} else {
			logDebug("**ERROR: getUserObjsByDiscipline: " + sysUserResult.getErrorMessage());
			return userObjArray;
		}
		if(sysUserList.length > 0){
			for(var iUser in sysUserList){
				var userId = sysUserList[iUser].getUserID();
		}
	
			return userId;
		}
		} 
	catch(err)
	{
	logDebug("A JavaScript Error occurred: getUserByDiscipline:  " + err.message);
	logDebug(err.stack);
	}
}

function HHC_assignDeptCap(Department) // optional CapId
	{
		try{
	var itemCap = capId;
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

		cd = cdScriptObj.getCapDetailModel();

		var dpt = aa.people.getDepartmentList(null).getOutput();
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();

					if (p == Department){
							cd.setAsgnDept(Department);	
							cdWrite = aa.cap.editCapDetail(cd);
					}
				}
		}
		catch(err){
			logDebug("A JavaScript Error occurred: HHC_assignDeptCap: " + err.message);
			logDebug(err.stack)
		}
	}				

function HHC_ASSIGN_NEW_LEHS() {
	try{
		var ctLead = AInfo['ParcelAttribute.CensusTract'];
		var newUserIDfull = lookup('Census - Lead EHS',AInfo['ParcelAttribute.CensusTract']);
			newUserID = convertForAssignedTo(newUserIDfull);
			if (AInfo['Assigned To'] != null && AInfo['Assigned To'] != AInfo['Previous Assigned To']) {
				var newUserID = AInfo['Assigned To'];
				}

			if (checkInspectionResult('Initial Lead Inspection', 'Scheduled') == true) {
				inspNum=getScheduledInspId('Initial Lead Inspection');
				}

			if (checkInspectionResult('Reinspection', 'Scheduled') == true) {
				inspNum=getScheduledInspId('Reinspection');
				}
				editAppSpecific('Previous Assigned To', newUserID);
				editAppSpecific('Assigned To', newUserID);
				editAppSpecific('Census Tract', ctLead);
				assignCap(newUserIDfull);
				
			if (checkInspectionResult('Initial Lead Inspection', 'Scheduled')) {
				assignInspection(inspNum, newUserIDfull);
				}

			if (checkInspectionResult('Reinspection', 'Scheduled')) {
				assignInspection(inspNum, newUserIDfull);
				}

		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP_COURT:  " + err.message);
		logDebug(err.stack);
	}
}
function HHC_CheckContact() 
{
	try{
		showMessage=true;
		appName = cTempAry[yy][0];
		cContactTypeToCheckFor = cTempAry[yy][1];
		cContactSeqNum = cTempAry[yy][2];
		
			if (appName != prevName && (matches(cContactTypeToCheckFor, 'Property Owner','Tenant','Responsible Party'))) 
						
			{
				addCourtCase = true;
			}

			if (addCourtCase) {
				y++;
			}

		nextNameArr[yy] = [[y],[appName],[cContactTypeToCheckFor],[cContactSeqNum]];
		comment('Check Comment -  '+nextNameArr[yy][0]+' - '+nextNameArr[yy][1]+' - '+nextNameArr[yy][2]+' - '+nextNameArr[yy][3]);
		prevName=String(appName);
		addCourtCase = false;
		cContactTypeToCheckFor = '';
		
		}	
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CheckContact:  " + err.message);
			logDebug(err.stack);
		}
}

function HHC_CONTACTS_PROCESS() 
{
	try{
		cContactResult = AInfo[''];
		cContactsExist = false;
		cContactAry = new Array();
		y = 0;
		addCourtCase = false;
		prevName = 'Start';
		cTempAry = new Array();
		nextNameArr = new Array();
		myComplainer = '';
		cContactResult = aa.people.getCapContactByCapID(newChildID);
			if (cContactResult.getSuccess()) {
				cContactsExist = true;
				}

			if (cContactsExist) {
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				}

			if (cContactsExist) {
				showMesage = true;
				comment('The number of contacts is '+cc);
				}

			if (cContactsExist) 
				{
					for(yy in cContactAry) 

					{
						showMessage=true;
						appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
						appConType = cContactAry[yy].getCapContactModel().getContactType();
						appPhoneNum = cContactAry[yy].getPeople().phone1;
						appSeqNum = cContactAry[yy].getCapContactModel().getPeople().getContactSeqNumber();
						cContactDelete = false;
							if (appConType == 'Complainant') {
								cContactDelete = true; 
								}

							if (cContactDelete) {
								cTempAry[yy] = [[appName],[appConType],[appPhoneNum]];
								}

							if (cContactDelete) {
								comment(cTempAry[yy][1]+' - '+cTempAry[yy][0]+' - '+cTempAry[yy][2]);
								myComplainer = cTempAry[yy][1]+': '+cTempAry[yy][0]+' - '+cTempAry[yy][2];
								}

							if (cContactDelete) {
								cCapContactModel = cContactAry[yy].getCapContactModel();
								}

							if (cContactDelete) {
								cPeopleModel = cCapContactModel.getPeople();
								}

							if (cContactDelete) {
								cContactSeqNumber = parseInt(appSeqNum);
								}

							if (cContactDelete) {
								aa.people.removeCapContact(newChildID, cContactSeqNumber);
								}
						}
					}

			if (cContactsExist) {
				createCapComment(myComplainer,newChildID);
				}

			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CONTACTS_PROCESS:  " + err.message);
			logDebug(err.stack);
		}
}

function HHC_copyAllInspectionsAndGuidesheetsToChild(capId){
	try{
	var insps = aa.inspection.getInspections(capId).getOutput();
	for (i in insps) {
		var inspId = insps[i].getInspection();
		var copy = aa.inspection.copyInspectionWithGuideSheet(capId, newChildID, inspId);
			}
		}
catch(err){
	logDebug("A JavaScript Error occurred: copyGuidesheetToChild: " + err.message);
	logDebug(err.stack);
}	
}

function HHC_CreateLarvicideSite_IfBreeding_OtherGS(gName,gItem,asiGroup,asiSubGroup){
	try{
		var asiLabel = "Is Site Breeding";
		var myResult = getGuidesheetASIValue(inspId,gName,gItem,asiGroup,asiSubGroup,asiLabel);
			if(myResult=="Yes"){
			//Create the Larvicide Site Case
			newChildID = createChild('EnvHealth','VC','LarvicideSite','NA','');
			// Add Case and Data Fields Info
			copyAppSpecific(newChildID);
						}
}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: CreateLarvicideSite_IfBreeding_OtherGS:  " + err.message);
		logDebug(err.stack);
	}
}
function HHC_CREATE_BODYART_LICENSE() {
	try{
		showMessage = true;
		var saveID = capId;
		var currDate = new Date();
		var assignedInspector = getAssignedToRecord();
		currDate = dateAdd(null,0);
		//EnvHealth/WQ/Body Art/License
		newChildID = createChild('EnvHealth','WQ','Body Art','License','');
		copyAppSpecific(newChildID);
		copyOwner(saveID, newChildID);
		copyASITables(saveID,newChildID);
		updateAppStatus('Active','Created from Body Art Application',newChildID);
		assignCap(assignedInspector,newChildID);
		updateTask('Issuance','Active',null, null, null,newChildID);
		capId = newChildID;
		scheduleInspectDate('Initial',nextWorkDay(dateAdd(null,89)),assignedInspector);
		capId = saveID;
		HHC_GET_ADDRESS_FOR_CHILD();	
	}
	catch(err){
		logDebug("A JavaScript Error occurred: HHC_CREATE_BODYART_LICENSE:  " + err.message);
		logDebug(err.stack);
	}
}

function HHC_CREATE_COURT(){
	try{
		HHC_ODYSSEY_PROCESS();
		crtConAry=nextNameArr;
		concnt = y;
		HHC_CREATE_CRT_CASES();
			}
	catch(err){
	logDebug("A JavaScript Error occurred: HHC_CREATE_COURT:  " + err.message);
	logDebug(err.stack);
				}
}
function HHC_CREATE_CRT_CASES() {
	try{
		showMessage = true;
		comment('cases to create '+concnt);
		fixNameArr= new Array();
		fixNameArr=crtConAry;
		cContactAry = new Array();
		var cContactResult = AInfo[''];
		cContactsExist = false;
		ccnt=0;
		cContactResult = aa.people.getCapContactByCapID(capId);
			if (cContactResult.getSuccess()) 
				{
					cContactsExist = true;
					}

			if (cContactsExist) 
				{
					cContactAry = cContactResult.getOutput();
					}

			if (cContactsExist) 
				{
					for (i=0; i<concnt; i++) 

					{
					cContactResult = AInfo[''];
					cContactsExist = false;
					cContactAry = new Array();
					nextNameArr = new Array();
					prevName = 'Start';
					cTempAry = new Array();
					var saveID = capId;
					comment("THE SAVEID IS "+saveID);
					cCapContactModel = AInfo[''];
					cContactSeqNumber = 0;
					cPeopleModel = AInfo[''];
					cc = 0;
					y = 0;
				{
					newChildID = createChild('EnvHealth','CRT','NA','NA','');
					copyAppSpecific(newChildID);
					comment('New child app id = '+ newChildID);
					masterArray = new Array();
					elementArray = new Array();
					code10or19 = AInfo['Ordinance Chapter'];
					updateAppStatus('Legal Review','Initial Status',newChildID);
					assignCap('CSANDERS',newChildID);
					editAppSpecific('Parent Case',capIDString,newChildID);
					
					if (appMatch('*/*/LHH/*')) 
					{
						editAppSpecific('Case Type','Lead',newChildID);
						editAppSpecific('Parent Case',saveID,newChildID);
						editAppSpecific('EHS Court Day','THURS',newChildID);
						editAppSpecific('EHS Court Time','1:00 PM',newChildID);
						}

					HHC_GET_OFFENSE_CODES(newChildID);	
					HHC_GET_ADDRESS_FOR_CHILD();
				}	
				ccnt++;
				comment('ccnt = '+ccnt);
				capId = newChildID;
				comment("NEW CHILD ID IS "+newChildID);
				cContactResult = aa.people.getCapContactByCapID(capId);
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				if (cContactResult.getSuccess()) 
				{
					cContactsExist = true;
					}

					if (cContactsExist) 
					{
						for(yy in cContactAry) 

						HHC_SORT_CONTACTS();
						}

					if (cContactsExist) 
					{
						for(yy in cTempAry) 

						HHC_CheckContact();
						}

					if (cContactsExist) 
					{
						for(yy in nextNameArr) 
							
						nextNameArr.sort();
						}	
						for(ii=0;ii<cc;ii++) 

						{
							var csortContactNum = nextNameArr[ii][0];
							var csortContactNameToCheckFor = nextNameArr[ii][1];
							var csortContactSeqNum = nextNameArr[ii][2];
							
							var cContactDelete = true;
							cCapContactModel = cContactAry[ii].getCapContactModel();
							if (parseInt(ccnt) == parseInt(csortContactNum)) 
							{
								cContactDelete = false;
								}

							if ((!matches(cContactTypeToCheckFor, 'Property Owner','Tenant','Responsible Party')))	
						    //Each person on their CRT is always Primary
							{
								cContactDelete = true;
								}

							if (cContactDelete) {
								cPeopleModel = cCapContactModel.getPeople();
								}

							if (cContactDelete) 
							{
								cContactSeqNumber = parseInt(csortContactSeqNum);
								}

							if (cContactDelete) 
							{
								aa.people.removeCapContact(capId, cContactSeqNumber);
								}

							showMessage = true;
							comment(ccnt +' - '+nextNameArr[ii][0]+' ii= '+ii+' - '+nextNameArr[ii][1]+' - '+nextNameArr[ii][2]+' - '+nextNameArr[ii][3]+' ---- '+cContactDelete+' - '+cContactSeqNumber+' - '+csortContactSeqNum);

							}

			capId = saveID;
			comment("the saved capId is "+saveID);

						}

				}
			}
		catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_CREATE_CRT_CASES:  " + err.message);
			logDebug(err.stack);
			}
	}

function HHC_CREATE_RCP_CASE() {
	try{
		showMessage = true;
		var saveID = capId;
		var currDate = new Date();
		var asgnTo = getAppSpecific('Assigned To');
		currDate = dateAdd(null,0);
		var crtOrder = 'No';
		//var aStatus = getAppStatus();
		//var isItPM = 'No';
		if(isTaskStatus('Requesting Admin Court Order','Admin Court Order Obtained')){crtOrder = 'Yes';}
		//if (aStatus = 'Permanent Injuction'){isItPM = 'Yes';}
		newChildID = createChild('EnvHealth','EHSM','RCP','NA','');
		copyAppSpecific(newChildID);
		editAppSpecific('TRA Case',capIDString,newChildID);
		editAppSpecific('Assigned To EHS',asgnTo,newChildID);
		editAppSpecific('Referral Date',currDate,newChildID);
		editAppSpecific('Court Order',crtOrder,newChildID);
		//editAppSpecific('Permanent Injunction',isItPM,newChildID);
		copyASITables(saveID,newChildID);
		HHC_GET_ADDRESS_FOR_CHILD();	
	}
	catch(err){
		logDebug("A JavaScript Error occurred: HHC_CREATE_RCP_CASE:  " + err.message);
		logDebug(err.stack);
	}
}

function HHC_doCaseCreationActions(){
	
	try{
		sepScriptConfigArr = new Array();
		//see if any records are set up--module can be specific or "ALL", look for both
		var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
		if(sepScriptConfig.getSuccess()){
			var sepScriptConfigArr = sepScriptConfig.getOutput();
			if(sepScriptConfigArr.length<1){
				var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
				if(sepScriptConfig.getSuccess()){
					var sepScriptConfigArr = sepScriptConfig.getOutput();
				}
			}
		}
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepRules = loadASITable("ACTIONS FOR CASE CREATION",cfgCapId);
				if(sepRules.length>0){
					var assignmentForType;
					for(row in sepRules){
						if(sepRules[row]["Active"]=="Yes"){
							var recType = ""+sepRules[row]["Record Type"];
							var appMatch = '';
							var recdTypeArr = "" + recType;
							var arrAppType = recdTypeArr.split("/");
							var complaintType = ""+sepRules[row]["Complaint Type"];
							var ResidentialOrCommercial = ""+sepRules[row]["Residential or Commercial"];
							var RecordAssignmentChoice = ""+sepRules[row]["Record Assignment Choice"];
							var RecordAssignmentValue = ""+sepRules[row]["Name of Discipline"];
							var LayerName = ""+sepRules[row]["GIS Layer Name"]; 
							var IdField = ""+sepRules[row]["GIS Id Field"];
							var myDept = arrAppType[1];
							var mySubDept = arrAppType[2];
							switch(true) {
								case RecordAssignmentChoice == 'Inspector by Discipline':
								case RecordAssignmentChoice == 'Supervisor by Discipline':
								//if there is more than 1 person in a discipline, assign to the department
									var sysUserList;
									var sysUserResult = aa.people.getSysUserListByDiscipline(RecordAssignmentValue);											
									if (sysUserResult.getSuccess()) {
											sysUserList = sysUserResult.getOutput().toArray();
											if (sysUserList.length>1)	{
												//More than 1 person, assign to department
												var userId = sysUserList[0].getUserID();
												HHC_getMyDepartment(userId);
											}
											else {
												//Assigned to person	
												RecordAssignedTo = hhcgetUserByDiscipline(RecordAssignmentValue);
											}
									}
									break;																			
								case RecordAssignmentChoice == 'Inspector by GIS Zone':
									zone = getGISInfo("MCPHD", LayerName, IdField);
									comment('the LayerName is: '+LayerName);
									comment('the IdField is: '+IdField);
									comment('the zone is: '+zone);
									comment('Department is :'+arrAppType[1]);
									comment('The variable myDept is '+myDept);
									comment('The variable mySubDept is '+mySubDept);
									
									if (zone && zone != "undefined" && zone != null && LayerName == 'FoodsDistrict')
										RecordAssignedTo = lookup('GIS - Foods EHS',zone); 
									else if (zone && zone != "undefined" && zone != null && LayerName == 'PoolInspectorDistrict')
										RecordAssignedTo = lookup('GIS - Pools EHS',zone); 
									else
										RecordAssignedTo = null;
									break;	
								default:
									RecordAssignedTo = 'undefined';
							} 
	
							var recordAssignment = RecordAssignedTo;
	
							//Record Type Validation
							if(recType.length>0){
								var appMatch = true;
								var recType = ""+sepRules[row]["Record Type"];
								var recdTypeArr = "" + recType;
								var arrAppType = recdTypeArr.split("/");
								if (arrAppType.length != 4){								
									appMatch = false;
								}else{
									for (index in arrAppType){
										if (!arrAppType[index].equals(appTypeArray[index]) && !arrAppType[index].equals("*")){
											appMatch = false;
										}
									}
								}
									//If assignment rule for this type
									if(appMatch) {
										//Record Assignment
										assignmentForType = recordAssignment;
									}
								}
							
						}
					}
					
					// Escape loop
					if(assignmentForType) {
						aa.print("Assigned cap to " + assignmentForType);
					assignCap(assignmentForType);
					}

					// Close Case Intakes
					if(aa.workflow.getTask(capId, 'Case Intake').getSuccess() === true && matches(arrAppType[1],'WQ','Food') && !(arrayContains('WQ') && arrayContains('Complaint'))) {
						closeTask('Case Intake', 'Complete', 'Closed by Script', 'Closed by Script');
						if(assignmentForType) {
							assignTask('Complaint Review', assignmentForType);
						}
					}
				}
			}
		}
	}
		catch(err){
		logDebug("A JavaScript Error occurred: function HHC_doCaseCreationActions:  " + err.message);
		logDebug(err.stack)
	}
	}
	

function HHC_doInspectionActions(){
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
			if(sepScriptConfig.getSuccess()){
				var sepScriptConfigArr = sepScriptConfig.getOutput();
			}
		}
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepRules = loadASITable("ACTIONS FROM INSPECTIONS",cfgCapId);
				if(sepRules.length>0){
					for(row in sepRules){
						if(sepRules[row]["Active"]=="Yes"){
							var cInspType = ""+sepRules[row]["Curr_Insp_Type"];
							var InspResultSubmitted = ""+sepRules[row]["Insp_Result_Submitted"];
							var InspTypeToSchedule = ""+sepRules[row]["Insp_Type_to_Schedule"];
							var UseRecheckDate = ""+sepRules[row]["Use_Recheck_Date"]; //'Yes/No' field
								if(UseRecheckDate == 'Yes') {
									var RecheckDate = hhcgetInspRecheckDate(capId,inspId);

								}else {
									UseRecheckDate == 'No'} //give the variable a value anyway
									var DaysToScheduleInTheFuture = ""+sepRules[row]["Days_toSchedule_in_the_Future"]; //number of days in the future
							var RecordAssignedTo = ""+sepRules[row]["Record_Assigned_To"];
							var InspAssignedTo = ""+sepRules[row]["Insp_Assigned_To"];
							var workflowTask = ""+sepRules[row]["Workflow_Task"];
							var newWorkflowStatus = ""+sepRules[row]["New_Workflow_Status"];
							var WorkflowAssignedTo = ""+sepRules[row]["Workflow_Assigned_To"];
						//Need to develop a function for each selection in the assignment field
								
						//Current Inspector
							var assignedToInspection = getInspector(inspType);
						//Person Assigned to the Record
							var assignedToRecordInspector = getAssignedToRecord();
						//Current Department
							var currentDepartment = HHC_getMyDepartment(assignedToInspection);
						//Supervisor of Current Inspector
							var supervisorOfInspector = "";
							var recType = ""+sepRules[row]["Record Type"];
							var deptstring = recType.split("/");
							//EnvHealth/WQ/Body Art/Application - EnvHealth/Food/FarmersMarketVendor/Application - EnvHealth/WQ/Childcare/Application
							switch (true) {
								case deptstring[2] == 'Body Art':
									supervisorOfInspector = hhcgetUserByDiscipline('WQBodyArtSupv');
									break;															
								case deptstring[2] == 'FarmersMarketVendor':
									supervisorOfInspector = hhcgetUserByDiscipline('FoodsFarmersMarketVendor');
									break;															
								case deptstring[2] == 'Childcare':
									supervisorOfInspector = hhcgetUserByDiscipline('WQChildCareSupv');
									break;	
								case deptstring[2] == 'FoodsFarmersMarketEvent':
									supervisorOfInspector = hhcgetUserByDiscipline('FoodsFarmersMarketEvent');
									break;					
								default:
									supervisorOfInspector = HHC_getMyTeamLeadersUserID(assignedToRecordInspector);
											}
							//Supervisor of Person Assigned to Record
							var supervisorOfAssignedToRecord = "";
							//EnvHealth/WQ/Body Art/Application - EnvHealth/Food/FarmersMarketVendor/Application - EnvHealth/WQ/Childcare/Application
							switch (true) {
								case deptstring[2] == 'Body Art':
									supervisorOfAssignedToRecord = hhcgetUserByDiscipline('WQBodyArtSupv');
									break;															
								case deptstring[2] == 'FarmersMarketVendor':
									supervisorOfAssignedToRecord = hhcgetUserByDiscipline('FoodsFarmersMarketVendor');
									break;															
								case deptstring[2] == 'Childcare':
									supervisorOfAssignedToRecord = hhcgetUserByDiscipline('WQChildCareSupv');
									break;	
								case deptstring[2] == 'FoodsFarmersMarketEvent':
									supervisorOfAssignedToRecord = hhcgetUserByDiscipline('FoodsFarmersMarketEvent');
									break;					
								default:
									supervisorOfAssignedToRecord = HHC_getMyTeamLeadersUserID(assignedToRecordInspector);
											}	
						//to get Support Staff Method
							var supportStaff = HHC_getMySupportStaffDepartment(assignedToRecordInspector);
							var recordAssignment = '';
							var inspectorAssignment = '';
							var assignedInspector = '';
							var workflowAssignment = '';
				//comment('51 - supervisorOfAssignedToRecord '+supervisorOfAssignedToRecord);
			//Record Type Validation
							if(cInspType.length>0 && InspResultSubmitted.length>0){
								//comment("line 54 - Record Type Validation - section reached");
								var appMatch = true;
								var recdType = ""+sepRules[row]["Record Type"];
								var recdTypeArr = "" + recdType;
								var arrAppType = recdTypeArr.split("/");
								if (arrAppType.length != 4){
									logDebug("The record type is incorrectly formatted: " + recdType);
									return false;
								}else{
									for (xx in arrAppType){
										if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
											appMatch = false;
										}
									}
								}
								if (appMatch){
			//Record Assignment if one is selected
								//comment("RecordAssignedTo.length "+RecordAssignedTo.length);
									if(RecordAssignedTo.length>0){
									if(RecordAssignedTo == 'Current Department'){recordAssignment = currentDepartment; }
									if(RecordAssignedTo == 'Current Inspector'){recordAssignment = assignedToInspection; }
									if(RecordAssignedTo == 'Person Assigned to the Record'){recordAssignment = assignedToRecordInspector; }
									if(RecordAssignedTo == 'Supervisor of Current Inspector'){recordAssignment = supervisorOfInspector; }
									if(RecordAssignedTo == 'Supervisor of Person Assigned to Record'){recordAssignment = supervisorOfAssignedToRecord; }
									if(RecordAssignedTo == 'Support Staff'){recordAssignment = supportStaff; }
									if(matches(RecordAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector')){
									assignCap(recordAssignment);
								}
								if(matches(RecordAssignedTo,'Current Department','Support Staff')){
									HHC_assignDeptCap(recordAssignment);
								}
									}
			//Inspection Assignment if one is selected
									if(InspAssignedTo.length>0){
									if(InspAssignedTo == 'Current Department'){inspectorAssignment = currentDepartment; }
									if(InspAssignedTo == 'Current Inspector'){inspectorAssignment = assignedToInspection; }
									if(InspAssignedTo == 'Person Assigned to the Record'){inspectorAssignment = assignedToRecordInspector; }
									if(InspAssignedTo == 'Supervisor of Current Inspector'){inspectorAssignment = supervisorOfInspector; }
									if(InspAssignedTo == 'Supervisor of Person Assigned to Record'){inspectorAssignment = supervisorOfAssignedToRecord; }
									if(InspAssignedTo == 'Support Staff'){inspectorAssignment = supportStaff; }
									assignedInspector = inspectorAssignment;
									}
			//Record Assignment if one is selected
								//comment("WorkflowAssignedTo.length "+WorkflowAssignedTo.length);
									if(WorkflowAssignedTo.length>0){
									if(WorkflowAssignedTo == 'Current Department'){workflowAssignment = currentDepartment; }
									if(WorkflowAssignedTo == 'Current Inspector'){workflowAssignment = assignedToInspection; }
									if(WorkflowAssignedTo == 'Person Assigned to the Record'){workflowAssignment = assignedToRecordInspector; }
									if(WorkflowAssignedTo == 'Supervisor of Current Inspector'){workflowAssignment = supervisorOfInspector; }
									if(WorkflowAssignedTo == 'Supervisor of Person Assigned to Record'){workflowAssignment = supervisorOfAssignedToRecord; }
									if(WorkflowAssignedTo == 'Support Staff'){workflowAssignment = supportStaff; }
									}
									//comment('99 - workflowAssignment '+workflowAssignment);
									//comment("100 - cInspType.length "+cInspType.length);
									//comment("InspResultSubmitted.length "+InspResultSubmitted.length);
									//comment("InspTypeToSchedule.length "+InspTypeToSchedule.length);
										if(cInspType.length>0 && InspResultSubmitted.length>0 && InspTypeToSchedule.length>0){
			//define assignedInspector		
											if(matches(InspAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector')){
												if(UseRecheckDate == 'Yes'){
													scheduleInspectDate(InspTypeToSchedule,RecheckDate,assignedInspector); //schedule inspection using recheck date
												}
												if(UseRecheckDate == 'No' && DaysToScheduleInTheFuture>0){
													scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,DaysToScheduleInTheFuture)),assignedInspector);//schedule inspection using #ofDays field
												}
												else 
												{
													scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,0)),assignedInspector); //schedule inspection for tomorrow
												}
											}
											if(matches(InspAssignedTo,'Current Department')){
												if(UseRecheckDate == 'Yes'){
													scheduleInspectDate(InspTypeToSchedule,RecheckDate,null); //schedule inspection using recheck date
												}
												if(UseRecheckDate == 'No' && DaysToScheduleInTheFuture>0){
													scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,DaysToScheduleInTheFuture)),null);//schedule inspection using #ofDays field
												}
												else 
												{
													scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,0)),null); //schedule inspection for tomorrow
												}
													assignInspection(inspId, assignedInspector);
											}										
										}
									//comment("177 - cInspType.length "+cInspType.length);
									//comment("InspResultSubmitted.length "+InspResultSubmitted.length);
									//comment("workflowTask.length "+ workflowTask.length);
									//comment("newWorkflowStatus.length>0 "+newWorkflowStatus.length);
									//comment('181 - workflowAssignment '+workflowAssignment);
										if(cInspType.length>0 && InspResultSubmitted.length>0 && workflowTask.length>0 && newWorkflowStatus.length>0){
											if((cInspType == 'any' || cInspType.length>0) && (InspResultSubmitted == 'any' || InspResultSubmitted.length>0)){ 
												updateTask(workflowTask,newWorkflowStatus,'Updated by script');
												}
												if(WorkflowAssignedTo.length>0 && matches(WorkflowAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector')){
											//comment('187 - workflowAssignment '+workflowAssignment);
														assignTask(workflowTask,workflowAssignment);
													}
												if(WorkflowAssignedTo.length>0 && matches(WorkflowAssignedTo,'Current Department')){
											
														updateTaskDepartment(workflowTask, workflowAssignment);
													}
										}
										var customFunctions = ""+sepRules[row]["Custom_Functions"];
										var chkFilter = ""+customFunctions;
									if (chkFilter.length>0) {
										eval(customFunctions);
									}else{
										//logDebug("ACTIONS FROM INSPECTIONS: Check filter resolved to false: " + chkFilter);
									}
								}
								else{
									//logDebug("ACTIONS FROM INSPECTIONS: No app match: " + recdTypeArr);
								}
							}else{
								logDebug("ACTIONS FROM INSPECTIONS: No Inspection type and Result match: " + cInspType + "/" + InspResultSubmitted);
							}
						}
					}
				}
			}
		}
	}
}
	catch(err){
	logDebug("A JavaScript Error occurred: function HHC_doInspectionActions:  " + err.message);
	logDebug(err.stack)
}
}

//HHC_doWorkflowActions
function HHC_doWorkflowActions(){
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
			if(sepScriptConfig.getSuccess()){
				var sepScriptConfigArr = sepScriptConfig.getOutput();
			}
		}
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepRules = loadASITable("ACTIONS FROM WORKFLOW",cfgCapId);
				if(sepRules.length>0){
							//comment("wfTask "+wfTask);
							//comment("wfStatus "+wfStatus);
					for(row in sepRules){
							//Workflow Required
							var cTask = ""+sepRules[row]["Current Task"];
							var SubmittedTaskStatus = ""+sepRules[row]["Submitted Task Status"];
						if(sepRules[row]["Active"]=="Yes" && matches(wfTask,cTask) && matches(wfStatus,SubmittedTaskStatus)){
							//Inspection fields
							var InspTypeToSchedule = ""+sepRules[row]["Insp Type to Schedule"];
							var DaysToScheduleInTheFuture = ""+sepRules[row]["Days_to_Schedule_in_the_Future"]; //number of days in the future
							var InspAssignedTo = ""+sepRules[row]["Insp_Assigned_To"];
							//New Workflow Info
							var New_Task = ""+sepRules[row]["New Task"];							
							var newTaskStatus = ""+sepRules[row]["New Task Status"];
							var WorkflowAssignedTo = ""+sepRules[row]["Workflow_Assigned_To"];
							//Record Info
							var newRecordStatus = ""+sepRules[row]["New Record Status"];							
							var RecordAssignedTo = ""+sepRules[row]["Record_Assigned_To"];
						//Current Inspector on Workflow
						var assignedToWorkflow = ""+getAssignedToRecord(); //needs to be developed. Using assigned to record for now.
						//Person Assigned to the Record
							var assignedToRecordInspector = getAssignedToRecord();
						//Current Department
							var currentDepartment = HHC_getMyDepartment(assignedToWorkflow);
						//Supervisor of Current Inspector
							var supervisorOfInspector = "";
							var recType = ""+sepRules[row]["Record Type"];
							var deptstring = recType.split("/");
							//EnvHealth/WQ/Body Art/Application - EnvHealth/Food/FarmersMarketVendor/Application - EnvHealth/WQ/Childcare/Application
							switch (true) {
								case deptstring[2] == 'Body Art':
									supervisorOfInspector = hhcgetUserByDiscipline('WQBodyArtSupv');
									break;															
								case deptstring[2] == 'FarmersMarketVendor':
									supervisorOfInspector = hhcgetUserByDiscipline('FoodsFarmersMarketVendor');
									break;															
								case deptstring[2] == 'Childcare':
									supervisorOfInspector = hhcgetUserByDiscipline('WQChildCareSupv');
									break;	
								case deptstring[2] == 'FoodsFarmersMarketEvent':
									supervisorOfInspector = hhcgetUserByDiscipline('FoodsFarmersMarketEvent');
									break;					
								default:
									supervisorOfInspector = HHC_getMyTeamLeadersUserID(assignedToWorkflow);
											}
							//Supervisor of Person Assigned to Record
							var supervisorOfAssignedToRecord = "";
							//EnvHealth/WQ/Body Art/Application - EnvHealth/Food/FarmersMarketVendor/Application - EnvHealth/WQ/Childcare/Application
							switch (true) {
								case deptstring[2] == 'Body Art':
									supervisorOfAssignedToRecord = hhcgetUserByDiscipline('WQBodyArtSupv');
									break;															
								case deptstring[2] == 'FarmersMarketVendor':
									supervisorOfAssignedToRecord = hhcgetUserByDiscipline('FoodsFarmersMarketVendor');
									break;															
								case deptstring[2] == 'Childcare':
									supervisorOfAssignedToRecord = hhcgetUserByDiscipline('WQChildCareSupv');
									break;	
								case deptstring[2] == 'FoodsFarmersMarketEvent':
									supervisorOfAssignedToRecord = hhcgetUserByDiscipline('FoodsFarmersMarketEvent');
									break;					
								default:
									supervisorOfAssignedToRecord = HHC_getMyTeamLeadersUserID(assignedToRecordInspector);
											}
			//to get Support Staff Method
							var supportStaff = HHC_getMySupportStaffDepartment(assignedToRecordInspector);
							//Setup variables
							var recordAssignment = '';
							var inspectorAssignment = '';
							var assignedInspector = '';
							var workflowAssignment = '';
				//comment('88 - supervisorOfAssignedToRecord '+supervisorOfAssignedToRecord);
			//Record Type Validation
							if(matches(wfTask,cTask) && matches(wfStatus,SubmittedTaskStatus)){
								//comment("line 54 - Record Type Validation - section reached");
								var appMatch = true;
								var recdType = ""+sepRules[row]["Record Type"];
								var recdTypeArr = "" + recdType;
								var arrAppType = recdTypeArr.split("/");
								if (arrAppType.length != 4){
									logDebug("The record type is incorrectly formatted: " + recdType);
									return false;
								}else{
									for (xx in arrAppType){
										if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
											appMatch = false;
										}
									}
								}
			//if the record is okay					
							if (appMatch){
			//Record Assignment if one is selected
								//comment("RecordAssignedTo.length "+RecordAssignedTo.length);
									if(RecordAssignedTo.length>0){
									if(RecordAssignedTo == 'Current Department'){recordAssignment = currentDepartment; }
									if(RecordAssignedTo == 'Current Inspector'){recordAssignment = assignedToInspection; }
									if(RecordAssignedTo == 'Person Assigned to the Record'){recordAssignment = assignedToRecordInspector; }
									if(RecordAssignedTo == 'Supervisor of Current Inspector'){recordAssignment = supervisorOfInspector; }
									if(RecordAssignedTo == 'Supervisor of Person Assigned to Record'){recordAssignment = supervisorOfAssignedToRecord; }
									if(RecordAssignedTo == 'Support Staff'){recordAssignment = supportStaff; }
								if(matches(RecordAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector')){
									assignCap(recordAssignment);
								}
								if(matches(RecordAssignedTo,'Current Department','Support Staff')){
									HHC_assignDeptCap(recordAssignment);
								}									
									}
			//Inspection Assignment if one is selected
									if(InspAssignedTo.length>0){
									if(InspAssignedTo == 'Current Department'){inspectorAssignment = currentDepartment; }
									if(InspAssignedTo == 'Current Inspector'){inspectorAssignment = assignedToInspection; }
									if(InspAssignedTo == 'Person Assigned to the Record'){inspectorAssignment = assignedToRecordInspector; }
									if(InspAssignedTo == 'Supervisor of Current Inspector'){inspectorAssignment = supervisorOfInspector; }
									if(InspAssignedTo == 'Supervisor of Person Assigned to Record'){inspectorAssignment = supervisorOfAssignedToRecord; }
									if(InspAssignedTo == 'Support Staff'){inspectorAssignment = supportStaff; }
									assignedInspector = inspectorAssignment;
									}
			//Workflow Assignment if one is selected
								//comment("WorkflowAssignedTo.length "+WorkflowAssignedTo.length);
									if(WorkflowAssignedTo.length>0){
									if(WorkflowAssignedTo == 'Current Department'){workflowAssignment = currentDepartment; }
									if(WorkflowAssignedTo == 'Current Inspector'){workflowAssignment = assignedToInspection; }
									if(WorkflowAssignedTo == 'Person Assigned to the Record'){workflowAssignment = assignedToRecordInspector; }
									if(WorkflowAssignedTo == 'Supervisor of Current Inspector'){workflowAssignment = supervisorOfInspector; }
									if(WorkflowAssignedTo == 'Supervisor of Person Assigned to Record'){workflowAssignment = supervisorOfAssignedToRecord; }
									if(WorkflowAssignedTo == 'Support Staff'){workflowAssignment = supportStaff; }
									}
									//comment('99 - workflowAssignment '+workflowAssignment);
									//comment("100 - cTask.length "+cTask.length);
									//comment("SubmittedTaskStatus.length "+SubmittedTaskStatus.length);
									//comment("InspTypeToSchedule.length "+InspTypeToSchedule.length);
									
										if(cTask.length>0 && SubmittedTaskStatus.length>0 && InspTypeToSchedule.length>0){
		
											if(matches(InspAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector')){

												if(DaysToScheduleInTheFuture>0){
													scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,DaysToScheduleInTheFuture)),assignedInspector);//schedule inspection using #ofDays field
												}
												else 
												{
													scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,0)),assignedInspector); //schedule inspection for tomorrow
												}
											}
											if(matches(InspAssignedTo,'Current Department','Support Staff')){

												if(DaysToScheduleInTheFuture>0){
													scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,DaysToScheduleInTheFuture)),null);//schedule inspection using #ofDays field
												}
												else 
												{
													scheduleInspectDate(InspTypeToSchedule,nextWorkDay(dateAdd(null,0)),null); //schedule inspection for tomorrow
												}
													assignInspection(inspId, assignedInspector);  //Assignment when just the department is provided
											}											
																				
										}
									//comment("132 - cTask.length "+cTask.length);
									//comment("SubmittedTaskStatus.length "+SubmittedTaskStatus.length);
									//comment("workflowTask.length "+ cTask.length);
									//comment("newTaskStatus.length>0 "+newTaskStatus.length);
									//comment('136 - workflowAssignment '+workflowAssignment);
										if(matches(wfTask,cTask) && matches(wfStatus,SubmittedTaskStatus) && New_Task.length>0 && newTaskStatus.length>0)
											{ 
												updateTask(New_Task,newTaskStatus,'Updated by script');
											if(WorkflowAssignedTo.length>0 && matches(WorkflowAssignedTo,'Supervisor of Person Assigned to Record','Current Inspector','Person Assigned to the Record','Supervisor of Current Inspector'))
												{
													//comment('142 - workflowAssignment '+workflowAssignment);
													assignTask(New_Task,workflowAssignment);
												}
											if(WorkflowAssignedTo.length>0 && matches(WorkflowAssignedTo,'Current Department','Support Staff'))
												{
												
													updateTaskDepartment(New_Task, workflowAssignment);
												}
											}
										var customFunctions = ""+sepRules[row]["Custom_Functions"];
										var chkFilter = ""+customFunctions;
										comment("Custom Function b4: "+customFunctions);
									if (chkFilter.length>0) {
										eval(customFunctions);
										comment("Custom Function after: "+customFunctions);
									}else{
										//logDebug("ACTIONS FROM WORKFLOW: Check filter resolved to false: " + chkFilter);
									}
								}
								else{
									//logDebug("ACTIONS FROM WORKFLOW: No app match: " + recdTypeArr);
								}
							}else{
								logDebug("ACTIONS FROM WORKFLOW: No Workflow type and Result match: " + cTask + "/" + SubmittedTaskStatus);
							}
							if(matches(wfTask,cTask) && matches(wfStatus,"Court", "Court Case") && matches(SubmittedTaskStatus,"Court", "Court Case", "Refer to Court")){HHC_CREATE_COURT();}
						}
					}
				}
			}
		}
	}
}
	catch(err){
	logDebug("A JavaScript Error occurred: function HHC_doWorkflowActions:  " + err.message);
	logDebug(err.stack)
}
}

function HHC_getAssignedToWorkflow(wfTask){
	
		var workflowResult = aa.workflow.getTaskItems(capId, wfTask,"","","","");
			if (workflowResult.getSuccess())
				wfObj = workflowResult.getOutput();
					for (var i in wfObj) {
						fTask = wfObj[i];
						if (fTask.getTaskDescription().toUpperCase().equals(wfTask.toUpperCase())) {
							var taskUserObj = fTask.getTaskItem().getAssignedStaff();
							return taskUserObj;
			}

}
}
function HHC_getCapAssignment(capId){
	try {
	var theCapAssigned = capDetail.getAsgnStaff();
	return theCapAssigned;
	}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHCgetCapAssignment:  " + err.message);
		logDebug(err.stack);
		}
	}

function HHC_getDepartmentPath(username)
	{
	var suo = aa.person.getUser(username).getOutput(); 
	var dpt = aa.people.getDepartmentList(null).getOutput();
	for (var thisdpt in dpt)
	  	{
	  	var m = dpt[thisdpt]
	  	var n = m.getServiceProviderCode() + "/" + m.getAgencyCode() + "/" + m.getBureauCode() + "/" + m.getDivisionCode() + "/" + m.getSectionCode() + "/" + m.getGroupCode() + "/" + m.getOfficeCode()
		if (n.equals(suo.deptOfUser)) 
	  	return(n)
  		}
  	}

function HHC_getMyDepartment(username)
	{
		try{
			if (username != null) {
			var suo = aa.person.getUser(username).getOutput(); 
			var dpt = aa.people.getDepartmentList(null).getOutput();
			var suof = '';
				suof = suo.deptOfUser+'';
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();
				var n = m.getServiceProviderCode() + "/" + m.getAgencyCode() + "/" + m.getBureauCode() + "/" + m.getDivisionCode() + "/" + m.getSectionCode() + "/" + m.getGroupCode() + "/" + m.getOfficeCode();
					if (n == suof){
							return(p);	
						}					
					}		
				}
			}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHC_getMyDepartment:  " + err.message);
		logDebug(err.stack);
		}
	}

function HHC_getMySupervisorDepartment(username)
	{
		try{
			var suo = aa.person.getUser(username).getOutput(); 
			var dpt = aa.people.getDepartmentList(null).getOutput();
			var suof = suo.deptOfUser;
			var deptstring = suof.split("/");
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();
				var n = deptstring[0] + "/" + deptstring[1] + "/" + deptstring[2] + "/" + deptstring[3] + "/" + deptstring[4] + "/" + deptstring[5] + "/NA";
					if (n == m){
							return(p);	
							//return(n); //MCPHD/MCPHD/EH/HOUSING/MGRA/TEAMC/NA
					}		
				}
			}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHC_getMyDepartment:  " + err.message);
		logDebug(err.stack);
		}
	}
function HHC_getMySupportStaffDepartment(username)
	{
		try{
			if (username != null){
			var suo = aa.person.getUser(username).getOutput(); 
			var dpt = aa.people.getDepartmentList(null).getOutput();
			var suof = suo.deptOfUser;
			var deptstring = suof.split("/");
			var n = ''; zero = deptstring[0]; one = deptstring[1]; two = deptstring[2]; three = deptstring[3]; four = deptstring[4]; five = deptstring[5]; six = "/SUPP";
				switch (true) {
						case deptstring[3] == 'EHSM':
						case deptstring[3] == 'FOODS':
						case deptstring[3] == 'WQ':
							four = "NA"; 
							five = "NA";
							break;
						case deptstring[3] == 'HHECMSC':
							four = "NA"; 
							five = "CLINTEAM";
							break;					
						case deptstring[3] == 'VECTOR':
							four = "MOSQCTL"; 
							five = "NA"; 
							break;
						case deptstring[3] == 'HOUSING':
							four = "MGRB";
							five = "TEAMG";
							break;
						default:
							four = "NA"; 
							five = "NA";
				}
				n = zero + "/" + one + "/" + two + "/" + three + "/" + four + "/" + five + six;
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();
					if (n == m){
							return(p);	
					}		
				}
			}
			}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHC_getMySupportStaffDepartment:  " + err.message);
		logDebug(err.stack);
		}
	}

function HHC_getMyTeamLeadersUserID(username)
	{
		try{
			var suo = aa.person.getUser(username).getOutput(); 
			var dpt = aa.people.getDepartmentList(null).getOutput();
			var suof = suo.deptOfUser;
			var deptstring = suof.split("/");
			for (var thisdpt in dpt)
				{
				var m = dpt[thisdpt];
				var p = m.getDeptName();
				var n = deptstring[0] + "/" + deptstring[1] + "/" + deptstring[2] + "/" + deptstring[3] + "/" + deptstring[4] + "/" + deptstring[5] + "/NA";
					if (n == m){
						var peo = aa.people.getSysUserList(null).getOutput();
							for(x in peo){
								var p = peo[x];
								var q = (p.getServiceProviderCode() + "/" + p.getAgencyCode() + "/" + p.getBureauCode() + "/" + p.getDivisionCode() + "/" + p.getSectionCode() + "/" + p.getGroupCode() + "/" + p.getOfficeCode());
									if (q == n){
									return(p.getGaUserID());
						}
					}		
				}
			}
		}
		catch(err)
		{
		logDebug("A JavaScript Error occurred: HHC_getMyTeamLeadersUserID:  " + err.message);
		logDebug(err.stack);
		}
	}
function HHC_getRiskDays() {
	try{
		var iRisk = AInfo['Risk'];
		var idays = 0;
			if (parseInt(iRisk) == 1) {
				idays = 364;
		}
			if (parseInt(iRisk) == 2) {
				idays = 179;
		}
			if (parseInt(iRisk) == 3) {
				idays = 89;
		}
		return parseInt(idays);
	}
		catch(err)
	{
			logDebug("A JavaScript Error occurred: HHC_getRiskDays:  " + err.message);
			logDebug(err.stack);
	}
}

function hhc_getTheAddress(capId)
{
	try {
       var capAddResult = aa.address.getAddressByCapId(capId);
       if (capAddResult.getSuccess())
              {
                     var addrArray = new Array();
                     var addrArray = capAddResult.getOutput();
                     var hseNum = "";
                     var streetDir = "";
                     var streetName = "";
                     var streetSuffix = "";
                     var zip = "";
                     if (addrArray[0].getHouseNumberStart() != null)
                           hseNum= addrArray[0].getHouseNumberStart();
                     if (addrArray[0].getStreetDirection() != null)
                           streetDir = addrArray[0].getStreetDirection();
                     if (addrArray[0].getStreetName() != null)
                           streetName = addrArray[0].getStreetName();
                     if (addrArray[0].getStreetSuffix() != null)
                           streetSuffix = addrArray[0].getStreetSuffix();
                     if (addrArray[0].getZip() != null)
                           zip = addrArray[0].getZip();
              }
       else
              {
                     logDebug("**ERROR: Failed to get Address object: " + capAddResult.getErrorType() + ":" +capAddResult.getErrorMessage());
              }
                     thisCapAddress = hseNum + " " + ltrim(streetDir+" ") + streetName + " " + streetSuffix;
                     return thisCapAddress;
		}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: hhc_getTheAddress:  " + err.message);
		logDebug(err.stack);
	}
}
function hhc_getTheCensusTract(capId)
{
		try {
	//This section gets the parcel information from the case.  We need the Census Tract to determine the Team Leader for the Case.
	var fcapParcelObj = null; //This holds the parcel information
	var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
		if (capParcelResult.getSuccess())
		{
			var fcapParcelObj = capParcelResult.getOutput().toArray();
			var thisCensusTract = fcapParcelObj[0].getCensusTract();  //Use the Census Tract to get the Team Leader for the Case.
		}
		else
		{
			logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" +capParcelResult.getErrorMessage());
		}
		
	return thisCensusTract;
			}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: getTheCensusTract:  " + err.message);
		logDebug(err.stack);
	}
}
function HHC_GET_ADDRESS() 
{
	try{

		var addrResult = aa.address.getAddressByCapId(capId);
		var addrArray = new Array();
		var addrArray = addrResult.getOutput();
		var streetName = addrArray[0].getStreetName();
		var hseNum = addrArray[0].getHouseNumberStart();
		var streetSuffix = addrArray[0].getStreetSuffix();
		var streetDir = addrArray[0].getStreetDirection();
			if (streetSuffix == null || streetSuffix == '' || streetSuffix == 'undefined') {
				streetSuffix = ' ';
				}

			if (streetDir == null || streetDir == '' || streetDir == 'undefined') {
				streetDir == ' ';
				}

			comment ('The Address is: '+hseNum+' '+streetDir+' '+streetName+' '+streetSuffix);
			
			if (streetDir == null && (matches(appTypeArray[1],'HOUSING','HHECMSC'))) {
				editAppName(hseNum+' '+streetName+' '+streetSuffix);
				}

			if (streetDir != null && (matches(appTypeArray[1],'HOUSING','HHECMSC'))) {
				editAppName(hseNum+' '+streetDir+' '+streetName+' '+streetSuffix);
				}

			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_ADDRESS:  " + err.message);
			logDebug(err.stack);
		}
}

function HHC_GET_ADDRESS_FOR_CHILD() 
{
	try{

		var addrResult = aa.address.getAddressByCapId(capId);
		var addrArray = new Array();
		var addrArray = addrResult.getOutput();
		var streetName = addrArray[0].getStreetName();
		var hseNum = addrArray[0].getHouseNumberStart();
		var streetSuffix = addrArray[0].getStreetSuffix();
		var streetDir = addrArray[0].getStreetDirection();
			if (streetSuffix == null || streetSuffix == '' || streetSuffix == 'undefined') {
				streetSuffix = ' ';
				}

			if (streetDir == null || streetDir == '' || streetDir == 'undefined') {
				streetDir == ' ';
				}

			comment ('The Address is: '+hseNum+' '+streetDir+' '+streetName+' '+streetSuffix);
			if (streetDir == null) {
				editAppName(hseNum+' '+streetName+' '+streetSuffix,newChildID);
				comment('The Child ID is: '+newChildID);
				}

			if (streetDir != null) {
				editAppName(hseNum+' '+streetDir+' '+streetName+' '+streetSuffix,newChildID);
				comment('The Child ID is: '+newChildID);
				}
				}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_GET_ADDRESS_FOR_CHILD:  " + err.message);
			logDebug(err.stack);
		}
}
function HHC_GET_OFFENSE_CODES(childID) {
			try {
				if (!childID) {
					logDebug("Required parameter child ID is null");
					return;
				}
				code10or19 = AInfo['Ordinance Chapter'];
				logDebug("HHC_GET_OFFENSE_CODES: Starts here");
				//get Violation Table from current record and interrogate each violation and determine the violation column value
				var v = ''; 
				var vioCodeNums = '';
				var newVioCode = '';
				var uniqVioCodes = '';
				if (matches(appTypeArray[2],'HSG','TRA')){
				crtVIOLATIONS = loadASITable('VIOLATIONS');
				if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
					for(a in crtVIOLATIONS) {
						thisrow = crtVIOLATIONS[a];
						if (matches(thisrow['Status'],'Court') && !matches(thisrow['Violation'],null)) {
							//for each value look up the corresponding codes in the translation table that fits the case and push each code set to an array:
							//HSG Cases
								
								if (matches(appTypeArray[2],'HSG')){
									logDebug("HHC_GET_OFFENSE_CODES: Housing Case");
									logDebug("HHC_GET_OFFENSE_CODES: parseInt(code10or19) - "+parseInt(code10or19));
									if (parseInt(code10or19) == 10) {
										v = lookup('VioCode_Chpt10_Occ',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									if (parseInt(code10or19) == 19) {
										v = lookup('VioCode_Chpt19',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}	
							}													
							//TRA Cases
								if (matches(appTypeArray[2],'TRA')){
								//Trash Occupied - Residential - VioCode_Chpt10_Occ
								logDebug("HHC_GET_OFFENSE_CODES: Trash Case");
									if (parseInt(code10or19) == 10 && AInfo['Property Type'] == 'Occupied') {
										v = lookup('VioCode_Chpt10_Occ',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									//Trash on vacant lot - Residential - VioCode_Chpt10_VL
									if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'],'Vacant Lot')){
										v = lookup('VioCode_Chpt10_VL',crtVIOLATIONS[a]['Violation']);
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									//Trash on vacant structure - Residential - VioCode_Chpt10_VS
									if (parseInt(code10or19) == 10 && matches(AInfo['Property Type'],'Vacant Structure')) {
										v = lookup('VioCode_Chpt10_VS',crtVIOLATIONS[a]['Violation']);
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									//Trash Occupied - Commercial - VioCode_Chpt19
									if (parseInt(code10or19) == 19 && AInfo['Property Type'] == 'Occupied') {
										v = lookup('VioCode_Chpt19',crtVIOLATIONS[a]['Violation']);
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									}
									//Trash on vacant structure - Commercial - VioCode_Chpt19_VS
									if (parseInt(code10or19) == 19 && matches(AInfo['Property Type'],'Vacant Structure')) {
										v = lookup('VioCode_Chpt19_VS',crtVIOLATIONS[a]['Violation']);
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = '';
									} 
								}

							}
							else {
								logDebug("Status is not court or violation is null");
							}
						} // end for each row
					}
				}
			
									//LHH Cases using Guidesheets
								
								if (matches(appTypeArray[2],'LHH')){
									logDebug("HHC_GET_OFFENSE_CODES: LHH Case");
									logDebug("HHC_GET_OFFENSE_CODES: parseInt(code10or19) - "+parseInt(code10or19));
									if (parseInt(code10or19) == 10) {
										/* v = lookup('VioCode_Chpt10_Occ',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = ''; */
										vioCodeNums = '10307OI'
									}
									if (parseInt(code10or19) == 19) {
										/* v = lookup('VioCode_Chpt19',crtVIOLATIONS[a]['Violation']);	
										v = v.replace(/-/g,'');
										vioCodeNums = vioCodeNums+v.replace(/\//g,'OI');
										vioCodeNums = vioCodeNums+'OI';
										v = ''; */
										vioCodeNums = '19306OI'
									}	
							}
								
							newVioCodes = vioCodeNums.match(/.{1,7}/g);		
							logDebug('New Viocodes length for '+appTypeArray[2]+' - '+newVioCodes.length);
							for (z in newVioCodes) {
								thisVioCode = newVioCodes[z];
								newOffenseRow = new Array();
								newOffenseRow['OFFENSE CODE'] = new asiTableValObj("OFFENSE CODE", thisVioCode, 'N');
								addToASITable('OFFENSE CODES',newOffenseRow, childID);
							}	
			
			
			
		}	
		catch(err) {
			logDebug("A JavaScript Error occurred: HHC_GET_OFFENSE_CODES:  " + err.message);
			logDebug(err.stack);
		}
	}

function HHC_ODYSSEY_PROCESS() 
{
	try{
		cContactResult = AInfo[''];
		cContactsExist = false;
		cContactAry = new Array();
		y = 0;
		addCourtCase = false;
		prevName = 'Start';
		cTempAry = new Array();
		nextNameArr = new Array();
		saveID = capId;
		cContactResult = aa.people.getCapContactByCapID(capId);
			if (cContactResult.getSuccess()) {
				cContactsExist = true;
				}

			if (cContactsExist) {
				cContactAry = cContactResult.getOutput();
				cc = cContactAry.length;
				}

			if (cContactsExist) {
				for(yy in cContactAry) 

			HHC_SORT_CONTACTS();
				}

			if (cContactsExist) {
				for(yy in cContactAry) 

			HHC_CheckContact();
				}

			if (cContactsExist) {
				for(yy in nextNameArr) nextNameArr.sort();
				}

			if (cContactsExist) 
			{
				comment(nextNameArr.length+' - '+y);
				}
		}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_ODYSSEY_PROCESS:  " + err.message);
			logDebug(err.stack);
		}
}
function HHC_SEND_BBE_EMAILS() {
	try{
		
		var vioAddress = hhc_getTheAddress(capId);
		appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
		appConType = cContactAry[yy].getCapContactModel().getContactType();
		appEmail = cContactAry[yy].getPeople().getEmail();
		var br = '<BR>';
		var emailDan = 'dfries@marionhealth.org';
		var emailLarry = 'llobdell@marionhealth.org';
		var sendALetter = false;
		var hsgEmailSubject = 'A Bed Bug Case was Created by Housing';
		var bbeEmailSubject = 'A Bed Bug Case was Created';
		var appDate = dateAdd(null,0);
		var appTOC = 'Personal';
		var appCOM = '';
		var appTOD = 'Information Packet';
		sendAnEmail = false;
		var cType = false;
		var emailSubject = bbeEmailSubject;
		var emailDContent = 'An email was sent to '+appName+' ('+appEmail+') '+'regarding bed bugs found at '+vioAddress+' with the recommended informational packet attached. '+br+br+'A copy of this email also went to Larry Lobdell.'+br+br+'Sincerely,'+br+br+"Accela's Automated Email Distribution";
		var emailLContent = 'An email was sent to '+appName+' ('+appEmail+') '+'regarding bed bugs found at '+vioAddress+' with the recommended informational packet attached. '+br+br+'A copy of this email also went to Dan Fries.'+br+br+'Sincerely,'+br+br+"Accela's Automated Email Distribution";
		var mailDContent = 'A letter was sent to '+appName+' regarding bed bugs found at '+vioAddress+' with the recommended informational packet included. '+br+br+'A copy of this letter also went to Larry Lobdell.'+br+br+'Sincerely,'+br+br+"Accela's Automated Email Distribution";
		var mailLContent = 'A letter was sent to '+appName+' regarding bed bugs found at '+vioAddress+' with the recommended informational packet included. '+br+br+'A copy of this letter also went to Dan Fries.'+br+br+'Sincerely,'+br+br+"Accela's Automated Email Distribution";
		var emailContentToOwner = 'Dear '+appName+', '+br+br+'A recent inspection conducted at '+vioAddress+' revealed that evidence of bed bugs was found at this address.  This email contains information about steps you can take to eliminate bed bugs from your home.  Please read the recommended informational packet attached. '+br+br+'If you have questions about this situation, please call our Bed Bug Hotline at (317) 221-7454.  '+br+br+'Thank you,'+br+br+'Marion County Public Health Department';
		var emailSubjectToOwner = 'Information Regarding a Recent Inspection';
			if (matches(appConType, 'DH/Owner', 'Occupant','Property Owner','Tenant')) {
				cType = true;
				}

			if (!matches(appEmail, null,'',' ')) {
				sendAnEmail = true;
				}

			if (cType && sendAnEmail) {
				email(emailDan, 'rvoller@hhcorp.org',emailSubject,emailDContent);
				email(emailLarry, 'rvoller@hhcorp.org',emailSubject,emailLContent);
				email(appEmail,emailDan,emailSubjectToOwner,emailContentToOwner);
				elementArray['Date'] = appDate;
				elementArray['Type of Contact'] = appTOC;
				elementArray['Contact Name'] = appName;
				elementArray['Comments'] = appCOM;
				elementArray['Types of Documents'] = appTOD;
				elementArray['Method'] = 'Email';
				masterArray.push(elementArray);
				elementArray = new Array();
				}

			if (cType && sendAnEmail == false) {
				email(emailDan, 'rvoller@hhcorp.org',emailSubject,mailDContent);
				email(emailLarry, 'rvoller@hhcorp.org',emailSubject,mailLContent);
				email(appEmail,emailDan,emailSubjectToOwner,emailContentToOwner);
				elementArray['Date'] = appDate;
				elementArray['Type of Contact'] = appTOC;
				elementArray['Contact Name'] = appName;
				elementArray['Comments'] = appCOM;
				elementArray['Types of Documents'] = appTOD;
				elementArray['Method'] = 'Mail';
				masterArray.push(elementArray);
				elementArray = new Array();
				}

		}
	catch(err)
	{
	logDebug("A JavaScript Error occurred: HHC_SEND_BBE_EMAILS:  " + err.message);
	logDebug(err.stack);
	}
}

function HHC_SORT_CONTACTS() 
{
	try{
		showMessage=true;
		appName = cContactAry[yy].getCapContactModel().getPeople().getFullName();
		if (!matches(cContactAry[yy].getCapContactModel().getPeople().getRelation(),'Responsible Party')) {
			appConType = cContactAry[yy].getCapContactModel().getContactType();
		}
		else 
		{appConType =cContactAry[yy].getCapContactModel().getPeople().getRelation();}
		appSeqNum = cContactAry[yy].getCapContactModel().getPeople().getContactSeqNumber();
		
		if (appConType){
		cTempAry[yy] = [[appName],[appConType],[appSeqNum]];
		cTempAry.sort();
		comment(cTempAry[yy][0]+' - '+cTempAry[yy][1]+' - '+cTempAry[yy][2]);
		}
			}
	catch(err)
		{
			logDebug("A JavaScript Error occurred: HHC_SORT_CONTACTS:  " + err.message);
			logDebug(err.stack);
			}
}

function HHC_VIOLATIONS_LOOP() 
{
	try{
		finVIOLATIONS = loadASITable('VIOLATIONS');
			if (finVIOLATIONS && finVIOLATIONS.length > 0) {
				fixVIOLATIONS = loadASITable('VIOLATIONS');
				removeASITable('VIOLATIONS');
			}
			if (finVIOLATIONS && finVIOLATIONS.length > 0) {
				for(i in fixVIOLATIONS) {
					eachrow = fixVIOLATIONS[i];
					if (matches(eachrow['Status'],'Open', 'Court')) {
						fixVIOLATIONS[i]['Status'] ='Final';
					}

				}

			}

		if (finVIOLATIONS && finVIOLATIONS.length > 0) {
			addASITable('VIOLATIONS',fixVIOLATIONS);
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP:  " + err.message);
		logDebug(err.stack);
	}
}

function HHC_VIOLATIONS_LOOP_COURT() 
{
	try{
		crtVIOLATIONS = loadASITable('VIOLATIONS');
		AllFinaled = false;
		if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
			fixVIOLATIONS = loadASITable('VIOLATIONS');
			iRows = fixVIOLATIONS.length;
			iFins = 0;
			removeASITable('VIOLATIONS');
		}

		if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
			for(i in fixVIOLATIONS) {
				eachrow = fixVIOLATIONS[i];
				{
					if (matches(eachrow['Status'],'Final')) {
					iFins=iFins+1;
					}
				}
					if (matches(eachrow['Status'],'Open')) {
					fixVIOLATIONS[i]['Status'] ='Court';
					}
			}
		}

		if (crtVIOLATIONS && crtVIOLATIONS.length > 0) {
		addASITable('VIOLATIONS',fixVIOLATIONS);
		}
	}
	catch(err)
	{
		logDebug("A JavaScript Error occurred: HHC_VIOLATIONS_LOOP_COURT:  " + err.message);
		logDebug(err.stack);
	}
}

function httpClientPut(url, jsonString, contentType, encoding) {
try{
    //content type and encoding are optional; if not sent default values
    contentType = (typeof contentType != 'undefined') ? contentType : "application/json";
    encoding = (typeof encoding != 'undefined') ? encoding : "utf-8";

    //build the http client, request content, and post method from the apache classes
    var httpClientClass = org.apache.commons.httpclient;
    var httpMethodParamsClass = org.apache.commons.params.HttpMethodParams;
    var httpClient = new httpClientClass.HttpClient();
    var putMethod = new httpClientClass.methods.PutMethod(url);

    httpClient.getParams().setParameter(httpMethodParamsClass.RETRY_HANDLER, new httpClientClass.DefaultHttpMethodRetryHandler());
    //httpClient.getParams().setParameter("username", "chemware");
    //httpClient.getParams().setParameter("password", "sixforks2019");
    putMethod.addRequestHeader("token", "sljk3086u20jajhi7a92io346a54a4u3iu5"); 
    putMethod.addRequestHeader("Content-Type", contentType);
    putMethod.addRequestHeader("Content-Length", jsonString.length);

    var requestEntity = new httpClientClass.methods.StringRequestEntity(jsonString, contentType, encoding);
    putMethod.setRequestEntity(requestEntity);

    //set variables to catch and logic on response success and error type. build a result object for the data returned
    var resp_success = true;
    var resp_errorType = null;

    var resultObj = {
        resultCode: 999,
        result: null
    };

    try {
        resultObj.resultCode = httpClient.executeMethod(putMethod);
        resultObj.result = putMethod.getResponseBodyAsString();
    } finally {
        putMethod.releaseConnection();
    }

    //if any response other than transaction success, set success to false and catch the error type string
    if (resultObj.resultCode.toString().substr(0, 1) !== '2') {
        resp_success = false;
        resp_errorType = httpStatusCodeMessage(resultObj.resultCode);
    }
	logDebug("resp_errorType: " + resp_errorType);
    //create script result object with status flag, error type, error message, and output and return
    var scriptResult = new com.accela.aa.emse.dom.ScriptResult(resp_success, resp_errorType, resultObj.result, resultObj);

    return scriptResult;
}catch (err){
	logDebug("A JavaScript Error occurred: httpClientPut " + err.message);
	logDebug(err.stack);
}}

function httpStatusCodeMessage(statusCode) {
try{
    switch (statusCode) {
        case 100: return "100 - Continue";
        case 101:  return "101 - Switching Protocols";
        case 200:  return "200 - OK, Tranmission Accepted";
        case 201:  return "201 - Created";
        case 202:  return "202 - Accepted";
        case 203:  return "203 - Non-Authoritative Information";
        case 204:  return "204 - No Content";
        case 205:  return "205 - Reset Content";
        case 206:  return "206 - Partial Content";
        case 300:  return "300 - Multiple Choices";
        case 301:  return "301 - Moved Permanently";
        case 302:  return "302 - Found";
        case 303:  return "303 - See Other";
        case 304:  return "304 - Not Modified";
        case 305:  return "305 - Use Proxy";
        case 306:  return "306 - (Unused)";
        case 307:  return "307 - Temporary Redirect";
        case 400:  return "400 - Bad Request";
        case 401:  return "401 - Unauthorized";
        case 402:  return "402 - Payment Required";
        case 403:  return "403 - Forbidden";
        case 404:  return "404 - Not Found";
        case 405:  return "405 - Method Not Allowed";
        case 406:  return "406 - Not Acceptable";
        case 407:  return "407 - Proxy Authentication Required";
        case 408:  return "408 - Request Timeout";
        case 409:  return "409 - Conflict";
        case 410:  return "410 - Gone";
        case 411:  return "411 - Length Required";
        case 412:  return "412 - Precondition Failed";
        case 413:  return "413 - Request Entity Too Large";
        case 414:  return "414 - Request-URI Too Long";
        case 415:  return "415 - Unsupported Media Type";
        case 416:  return "416 - Requested Range Not Satisfiable";
        case 417:  return "417 - Expectation Failed";
        case 500:  return "500 - Internal Server Error";
        case 501:  return "501 - Not Implemented";
        case 502:  return "502 - Bad Gateway";
        case 503:  return "503 - Service Unavailable";
        case 504:  return "504 - Gateway Timeout";
        case 505:  return "505 - HTTP Version Not Supported";
    }
    return statusCode + " - Unknown Status Code";
}catch (err){
	logDebug("A JavaScript Error occurred: httpStatusCodeMessage " + err.message);
	logDebug(err.stack);
	aa.sendMail(sysFromEmail, debugEmail, "", "A JavaScript Error occurred: httpStatusCodeMessage: " + startDate, "capId: " + capId + br + err.message + br + err.stack + br + currEnv);
}}

//INCLUDES_SEP_CUSTOM START
function sepGetReqdDocs() {
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
			if(sepScriptConfig.getSuccess()){
				var sepScriptConfigArr = sepScriptConfig.getOutput();
			}
		}
		if(sepScriptConfigArr.length>0){
			var retArray = [];
			if(publicUser){
				var submittedDocList = aa.document.getDocumentListByEntity(capId,"TMP_CAP").getOutput().toArray();
			}else{
				var vEventName = aa.env.getValue("EventName");
				if(vEventName.indexOf("Before")>-1){
					var submittedDocList = aa.env.getValue("DocumentModelList");
					if(submittedDocList.length>0){
						for (var counter = 0; counter < submittedDocList.size(); counter++) {
							var doc = submittedDocList.get(counter);
							logDebug("category: " + doc.getDocCategory()) ;
						}
					}	
				}else{
					var submittedDocList = aa.document.getDocumentListByEntity(capId,"CAP").getOutput().toArray();
				}
			}
			uploadedDocs = new Array();
			if(vEventName.indexOf("Before")>-1){
				if(submittedDocList.length>0){
					for (var counter = 0; counter < submittedDocList.size(); counter++) {
						var doc = submittedDocList.get(counter);
						//logDebug("category: " + doc.getDocCategory()) ;
						uploadedDocs[doc.getDocGroup() +"-"+ doc.getDocCategory()] = true;
					}
				}
			}else{
				for (var i in submittedDocList ){
					//logDebug("submittedDocList[i].getDocGroup() : " + submittedDocList[i].getDocGroup());
					//logDebug("submittedDocList[i].getDocCategory() : " + submittedDocList[i].getDocCategory());
					uploadedDocs[submittedDocList[i].getDocGroup() +"-"+ submittedDocList[i].getDocCategory()] = true;
				}
			}
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				if(vEventName.indexOf("Workflow")>-1){
					var sepReqdDocs = loadASITable("REQD DOCUMENTS - WORKFLOW",cfgCapId);
				}else{
					var sepReqdDocs = loadASITable("REQD DOCUMENTS - APP SUBMITTAL",cfgCapId);
				}
				for(row in sepReqdDocs){
					if(sepReqdDocs[row]["Active"]=="Yes"){
						var appMatch = true;
						var recdType = sepReqdDocs[row]["Record Type"];
						var recdTypeArr = "" + recdType
						var arrAppType = recdTypeArr.split("/");
						if (arrAppType.length != 4){
							logDebug("The record type is incorrectly formatted: " + recdType);
						}else{
							if(vEventName.indexOf("Before")>-1){
								var aTypeLevel=[];
								aTypeLevel[0] = aa.env.getValue("ApplicationTypeLevel1");
								aTypeLevel[1] = aa.env.getValue("ApplicationTypeLevel2");
								aTypeLevel[2] = aa.env.getValue("ApplicationTypeLevel3");
								aTypeLevel[3] = aa.env.getValue("ApplicationTypeLevel4");
								for (xx in arrAppType){
									if (!arrAppType[xx].equals(aTypeLevel[xx]) && !arrAppType[xx].equals("*")){
										appMatch = false;
									}
								}
							}else{
								for (xx in arrAppType){
									if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
										appMatch = false;
									}
								}
							}
						}
						if (appMatch){
							var wkFlMatch = false;
							if(vEventName.indexOf("Workflow")<0){
								wkFlMatch = true;
							}else{
								var tName = ""+sepReqdDocs[row]["Task Name"];
								var taskName = tName.trim();
								var tStatus = ""+sepReqdDocs[row]["Task Status"];
								var taskStatus = tStatus.trim();
								if((matches(taskName,null,"","undefined") || wfTask==taskName) && wfStatus == taskStatus){
									wkFlMatch = true;
								}
							}
							if(wkFlMatch){
								var cFld = ""+sepReqdDocs[row]["Custom Field Name"];
								var custFld = cFld.trim();
								var cVal = ""+sepReqdDocs[row]["Custom Field Value"];
								var custVal = cVal.trim();
								var addtlQuery = sepReqdDocs[row]["Additional Query"];
								var dGroup = ""+sepReqdDocs[row]["Document Group"];
								var docGroup = dGroup.trim();
								var dType = ""+sepReqdDocs[row]["Document Type"];
								var docType = dType.trim();
								if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
									var chkFilter = ""+addtlQuery;
									if (chkFilter.length==0 || eval(chkFilter) ) {
										//doc is required, see if it's been uploaded
										if(uploadedDocs[docGroup +"-"+ docType] == undefined) {	
											var thisArray = [];
											thisArray["docGroup"]=docGroup;
											thisArray["docType"]=docType;
											retArray.push(thisArray);
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	if(retArray.length>0){
		return retArray;
	}else{
		return false;
	}
}catch(err){
	logDebug("An error occurred in sepGetReqdDocs: " + err.message);
	logDebug(err.stack);
}}

function sepEmailNotifContactWkfl(recdType, contactType, respectPriChannel, notName, rName, taskName, taskStatus, sysFromEmail, addtlQuery) {
try{
	if((matches(taskName,null,"","undefined") || wfTask==""+taskName) && wfStatus == ""+taskStatus){
		var appMatch = true;
		var recdTypeArr = "" + recdType
		var arrAppType = recdTypeArr.split("/");
		if (arrAppType.length != 4){
			logDebug("The record type is incorrectly formatted: " + recdType);
			return false;
		}else{
			for (xx in arrAppType){
				if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
					appMatch = false;
				}
			}
		}
		if (appMatch){
			var chkFilter = ""+addtlQuery;
			if (chkFilter.length==0 ||eval(chkFilter) ) {
				var cntType = ""+contactType;
				logDebug("cntType: " + cntType);
				if(cntType.indexOf(",")>-1){
					var arrType = cntType.split(",");
					for(con in arrType){
						var priContact = getContactObj(capId,arrType[con]);
						sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
					}
				}else{
					if(cntType.toUpperCase()=="ALL"){
						var arrType = getContactObjs(capId);
						for(con in arrType){
							var priContact = getContactObj(capId,arrType[con]);
							sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
						}
					}else{
						var priContact = getContactObj(capId,cntType);
						sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
					}						
				}						
			}
		}
	}
}catch(err){
	logDebug("An error occurred in sepEmailNotifContactWkfl: " + err.message);
	logDebug(err.stack);
}}

function sepEmailNotifContactAppSub(recdType, contactType, respectPriChannel, notName, rName, sysFromEmail, addtlQuery) {
try{
	var appMatch = true;
	var recdTypeArr = "" + recdType
	var arrAppType = recdTypeArr.split("/");
	if (arrAppType.length != 4){
		logDebug("The record type is incorrectly formatted: " + recdType);
		return false;
	}else{
		for (xx in arrAppType){
			if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
				appMatch = false;
			}
		}
	}
	if (appMatch){
		var chkFilter = ""+addtlQuery;
		if (chkFilter.length==0 ||eval(chkFilter) ) {
			var cntType = ""+contactType;
			if(cntType.indexOf(",")>-1){
				var arrType = cntType.split(",");
				for(con in arrType){
					var priContact = getContactObj(capId,arrType[con]);
					sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
				}
			}else{
				if(cntType.toUpperCase()=="ALL"){
					var arrType = getContactObjs(capId);
					for(con in arrType){
						var priContact = getContactObj(capId,arrType[con]);
						sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
					}
				}else{
					var priContact = getContactObj(capId,cntType);
					sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
				}						
			}						
		}
	}
}catch(err){
	logDebug("An error occurred in sepEmailNotifContactAppSub: " + err.message);
	logDebug(err.stack);
}}

function sepSchedInspectionAppSub(recdType, insGroup, insType, pendSched, asiField, asiValue, daysAhead, calWkgDay, inspName, addtlQuery) {
try{
	var appMatch = true;
	var recdTypeArr = "" + recdType
	var arrAppType = recdTypeArr.split("/");
	if (arrAppType.length != 4){
		logDebug("The record type is incorrectly formatted: " + recdType);
		return false;
	}else{
		for (xx in arrAppType){
			if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
				appMatch = false;
			}
		}
	}
	if (appMatch){
		var chkFilter = ""+addtlQuery;
		if (chkFilter.length==0 ||eval(chkFilter) ) {
			var cFld = ""+asiField;
			var custFld = cFld.trim();
			var cVal = ""+asiValue;
			var custVal = cVal.trim();
			if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
				var pendOrSched = ""+pendSched;
				if(pendOrSched.toUpperCase()=="PENDING"){
					createPendingInspection(insGroup,insType);
				}else{
					if(calWkgDay=="Working"){
						var dtSched = dateAdd(sysDate,daysAhead,true);
					}else{
						var dtSched = dateAdd(sysDate,daysAhead);
					}
					scheduleInspectDate(insType,dtSched);
					if(!matches(inspName,"",null,"undefined")){
						var inspId = getScheduledInspId(insType);
						inspName = ""+inspName;
						if(inspName.toUpperCase()=="AUTO"){
							autoAssignInspection(inspId);
						}else{
							assignInspection(inspId, inspName);
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("An error occurred in sepSchedInspectionAppSub: " + err.message);
	logDebug(err.stack);
}}

function sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail){
try{
	if(priContact){
		var priChannel =  lookup("CONTACT_PREFERRED_CHANNEL",""+ priContact.capContact.getPreferredChannel());
		if(!matches(priChannel, "",null,"undefined", false)){
			if(!respectPriChannel || priChannel.indexOf("Email") > -1 || priChannel.indexOf("E-mail") > -1){
				sepSendNotification(sysFromEmail,priContact,notName,rName);
			}else{
				if(respectPriChannel && priChannel.indexOf("Postal") > -1){
					var addrString = "";
					var contAddr = priContact.addresses;
					for(ad in contAddr){
						var thisAddr = contAddr[ad];
						for (a in thisAddr){
							if(!matches(thisAddr[a], "undefined", "", null)){
								if(!matches(thisAddr[a].addressType, "undefined", "", null)){
									addrString += thisAddr[a].addressLine1 + br + thisAddr[a].city + ", " + thisAddr[a].state +  " " + thisAddr[a].zip + br;
								}
							}
						}
					}
					if(addrString==""){
						addrString = "No addresses found.";
					}
					if(!matches(rptName, null, "", "undefined")){
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the report " + rptName + " to : " + br + addrString + "</font>");
					}else{
						showMessage=true;
						comment("<font color='blue'>The " + contactType + " contact, " + priContact.capContact.getFirstName() + " " + priContact.capContact.getLastName() + ", has requested all correspondence be mailed.  Please mail the notification " + notName + " to : " + br + addrString + "</font>");
					}
				}
			}
		}else{
			logDebug("No primary channel found.  Defaulting to emailing the notification.");
			sepSendNotification(sysFromEmail,priContact,notName,rName);
		}
	}else{
		logDebug("An error occurred retrieving the contactObj for " + contactType + ": " + priContact);
	}
}catch(err){
	logDebug("An error occurred in sepProcessContactsForNotif: " + err.message);
	logDebug(err.stack);
}}

function sepSendNotification(emailFrom,priContact,notName,rName){
try{
	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var emailRpt = false;
	var eParams = aa.util.newHashtable(); 
	addParameter(eParams, "$$fileDateYYYYMMDD$$", fileDateYYYYMMDD);
	var contPhone = priContact.capContact.phone1;
	if(contPhone){
		var fmtPhone = contPhone.substr(0,3) + "-" + contPhone.substr(3,3) +"-" + contPhone.substr(6,4);
	}else{
		var fmtPhone = "";
	}
	addParameter(eParams, "$$altID$$", capId.getCustomID());
	addParameter(eParams, "$$contactPhone1$$", fmtPhone);
	addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
	addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
	addParameter(eParams, "$$contactEmail$$", priContact.capContact.email);
	addParameter(eParams, "$$status$$", capStatus);
	addParameter(eParams, "$$capType$$", cap.getCapType().getAlias());
	var priEmail = ""+priContact.capContact.getEmail();
	//var capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
	var rFiles = [];
	var rptName = ""+rName;
	if(!matches(rptName, null, "", "undefined")){
		var report = aa.reportManager.getReportInfoModelByName(rName);
		if(report.getSuccess() && report!=null ){
			report = report.getOutput();
			report.setModule(appTypeArray[0]);
			report.setCapId(capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3());
			var rParams = aa.util.newHashMap(); 
			rParams.put("altId",capId.getCustomID());
			report.setReportParameters(rParams);
			report.getEDMSEntityIdModel().setAltId(capId.getCustomID());
			var permit = aa.reportManager.hasPermission(rName,currentUserID);
			if (permit.getOutput().booleanValue()) {
				var reportResult = aa.reportManager.getReportResult(report);
				if(reportResult) {
					reportOutput = reportResult.getOutput();
					var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
					reportFile=reportFile.getOutput();
					rFiles.push(reportFile);
					emailRpt = true;
				}else {
					logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
				}
			} else {
				logDebug("You have no permission.");
			}	
		}else{
			logDebug("An error occurred retrieving the report: "+ report.getErrorMessage());
		}
	}
	if(!emailRpt){
		logDebug("here");
		rFiles = [];
	}
	var result = null;
	logDebug("rName: " +rName);
	logDebug("priEmail: " +priEmail);
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, priEmail, null, notName, eParams, capIDScriptModel, rFiles);
	if(result.getSuccess()){
		logDebug("Sent email successfully!");
		return true;
	}else{
		logDebug("Failed to send mail - " + result.getErrorMessage());
		return false;
	}
}catch(err){
	logDebug("An error occurred in sepSendNotification: " + err.message);
	logDebug(err.stack);
}}

function sepUpdateFeesWkfl(sepRules) {
try{
	for(row in sepRules){
		if(sepRules[row]["Active"]=="Yes"){
			var taskName = ""+sepRules[row]["Task Name"];
			var taskStatus = ""+sepRules[row]["Task Status"];
			if(!matches(taskName,"",null,"undefined" || wfTask==taskName) && wfStatus==taskStatus){
				var appMatch = true;
				var recdType = ""+sepRules[row]["Record Type"];
				var recdTypeArr = "" + recdType;
				var arrAppType = recdTypeArr.split("/");
				if (arrAppType.length != 4){
					logDebug("The record type is incorrectly formatted: " + recdType);
					return false;
				}else{
					for (xx in arrAppType){
						if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
							appMatch = false;
						}
					}
				}
				if (appMatch){
					var addtlQuery = ""+sepRules[row]["Additional Query"];
					var chkFilter = ""+addtlQuery;
					if (chkFilter.length==0 ||eval(chkFilter) ) {
						var cFld = ""+sepRules[row]["Custom Field Name"];
						var custFld = cFld.trim();
						var cVal = ""+sepRules[row]["Custom Field Value"];
						var custVal = cVal.trim();
						if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
							var fcode = ""+sepRules[row]["Fee Code"];
							var fsched = ""+sepRules[row]["Fee Schedule"];
							var fperiod = ""+sepRules[row]["Fee Period"];
							var feeQty = ""+sepRules[row]["Fee Quantity"];
							if(isNaN(feeQty)){
								if(feeQty.indexOf("AInfo")<0 && feeQty.indexOf("estValue")<0  ){
									var fqty = parseFloat([feeQty]);
								}else{
									var fqty = eval(feeQty);
									if(isNaN(fqty)){
										logDebug("Fee Quantity does not resolve to a number. Setting fee quantity to 1.");
										fqty = 1;
									}
								}
							}else{
								var fqty = parseFloat(feeQty);
							}
							var finvoice = ""+sepRules[row]["Auto Invoice"];
							if(finvoice=="Yes") finvoice = "Y";
							var pDuplicate = ""+sepRules[row]["Duplicate Fee"];
							if(pDuplicate=="Yes") pDuplicate = "Y";
							// If optional argument is blank, use default logic (i.e. allow duplicate fee if invoiced fee is found)
							if (pDuplicate == null || pDuplicate.length == 0){
								pDuplicate = "Y";
							}else{
								pDuplicate = pDuplicate.toUpperCase();
							}
							var invFeeFound = false;
							var adjustedQty = parseFloat(fqty);
							var feeSeq = null;
							feeUpdated = false;
							getFeeResult = aa.finance.getFeeItemByFeeCode(capId, fcode, fperiod);
							if (getFeeResult.getSuccess()) {
								var feeList = getFeeResult.getOutput();
								for (feeNum in feeList) {
									if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
										if (pDuplicate == "Y") {
											logDebug("Invoiced fee " + fcode + " found, subtracting invoiced amount from update qty.");
											adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
											invFeeFound = true;
										} else {
											invFeeFound = true;
											logDebug("Invoiced fee " + fcode + " found.  Not updating this fee. Not assessing new fee " + fcode);
										}
									}
									if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
										adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
									}
								}
								for (feeNum in feeList)
									if (feeList[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated) // update this fee item
									{
										var feeSeq = feeList[feeNum].getFeeSeqNbr();
										var editResult = aa.finance.editFeeItemUnit(capId, adjustedQty + feeList[feeNum].getFeeUnit(), feeSeq);
										feeUpdated = true;
										if (editResult.getSuccess()) {
											logDebug("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);
											if (finvoice == "Y") {
												feeSeqList.push(feeSeq);
												paymentPeriodList.push(fperiod);
											}
										} else {
											logDebug("**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage());
											break
										}
									}
							} else {
								logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
							}
							// Add fee if no fee has been updated OR invoiced fee already exists and duplicates are allowed
							if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == "Y")){
								feeSeq = addFee(fcode, fsched, fperiod, adjustedQty, finvoice);
							}else{
								feeSeq = null;
							}
							updateFeeItemInvoiceFlag(feeSeq, finvoice);
							return feeSeq;
						}
					}
				}
			}
		}
	}
}catch (err){
	logDebug("An error occurred in sepUpdateFeesWkfl: " + err.message);
	logDebug(err.stack);
}}

function sepUpdateFeesAppSub(sepRules) {
try{
	for(row in sepRules){
		if(sepRules[row]["Active"]=="Yes"){
			var appMatch = true;
			var recdType = ""+sepRules[row]["Record Type"];
			var recdTypeArr = "" + recdType;
			var arrAppType = recdTypeArr.split("/");
			if (arrAppType.length != 4){
				logDebug("The record type is incorrectly formatted: " + recdType);
				return false;
			}else{
				for (xx in arrAppType){
					if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
						appMatch = false;
					}
				}
			}
			if (appMatch){
				var addtlQuery = ""+sepRules[row]["Additional Query"];
				var chkFilter = ""+addtlQuery;
				if (chkFilter.length==0 ||eval(chkFilter) ) {
					var cFld = ""+sepRules[row]["Custom Field Name"];
					var custFld = cFld.trim();
					var cVal = ""+sepRules[row]["Custom Field Value"];
					var custVal = cVal.trim();
					if(matches(custFld,"",null,"undefined") || custVal==AInfo[custFld]){
						var fcode = ""+sepRules[row]["Fee Code"];
						var fsched = ""+sepRules[row]["Fee Schedule"];
						var fperiod = ""+sepRules[row]["Fee Period"];
						var feeQty = ""+sepRules[row]["Fee Quantity"];
						if(isNaN(feeQty)){
							if(feeQty.indexOf("AInfo")<0 && feeQty.indexOf("estValue")<0  ){
								var fqty = parseFloat([feeQty]);
							}else{
								var fqty = eval(feeQty);
								logDebug("fqty: " + fqty);
								if(isNaN(fqty)){
									logDebug("Fee Quantity does not resolve to a number. Setting fee quantity to 1.");
									fqty = 1;
								}
							}
						}else{
							var fqty = parseFloat(feeQty);
						}
						var finvoice = ""+sepRules[row]["Auto Invoice"];
						if(finvoice=="Yes") finvoice = "Y";
						var pDuplicate = ""+sepRules[row]["Duplicate Fee"];
							var pDuplicate = ""+sepRules[row]["Duplicate Fee"];
							if(pDuplicate=="Yes") pDuplicate = "Y";
							// If optional argument is blank, use default logic (i.e. allow duplicate fee if invoiced fee is found)
							if (pDuplicate == null || pDuplicate.length == 0){
								pDuplicate = "Y";
							}else{
								pDuplicate = pDuplicate.toUpperCase();
							}
							var invFeeFound = false;
							var adjustedQty = parseFloat(fqty);
							var feeSeq = null;
							feeUpdated = false;
							getFeeResult = aa.finance.getFeeItemByFeeCode(capId, fcode, fperiod);
							if (getFeeResult.getSuccess()) {
								var feeList = getFeeResult.getOutput();
								for (feeNum in feeList) {
									if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
										if (pDuplicate == "Y") {
											logDebug("Invoiced fee " + fcode + " found, subtracting invoiced amount from update qty.");
											adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
											invFeeFound = true;
										} else {
											invFeeFound = true;
											logDebug("Invoiced fee " + fcode + " found.  Not updating this fee. Not assessing new fee " + fcode);
										}
									}
									if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
										adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
									}
								}
								for (feeNum in feeList)
									if (feeList[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated) // update this fee item
									{
										var feeSeq = feeList[feeNum].getFeeSeqNbr();
										var editResult = aa.finance.editFeeItemUnit(capId, adjustedQty + feeList[feeNum].getFeeUnit(), feeSeq);
										feeUpdated = true;
										if (editResult.getSuccess()) {
											logDebug("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);
											if (finvoice == "Y") {
												feeSeqList.push(feeSeq);
												paymentPeriodList.push(fperiod);
											}
										} else {
											logDebug("**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage());
											break
										}
									}
							} else {
								logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
							}
							// Add fee if no fee has been updated OR invoiced fee already exists and duplicates are allowed
							if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == "Y")){
								feeSeq = addFee(fcode, fsched, fperiod, adjustedQty, finvoice);
							}else{
								feeSeq = null;
							}
							updateFeeItemInvoiceFlag(feeSeq, finvoice);
							return feeSeq;
					}
				}
			}
		}
	}
}catch (err){
	logDebug("An error occurred in sepUpdateFeesAppSub: " + err.message);
	logDebug(err.stack);
}}

function sepStopWorkflow(){
//stop workflow progress based on parameters
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
			if(sepScriptConfig.getSuccess()){
				var sepScriptConfigArr = sepScriptConfig.getOutput();
			}
		}
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepRules = loadASITable("PREVENT WORKFLOW UPDATE",cfgCapId);
				if(sepRules.length>0){
					for(row in sepRules){
						if(sepRules[row]["Active"]=="Yes"){
							var taskName = ""+sepRules[row]["Task Name"];
							var taskStatus = ""+sepRules[row]["Task Status"];
							if(!matches(taskName,"",null,"undefined" || wfTask==taskName) && wfStatus==taskStatus){
								var appMatch = true;
								var recdType = ""+sepRules[row]["Record Type"];
								var recdTypeArr = "" + recdType;
								var arrAppType = recdTypeArr.split("/");
								if (arrAppType.length != 4){
									logDebug("The record type is incorrectly formatted: " + recdType);
									return false;
								}else{
									for (xx in arrAppType){
										if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
											appMatch = false;
										}
									}
								}
								if (appMatch){
									var addtlQuery = ""+sepRules[row]["Additional Query"];
									var chkFilter = ""+addtlQuery;
									if (chkFilter.length==0 ||eval(chkFilter) ) {
										switch("" + sepRules[row]["Event"]){
										case "Fees Due": 
											var strFee = ""+ sepRules[row]["Required Elements List"];
											var feeBal = 0;
											var feesDue = [];
											if(strFee.length>0){
												var arrFee = strFee.split("|");
												for (fee in arrFee){
													feeBal += sepFeeBalance(arrFee[fee]);
													if(sepFeeBalance(arrFee[fee])>0){
														feesDue.push(arrFee[fee]);
													}
												}
											}else{
												feeBal = sepFeeBalance();
											}
											if(feeBal>0){
												cancel=true;
												showMessage=true;
												comment( "'"+ taskName + "' cannot be set to '" + taskStatus + "' when there is an outstanding balance ($" + feeBal.toFixed(2) + ") of these fees: " );
												if(feesDue.length==0){
													comment("--All Fees--");
												}else{
													for( x in feesDue){
														comment(feesDue[x]);
													}
												}
											}
											break;
										case "Inspections Scheduled":
											var inspScheduled = false;
											var strInsp = ""+sepRules[row]["Required Elements List"];
											var inspDue = [];
											if(strInsp.length>0){
												var arrInsp = strInsp.split("|");
												for (ins in arrInsp){
													if(checkInspectionResult(arrInsp[ins], "Scheduled") || checkInspectionResult(arrInsp[ins], "Pending")){
														inspScheduled = true;
														inspDue.push(arrInsp[ins]);
													}
												}
											}else{
												if(isScheduled(false)){
													inspScheduled = true;
												}
											}
											if(inspScheduled){
												cancel=true;
												showMessage=true;
												comment( "'"+ taskName + "' cannot be set to '" + taskStatus + "' when these inspections are scheduled or pending: " );
												if(inspDue.length==0){
													comment("--All Inspections--");
												}else{
													for( x in inspDue){
														comment(inspDue[x]);
													}
												}
											}
											break;
										case "Documents Required":
											var submittedDocList = aa.document.getDocumentListByEntity(capId,"CAP").getOutput().toArray();
											uploadedDocs = new Array();
											for (var i in submittedDocList ){
												uploadedDocs[submittedDocList[i].getDocGroup() +"-"+ submittedDocList[i].getDocCategory()] = true;
											}
											var strDoc =  ""+ sepRules[row]["Required Elements List"];
											var arrDoc = strDoc.split("|");
											var retArray = [];
											for (doc in arrDoc){
												if(arrDoc[doc].indexOf(",")<0){
													logDebug("Document List is incorrectly formatted: " + strDoc);
													return false;
												}
												var thisDoc = arrDoc[doc].split(",");
												var docGroup = thisDoc[0];
												var docType = thisDoc[1];
												if(uploadedDocs[docGroup +"-"+ docType] == undefined) {	
													var thisArray = [];
													thisArray["docGroup"]=docGroup;
													thisArray["docType"]=docType;
													retArray.push(thisArray);
												}
											}
											if(retArray.length>0){
												cancel=true;
												showMessage=true;
												comment("'"+ taskName + "' cannot be set to '" + taskStatus + "' when these documents are required: ");
												for( x in retArray){
													comment(retArray[x]["docGroup"] + " - " + retArray[x]["docType"]);
												}
											}
											break;
										case "Child Records Status":
											var canProceed = false;
											var strChildInfo = ""+ sepRules[row]["Required Elements List"];
											var arrChildRecs = [];
											if(strChildInfo.length>0){
												var arrChildRecs = strChildInfo.split("|");
												for (ch in arrChildRecs){
													arrThisChild = arrChildRecs[ch].split(",");
													var arrChildren = getChildren(arrThisChild[0]);
													var status2Chk = ""+arrThisChild[1];
													if(status2Chk.toUpperCase()=="ANY"){
														canProceed =- true;
													}else{
														var badStatus=false;
														for(st in arrChildren){
															var chCap = aa.cap.getCap(arrChildren[st]).getOutput();
															if(chCap.getCapStatus().toUpperCase()!=status2Chk.toUpperCase()){
																badStatus=true;
															}
														}
														if(badStatus){
															canProceed=false;
														}
													}		
												}
											}else{
												canProceed=false;
											}
											if(!canProceed){
												cancel=true;
												showMessage=true;
												comment( "'"+ taskName + "' cannot be set to '" + taskStatus + "' when either there is no child record of the type " );
												if(feesDue.length==0){
													comment("--All Fees--");
												}else{
													for( x in feesDue){
														comment(feesDue[x]);
													}
												}
											}
											break;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: sepStopWorkflow: " + err.message);
	logDebug(err.stack)
}}

function sepFeeBalance(feestr){
try{
	// Searches payment fee items and returns the unpaid balance of a fee item
	// Sums fee items if more than one exists.  
	var amtFee = 0;
	var amtPaid = 0;
	var feeResult=aa.fee.getFeeItems(capId);
	if (feeResult.getSuccess()){ 
		var feeObjArr = feeResult.getOutput(); 
	}else{ 
		logDebug( "**ERROR: getting fee items: " + capContResult.getErrorMessage()); 
		return false 
	}
	for (ff in feeObjArr){
		if ((!feestr || feestr.equals(feeObjArr[ff].getFeeCod()))){
			amtFee+=feeObjArr[ff].getFee();
			var pfResult = aa.finance.getPaymentFeeItems(capId, null);
			if (pfResult.getSuccess()){
				var pfObj = pfResult.getOutput();
				for (ij in pfObj){
					if (feeObjArr[ff].getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr()){
						amtPaid+=pfObj[ij].getFeeAllocation();
					}
				}
			}
		}
	}
	return amtFee - amtPaid;
}catch(err){
	logDebug("A JavaScript Error occurred: sepFeeBalance: " + err.message);
	logDebug(err.stack)
}}

function sepIssueLicenseWorkflow(){
try{
	//see if any records are set up--module can be specific or "ALL", look for both
	var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", appTypeArray[0]);
	if(sepScriptConfig.getSuccess()){
		var sepScriptConfigArr = sepScriptConfig.getOutput();
		if(sepScriptConfigArr.length<1){
			var sepScriptConfig = aa.cap.getCapIDsByAppSpecificInfoField("Module Name", "ALL");
			if(sepScriptConfig.getSuccess()){
				var sepScriptConfigArr = sepScriptConfig.getOutput();
			}
		}
		if(sepScriptConfigArr.length>0){
			for(sep in sepScriptConfigArr){
				var cfgCapId = sepScriptConfigArr[sep].getCapID();
				var sepRules = loadASITable("LICENSE ISSUANCE - ON WORKFLOW",cfgCapId);
				if(sepRules.length>0){
					for(row in sepRules){
						if(sepRules[row]["Active"]=="Yes"){
							var taskName = ""+sepRules[row]["Task Name"];
							var taskStatus = ""+sepRules[row]["Task Status"];
							if(!matches(taskName,"",null,"undefined" || wfTask==taskName) && wfStatus==taskStatus){
								var appMatch = true;
								var recdType = ""+sepRules[row]["Record Type"];
								var recdTypeArr = "" + recdType;
								var arrAppType = recdTypeArr.split("/");
								if (arrAppType.length != 4){
									logDebug("The record type is incorrectly formatted: " + recdType);
									return false;
								}else{
									for (xx in arrAppType){
										if (!arrAppType[xx].equals(appTypeArray[xx]) && !arrAppType[xx].equals("*")){
											appMatch = false;
										}
									}
								}
								if (appMatch){
									var addtlQuery = ""+sepRules[row]["Additional Query"];
									var chkFilter = ""+addtlQuery;
									if (chkFilter.length==0 ||eval(chkFilter) ) {
									logDebug("eval(chkFilter): " + eval(chkFilter));
										if(!matches(sepRules[row]["Parent Record Type"], "",null,"undefined")){
											var arrParRec = ""+sepRules[row]["Parent Record Type"];
											var arrParRec = arrParRec.split("/");
											if(arrParRec.length!=4){
												logDebug("Parent ID not correctly formatted: " + sepRules[row]["Parent Record Type"]);
												return false;
											}else{
												var parCapId = false;
												var appCreateResult = aa.cap.createApp(arrParRec[0], arrParRec[1], arrParRec[2], arrParRec[3],capName);
												logDebug("creating cap " +arrParRec);
												if (appCreateResult.getSuccess()){
													var newId = appCreateResult.getOutput();
													logDebug("cap " + arrParRec + " created successfully ");
													// create Detail Record
													capModel = aa.cap.newCapScriptModel().getOutput();
													capDetailModel = capModel.getCapModel().getCapDetailModel();
													capDetailModel.setCapID(newId);
													aa.cap.createCapDetail(capDetailModel);
													var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
													var result = aa.cap.createAppHierarchy(newId, capId); 
													if (result.getSuccess()){
														logDebug("Parent application successfully linked");
														parCapId = newId;
													}else{
														logDebug("Could not link applications");
													}
												}else{
													logDebug( "**ERROR: adding parent App: " + appCreateResult.getErrorMessage());
												}											}
											if(parCapId){
												var newLPType = ""+sepRules[row]["Create LP Type"];
												if(!matches(newLPType, "",null,"undefined")){
													var newLPContact = getContactObj(capId,"Applicant");
													if(newLPContact){
														var lpCreated = newLPContact.createRefLicProf(null,newLPType,null,null);
													}
												}
												if(!matches(""+sepRules[row]["Expiration - Year(s)"],"",null,"undefined")){
													var expDateYear = sysDate.getYear()+parseInt(sepRules[row]["Expiration - Year(s)"]);
													var expDate = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), expDateYear, "MM/DD/YYYY");
													expDate = dateAdd(expDate,1);
												}else{
													if(!matches(""+sepRules[row]["Expiration - Month(s)"],"",null,"undefined")){
														var expDate =  dateAddMonths(sysDate,sepRules[row]["Expiration - Month(s)"]);
													}else{
														if(!matches(""+sepRules[row]["Expiration - MM/DD"],"",null,"undefined")){
															var expDate =  dateAddMonths(sysDate,sepRules[row]["Expiration - Month(s)"]);
														}else{
															logDebug("No expiration date listed. Defaulting to one year.");
															var expDateYear = sysDate.getYear()+1;
															var expDate = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), expDateYear, "MM/DD/YYYY");
														}
													}
												}
												if(matches(""+sepRules[row]["New App Status"],"",null,"undefined")){
													var newAppStatus = "Active";
												}else{
													var newAppStatus = ""+sepRules[row]["New App Status"];
												}
												var currCapId = capId;
												capId = parCapId;
												licEditExpInfo(newAppStatus, expDate);
												updateAppStatus(newAppStatus, "Updated via sepIssueLicenseWorkflow.");
												capId = currCapId;
												if(""+sepRules[row]["Copy Custom Fields/Lists"]=="ALL"){
													copyAppSpecific(parCapId);
													copyASITables(capId, parCapId);
													logDebug("Copied all ASI/T.");
												}else{
													if(!matches(""+sepRules[row]["Copy Custom Fields/Lists"],"",null,"undefined")){
														var copyList = ""+sepRules[row]["Copy Custom Fields/Lists"];
														var arrCopy = [];
														if(copyList.indexOf("|")>-1){
															arrCopy = copyList.split("|");
														}else{
															arrCopy.push(copyList);
														}
														copyAppSpecificInclude(parCapId,arrCopy);
														copyASITablesInclude(capId, parCapId,arrCopy);
													}
												}
												if(!matches(""+sepRules[row]["Copy Contacts"],"",null,"undefined")){
													var strContacts = ""+sepRules[row]["Copy Contacts"];
													if(strContacts.toUpperCase()=="ALL"){
														copyContacts(capId, parCapId);
													}else{
														if(strContacts.indexOf("|")>-1){
															var arrContacts = strContacts.split("|");
														}else{
															var arrContacts =[];
															arrContacts.push(strContacts);
														}
														for(c in arrContacts){
															copyContactsByType(capId, parCapId, arrContacts[c]);
														}
													}
												}
												if(""+sepRules[row]["Copy Examination"]=="Yes"){
													aa.examination.copyExaminationList(capId, parCapId);
												}
												if(""+sepRules[row]["Copy Education"]=="Yes"){
													aa.education.copyEducationList(capId, parCapId);
												}
												if(""+sepRules[row]["Copy Continuing Education"]=="Yes"){
													aa.continuingEducation.copyContEducationList(capId, parCapId);
												}
												var notName = "" + sepRules[row]["Notification Name"];
												if(!matches(notName, "","undefined",null)){
													var cntType = ""+sepRules[row]["Contacts Receiving Notice"];
													if(cntType.indexOf(",")>-1){
														var arrType = cntType.split(",");
														for(con in arrType){
															var priContact = getContactObj(capId,arrType[con]);
															sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
														}
													}else{
														if(cntType.toUpperCase()=="ALL"){
															var arrType = getContactObjs(capId);
															for(con in arrType){
																var priContact = getContactObj(capId,arrType[con]);
																sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
															}
														}else{
															var priContact = getContactObj(capId,cntType);
															sepProcessContactsForNotif(priContact, notName, rName, sysFromEmail);
														}						
													}						
												}else{
													logDebug("No notification name. No email sent.");
												}
											}
										}
									}else{
										logDebug("sepIssueLicenseWorkflow: Check filter resolved to false: " + chkFilter);
									}
								}else{
									logDebug("sepIssueLicenseWorkflow: No app match: " + recdTypeArr);
								}
							}else{
								logDebug("sepIssueLicenseWorkflow: no task/status match: " + taskName + "/" + taskStatus);
							}
						}
					}
				}
			}
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: sepIssueLicenseWorkflow:  " + err.message);
	logDebug(err.stack)
}}

//copy of copyAppSpecific and copyASITables except optional param is include not ignore
function copyAppSpecificInclude(newCap) // copy all App Specific info into new Cap, 1 optional parameter for ignoreArr
{
	var includeArr = new Array();
	var limitCopy = false;
	if (arguments.length > 1) 
	{
		includeArr = arguments[1];
		limitCopy = true;
	}
	
	for (asi in AInfo){
		//Check list
		if(limitCopy){
			var ignore=true;
		  	for(var i = 0; i < includeArr.length; i++)
		  		if(includeArr[i] == asi){
		  			ignore=false;
		  			break;
		  		}
		  	if(ignore)
		  		continue;
		}
		editAppSpecific(asi,AInfo[asi],newCap);
	}
}



function copyASITablesInclude(pFromCapId, pToCapId) {
	// par3 is optional 0 based string array of table to include
	var itemCap = pFromCapId;

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
		var tai = ta.iterator();
	var tableArr = new Array();
	var includeArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		includeArr = arguments[2];
		limitCopy = true;
	}
	while (tai.hasNext()) {
		var tsm = tai.next();

		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName() + "";
		var numrows = 0;

		//Check list
		if (limitCopy) {
			var ignore = true;
			for (var i = 0; i < includeArr.length; i++)
				if (includeArr[i] == tn) {
					ignore = false;
					break;
				}
			if (ignore)
				continue;
		}
		if (!tsm.rowIndex.isEmpty()) {
			var tsmfldi = tsm.getTableField().iterator();
			var tsmcoli = tsm.getColumns().iterator();
			var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
			var numrows = 1;
			while (tsmfldi.hasNext()) // cycle through fields
			{
				if (!tsmcoli.hasNext()) // cycle through columns
				{
					var tsmcoli = tsm.getColumns().iterator();
					tempArray.push(tempObject); // end of record
					var tempObject = new Array(); // clear the temp obj
					numrows++;
				}
				var tcol = tsmcoli.next();
				var tval = tsmfldi.next();

				var readOnly = 'N';
				if (readOnlyi.hasNext()) {
					readOnly = readOnlyi.next();
				}

				var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
				tempObject[tcol.getColumnName()] = fieldInfo;
				//tempObject[tcol.getColumnName()] = tval;
			}

			tempArray.push(tempObject); // end of record
		}

		addASITable(tn, tempArray, pToCapId);
		logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	}
} 
//INCLUDES_SEP_CUSTOM END

function invoiceOneNow(feeSeq, paymentPeriod, itemCap) {

	var feeSeqList = new Array();
	feeSeqList[0] = feeSeq;

	paymentPeriodList = new Array();
	if (paymentPeriod == null) 
		paymentPeriodList[0] = "APPLICATION";
	else 
		paymentPeriodList[0] = paymentPeriod;
	var invoiceResult = aa.finance.createInvoice(itemCap, feeSeqList, paymentPeriodList);
	if (!invoiceResult.getSuccess())
		logDebug("ERROR", "Invoicing the fee items was not successful.  Reason: " +  invoiceResult.getErrorMessage());
}
function isSupervisor(userID) {
	dept = getDepartmentName(userID);
	if (dept & dept != "") {
		if (matches(dept, "WQ Supervisor A EHS", "WQ Supervisor A", "WQ Team A EHS", "WQ Team A Leader", "WQ Supervisor B EHS", "WQ Supervisor B", "WQ Supervisor C EHS", "WQ Supervisor C")) {
			return true;
		}
	}

	return false;
}


function loadASITableBeforeEvent(tname, aistModel) {
	var gm = aistModel;
	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();
	while (tai.hasNext()) {
		var tsm = tai.next();
		var tn = tsm.getTableName();

		if (!tn.equals(tname))
			continue;
		if (tsm.rowIndex.isEmpty()) {
			logDebug("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

		var tempObject = new Array();
		var tempArray = new Array();

		var tsmfldi = tsm.getTableField().iterator();
		var tsmcoli = tsm.getColumns().iterator();
		var numrows = 1;

		while (tsmfldi.hasNext()) // cycle through fields
		{
			if (!tsmcoli.hasNext()) // cycle through columns
			{
				var tsmcoli = tsm.getColumns().iterator();
				tempArray.push(tempObject); // end of record
				var tempObject = new Array(); // clear the temp obj
				numrows++;
			}
			var tcol = tsmcoli.next();
			var tval = tsmfldi.next();
			var readOnly = 'N';
			var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
			tempObject[tcol.getColumnName()] = fieldInfo;

		}
		tempArray.push(tempObject); // end of record
	}
	return tempArray;
}
function ltrim(stringToTrim) {
	return stringToTrim.replace(/^\s+/,"");
}
/*

custom function declarations go here.   One function per file

*/

function reportRunSave(reportName, view, edmsSave, storeToDisk, reportModule, reportParams) 
{
	var name = "";
	var rFile = new Array();
	var error = "";
	var reportModel = aa.reportManager.getReportModelByName(reportName); //get detail of report to drive logic
	if (reportModel.getSuccess()) 	{
		reportDetail = reportModel.getOutput();
		name = reportDetail.getReportDescription();
		if (name == null || name == "") 
		{
			name = reportDetail.getReportName();
		}
		var reportInfoModel = aa.reportManager.getReportInfoModelByName(reportName);  //get report info to change the way report runs
		if (reportInfoModel.getSuccess()) 
		{ 
			report = reportInfoModel.getOutput();
			report.setModule(reportModule); 
			report.setCapId(capId);
			report.getEDMSEntityIdModel().setAltId(capId.getCustomID());
			reportInfo = report.getReportInfoModel();
			report.setReportParameters(reportParams);
			//process parameter selection and EDMS save
			if (edmsSave == true && view == true ) 
			{
				reportRun = aa.reportManager.runReport(reportParams, reportDetail);
				showMessage = true;
				comment(reportRun.getOutput()); //attaches report
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(false);
					reportResult = aa.reportManager.getReportResult(report); //attaches report
					if (reportResult.getSuccess()) 
					{
						reportOut = reportResult.getOutput();
						reportOut.setName(changeNameofAttachment(reportOut.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportOut);
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug reportFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message.";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			} 
			else if (edmsSave == true && view == false) 
			{
				reportInfo.setNotSaveToEDMS(false);
				reportResult = aa.reportManager.getReportResult(report); //attaches report
				if (reportResult.getSuccess()) 
				{
					reportOut = reportResult.getOutput();
					reportOut.setName(changeNameofAttachment(reportOut.getName()));
					if (storeToDisk == true) 
					{
						rFile = aa.reportManager.storeReportToDisk(reportOut);
						if (rFile.getSuccess()) 
						{
							logDebug("Storing to disk");
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
					}
				} 
				else 
				{
					rFile = new Array();
					error = "Report failed to run and store to disk.  Debug reportResult for error message.";
					logDebug(error);
				}
			} 
			else if (edmsSave == false && view == true) 
			{
				reportRun = aa.reportManager.runReport(reportParams, reportDetail);
				showMessage = true;
				comment(reportRun.getOutput());
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(true);
					reportResult = aa.reportManager.getReportResult(report);
					if (reportResult.getSuccess()) 
					{
						reportResult = reportResult.getOutput();
						reportResult.setName(changeNameofAttachment(reportResult.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportResult);
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message.";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			} 
			else if (edmsSave == false && view == false) 
			{
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(true);
					reportResult = aa.reportManager.getReportResult(report);
					if (reportResult.getSuccess()) 
					{
						reportResult = reportResult.getOutput();
						reportResult.setName(changeNameofAttachment(reportResult.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportResult);
						logDebug("Report File: " + rFile.getSuccess());
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
							logDebug("Actual Report: " + rFile);
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					}
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message.";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			}
		} 
		else 
		{
			rFile = new Array();
			error = "Failed to get report information.  Check report name matches name in Report Manager.";
			logDebug(error);
		}
	} 
	else 
	{
		rFile = new Array();
		error = "Failed to get report detail.  Check report name matches name in Report Manager.";
		logDebug(error);
	}

	return rFile;
}
function scheduleInspectDateReturnInspID(iType,DateToSched) // optional inspector ID.
// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110)
// DQ - Added Optional 5th parameter inspComm
	{
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3)
		if (arguments[2] != null)
			{
			var inspRes = aa.person.getUser(arguments[2]);
			if (inspRes.getSuccess())
				inspectorObj = inspRes.getOutput();
			}

        if (arguments.length >= 4)
            if(arguments[3] != null)
		        inspTime = arguments[3];

		if (arguments.length >= 5)
		    if(arguments[4] != null)
		        inspComm = arguments[4];

	var schedRes = aa.inspection.scheduleInspection(capId, inspectorObj, aa.date.parseDate(DateToSched), inspTime, iType, inspComm)

	if (schedRes.getSuccess()) {
		logDebug("Successfully scheduled inspection : " + iType + " for " + DateToSched);
		inspId = schedRes.getOutput();
		return inspId;
	}
	else
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	return null;
	}

 
 

function sendTowingEmail() {
	rFiles = new Array();
	var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
	if(capDocResult.getSuccess()) {
		if(capDocResult.getOutput().size() > 0) {
	    	for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
				var documentObject = capDocResult.getOutput().get(docInx);
				aa.print(documentObject.getFileName());
				fileName = "" + documentObject.getFileName();
	    		currDocCat = "" + documentObject.getDocCategory();
	    		if (currDocCat == "Court Order") {
	    			// download the document content
					var useDefaultUserPassword = true;
					//If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
					var EMDSUsername = null;
					var EMDSPassword = null;
					var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
					if(downloadResult.getSuccess()) {
						var path = downloadResult.getOutput();
						logDebug("path=" + path);
						rFiles.push(path);
					}
				}
			}
		}
	}
	// Run report Court Ordered Clean Cover Sheet
	reportParams = aa.util.newHashtable();
    reportParams.put("CaseNumber", altId);
	reportName = "Court Ordered Clean Cover Sheet";
	coverSheet = reportRunSave(reportName, false, true, true, "EnvHealth", reportParams, capId);
	logDebug(coverSheet);
	if (coverSheet)
		rFiles.push(coverSheet);
	
	var emailParams = aa.util.newHashtable();
	addParameter(emailParams, "$$capID$$", altId);
	addParameter(emailParams, "$$CAPADDRESS$$", hhc_getTheAddress(capId));
	var censusTract = '';
	censusTract = AInfo['ParcelAttribute.CensusTract'];
	areaTeamLeaderEmail = lookup('Census - Team Leader',censusTract); 
	areaTeamLeader = "";
	if (areaTeamLeaderEmail && areTeamLeaderEmail != "") {
		areaTeamLeaderEmailPieces = areaTeamLeaderEmail.split("@");
		areaTeamLeader = areaTeamLeaderEmailPieces[0];
	}
	addParameter(emailParams, "REQUESTOR", areaTeamLeader);
	addParameter(emailParams, "REQUESTOREMAIL", areaTeamLeaderEmail);

	sendNotification(null, "deanna@grayquarter.com","", "HOUSING EMAIL TO TOWING CONTRACTOR", emailParams, rFiles,capId);
	for (var i=0;i<rFiles.length;i++)
		aa.util.deleteFile(rFiles[i]);

}
function supervisorReviewResultActions(taskName, tNote) {
	if(taskName == "Supervisor Review Workflow") {
		var pieces = tNote.split("-");
		if (pieces && pieces.length == 2) {
			aa.print("activating task " + pieces[0]);
			activateTask("" + pieces[0]);
			updateTask("" + pieces[0], "Rework", "set by script");
		}
	}
	if (taskName == "Supervisor Review Inspection") {
		var pieces = note.split("-");
		if (pieces && pieces.length == 4) {
			inspID = pieces[3];
			var inspResultObj = aa.inspection.getInspection(capId, inspID);
			if (inspResultObj.getSuccess()) {
				var inspScriptModel = inspResultObj.getOutput();
				if (inspScriptModel != null) {
					insp = inspScriptModel.getInspection();
					insp.setInspectionStatus("Rework");
					editResult = aa.inspection.updateInspectionForSuperVisor(insp);
					if (editResult.getSuccess()) { logDebug("Editing inspection " + inspId); }
				   else { logDebug("Error editing the inspection " + editResult.getErrorMessage()); }
				}
			}
		}
	}
}
function tableHasRows(t) {
	try{
		if (typeof(t) != "undefined") var o = ''+ t;
			if (typeof(o) == "object" && o.length > 0) {
				return true;
	} 		else {
				return false;
	}
	}
	catch(err)
		{
		logDebug("A JavaScript Error occurred: tableHasRows:  " + err.message);
		logDebug(err.stack);
		}
	
}

function validateForCourt() {
	showMessage = true;
	itemCap = capId
	if (arguments.length > 0)	itemCap = arguments[0]
	localCancel = false;
	errMess = "";

	cContactResult = aa.people.getCapContactByCapID(capId);
	if (cContactResult.getSuccess()) {
		conArray = cContactResult.getOutput();
		if (conArray && conArray.length > 0) {
			useThisContact = null;
			for (var ci in conArray) {
				thisContact = conArray[ci];
				thisPeop = thisContact.getPeople();
				if (thisPeop.getFlag() == "Y") 
					useThisContact = thisContact;
				break;
			}
			if (useThisContact == null) {
				useThisContact = conArray[0];
			}
			conPeop = useThisContact.getPeople();
			if (!conPeop.getContactTypeFlag() || conPeop.getContactTypeFlag() == "" || conPeop.getContactTypeFlag() == "individual") {
				// check fields for individual
				if (!conPeop.getLastName() || conPeop.getLastName() == "" ) {
					errMess += "Individual contact must have last name";
					localCancel = true;
				}
				if (!conPeop.getFirstName() || conPeop.getFirstName() == "" ) {
					errMess += "Individual contact must have first name";
					localCancel = true;
				}
			}
			else {
				//check fields for organization
				if (!conPeop.getBusinessName() || conPeop.getBusinessName() == "") {
					errMess += "Business contact must have business name";
					localCancel = true;
				}
			}
			// check fields for both types
			cAddr = conPeop.getCompactAddress();
			if (!cAddr.getCity() || cAddr.getCity() == "" ) {
				errMess += "Contact address must have a city"; localCancel = true; }
			if (!cAddr.getState() || cAddr.getState() == "" ) {
				errMess += "Contact address must have a state"; localCancel = true; }
			if (!cAddr.getZip() || cAddr.getZip() == "" ) {
				errMess += "Contact address must have a zip"; localCancel = true; }
			if (!cAddr.getAddressLine1() || cAddr.getAddressLine1() == "" ) {
				errMess += "Contact address must have an address"; localCancel = true; }
		}
		else {
			localCancel = true;
			errMess += "Missing court info: At least one contact is required.";
		}
	}
	else {
		logDebug("Error retrieving contacts " + cContactResult.getErrorMessage());
		errMess += "Missing court info: At least one contact is required.";
	}

    if (typeof(DOCUMENTS) != "object") {
    	localCancel = true;
    	errMess += "Missing court info: At least one entry in the DOCUMENTS list is required.";  	
    }
    if (typeof(DOCUMENTS) == "object" && DOCUMENTS.length == 0) {
    	localCancel = true;
    	errMess += "Missing court info: At least one entry in the DOCUMENTS list is required.";  	
    }
    
    if (typeof(OFFENSECODES) != "object") {
    	localCancel = true;
    	errMess += "Missing court info: At least one entry in the OFFENSE CODES list is required.";  	
    }
    if (typeof(OFFENSECODES) == "object" && OFFENSECODES.length == 0) {
    	localCancel = true;
    	errMess += "Missing court info: At least one entry in the OFFENSE CODES list is required.";  	
    }
    
  

	if (localCancel) {
		cancel = true;
		comment(errMess);
	}
}


