// ASA;EnvHealth!HHECMSC!LHH!~
// 7.5.17 chaas: this script has no issues :)
scheduleInspectDate('Initial Lead Inspection',AInfo['GENERAL.Initial Inspection Date'],areaInspector);
theDate = AInfo['GENERAL.Initial Inspection Date'].substring(6,10) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(0,2) + '-' + AInfo['GENERAL.Initial Inspection Date'].substring(3,5);
comment('The new date is ' + theDate);
resultInspection('Initial Lead Inspection','In Violation',theDate,'Resulted by Script');
assignCap(areaInspector);
editAppSpecific('GENERAL.Assigned To',areaInspector);
editAppSpecific('GENERAL.Previous Assigned To',areaInspector);
updateAppStatus('In Violation','Initial Status');
