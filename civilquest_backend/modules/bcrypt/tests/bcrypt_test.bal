import ballerina/test;

@test:Config {}
function testHashAndVerifyPassword() {
    string|error hash = hashPassword("P@ssw0rd!", 1);
    test:assertFalse(hash is error, msg = "Hashing failed");
    if hash is string {
        boolean|error ok = verifyPassword("P@ssw0rd!", hash);
        test:assertTrue(ok is boolean && ok, msg = "Password should verify");
        boolean|error bad = verifyPassword("WrongPass", hash);
        test:assertTrue(bad is boolean && !bad, msg = "Wrong password should not verify");
    }
}
