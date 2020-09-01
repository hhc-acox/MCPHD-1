if (matches(inspResult, "In Compliance", "No Violations Found", "Non-Compliance/Case Closed")) {
    closeTask("Inspection", "Complete", "Updated by Script", "Complete");
    closeTask("Case Closed", "Closed", "Updated by Script", "Closed");
}
