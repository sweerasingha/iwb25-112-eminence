import ballerina/test;

@test:Config {}
function testIsLeap() {
    test:assertTrue(isLeap(2024));
    test:assertFalse(isLeap(2023));
    test:assertTrue(isLeap(2000)); // divisible by 400
    test:assertFalse(isLeap(1900)); // divisible by 100 not 400
}

@test:Config {}
function testDaysSinceEpoch() {
    test:assertEquals(daysSinceEpoch(1970, 1, 1), 0);
    test:assertEquals(daysSinceEpoch(1970, 1, 2), 1);
    test:assertEquals(daysSinceEpoch(1970, 2, 1), 31);
    // Feb 29 1972: 1970 (365) + 1971 (365) = 730; Jan 1972 (31) + (29 - 1) = 28 => 31+28 = 59; total 789
    test:assertEquals(daysSinceEpoch(1972, 2, 29), 789);
}

@test:Config {}
function testToHex() {
    byte[] b = [0x00, 0xAB, 0xFF];
    string h = toHex(b);
    test:assertEquals(h, "00abff");
}

@test:Config {}
function testGetEpochSecondsNonNegative() {
    int secs = getEpochSeconds();
    test:assertTrue(secs > 0);
}
