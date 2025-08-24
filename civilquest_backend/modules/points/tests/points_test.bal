import ballerina/test;

@test:Config {}
function testStringLessOrdering() {
    test:assertTrue(stringLess("Apple", "Banana"));
    test:assertFalse(stringLess("Car", "Car"));
    test:assertFalse(stringLess("Zoo", "Alpha"));
}

@test:Config {}
function testSafeConvertPointsVariants() {
    test:assertEquals(safeConvertPoints(10), 10);
    // Ballerina float to int casting rounds to nearest (banker's rounding); 10.9 becomes 11
    test:assertEquals(safeConvertPoints(10.9), 11);
    test:assertEquals(safeConvertPoints(10.1), 10);
    test:assertEquals(safeConvertPoints("25"), 25);
    test:assertEquals(safeConvertPoints(()), 0);
    test:assertEquals(safeConvertPoints("bad"), 0);
}
