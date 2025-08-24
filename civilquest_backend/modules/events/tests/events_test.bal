import ballerina/test;

@test:Config {}
function testNormalize() {
    test:assertEquals(normalize("  HeLLo  "), "hello");
}

@test:Config {}
function testIsEventCityInProvinceValidInvalid() {
    test:assertTrue(isEventCityInProvince("Colombo", "Western"));
    test:assertFalse(isEventCityInProvince("Atlantis", "Western"));
    test:assertFalse(isEventCityInProvince("Colombo", "NonExistingProvince"));
}
