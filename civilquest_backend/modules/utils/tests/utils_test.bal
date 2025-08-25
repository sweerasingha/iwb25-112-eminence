import ballerina/test;

@test:Config {}
function testHexToStringBasic() {
    // 48656c6c6f -> Hello
    string|error res = hexToString("48656c6c6f");
    test:assertFalse(res is error, msg = "hexToString returned error");
    if res is string {
        test:assertEquals(res, "Hello");
    }
}

@test:Config {}
function testValidateEmail() {
    string|boolean ok = validateEmail("user@example.com");
    test:assertTrue(ok is boolean && ok, msg = "Valid email flagged invalid");
    string|boolean bad = validateEmail("user@@example");
    test:assertTrue(bad is string, msg = "Invalid email not returning message");
}

@test:Config {}
function testValidatePasswordComplexity() {
    test:assertTrue(validatePasswordComplexity("Abcdef1!"), msg = "Strong password rejected");
    test:assertFalse(validatePasswordComplexity("abcdefg"), msg = "Weak password accepted");
}

@test:Config {}
function testValidateRoleTransition() {
    test:assertTrue(validateRoleTransition("USER", "PREMIUM_PENDING"));
    test:assertFalse(validateRoleTransition("SUPER_ADMIN", "ADMIN"));
}

@test:Config {}
function testCalculateHaversineDistanceMeters() {
    float d0 = calculateHaversineDistanceMeters(6.9271, 79.8612, 6.9271, 79.8612);
    test:assertTrue(d0 < 1.0, msg = "Distance for identical points should be ~0");
    float d1 = calculateHaversineDistanceMeters(6.9271, 79.8612, 6.9361, 79.8612);
    test:assertTrue(d1 > 500.0, msg = "Distance should exceed 500m");
}
