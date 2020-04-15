//showDebug = true;
showMessage = true;

var basement = parseInt(AInfo['Foundation - Basement']) || 0;
var crawl = parseInt(AInfo['Foundation - Crawl']) || 0;
var slab = parseInt(AInfo['Foundation - Slab']) || 0;

if(slab > 0 || crawl > 0 || basement > 0) {
    var result = slab + crawl + basement;
    if(result != 100) {
        cancel = true;
        aa.print("The foundation %'s must add up to 100");
    }   
}
