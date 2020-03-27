function getEmailByUserID(userId) { // optional capId

    if (userId) {
        var userRes = aa.person.getUser(userId);

        if (userRes.getSuccess()) {
            return userRes.getOutput().getEmail();
        }
    }
}
