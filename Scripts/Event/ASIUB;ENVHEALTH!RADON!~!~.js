//showDebug = true;
showMessage = true;

var basement = parseInt(AInfo['Foundation - Basement']);
var crawl = parseInt(AInfo['Foundation - Crawl']);
var slab = parseInt(AInfo['Foundation - Slab']);

if(slab > 0 || crawl > 0 || basement > 0) {
    var result = slab + crawl + basement;
    if(result != 100) {
        cancel = true;
        aa.print("The foundation %'s must add up to 100");
    }   
}
