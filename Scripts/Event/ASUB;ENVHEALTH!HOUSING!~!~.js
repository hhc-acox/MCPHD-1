if (balanceDue > 0 && appStatus == 'Finaled') {
    cancel = true;
    showMessage = true;
    comment("Cannot final a case with an outstanding fee balance.");
}
