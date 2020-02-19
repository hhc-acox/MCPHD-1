if(wfTask == 'Site Survey' && wfStatus == 'Approved' && balanceDue > 0) {
    cancel = true;
    aa.print("Cannot Close Site Survey with Fee's Due");
}
