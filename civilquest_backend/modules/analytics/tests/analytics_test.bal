import ballerina/test;

@test:Config {}
function testParseDateRangeParamsEmpty() {
    map<string[]> params = {};
    DateRangeParams r = parseDateRangeParams(params);
    test:assertTrue(r.startDate is (), msg = "startDate should be ()");
    test:assertTrue(r.endDate is (), msg = "endDate should be ()");
}

@test:Config {}
function testParseDateRangeParamsValues() {
    map<string[]> params = {};
    params["startDate"] = ["2025-01-01"];
    params["endDate"] = ["2025-01-31"];
    DateRangeParams r = parseDateRangeParams(params);
    test:assertEquals(r.startDate, "2025-01-01");
    test:assertEquals(r.endDate, "2025-01-31");
}

@test:Config {}
function testParseLimitParamVariants() {
    map<string[]> params = {};
    params["limit"] = ["25"];
    params["custom"] = ["7"];
    int defLimit = parseLimitParam(params); // default name "limit"
    test:assertEquals(defLimit, 25);
    int customLimit = parseLimitParam(params, name = "custom", defaultVal = 5);
    test:assertEquals(customLimit, 7);
    int missing = parseLimitParam({}, defaultVal = 42);
    test:assertEquals(missing, 42);
}
