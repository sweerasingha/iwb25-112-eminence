import ballerina/test;

@test:Config {}
function testGenerateAndExtractClaims() {
    string|error t = generateToken("user@example.com", "ADMIN");
    test:assertFalse(t is error, msg = "Token generation failed");
    if t is string {
        string|error role = extractRole(t);
        test:assertEquals(role, "ADMIN");
        string|error uid = extractUserId(t);
        // userId returned should be subject/username used
        test:assertEquals(uid, "user@example.com");
    }
}
