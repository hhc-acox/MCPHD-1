
function changeNameofAttachment(attachmentName) 
{
    rptExtLoc = attachmentName.indexOf(".");
    rptLen = attachmentName.length();
    ext = attachmentName.substr(rptExtLoc, rptLen);
    attachName = name + ext;
    return attachName
}	