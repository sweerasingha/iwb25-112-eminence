import ballerina/test;

@test:Config {}
function testInferProvinceFromEmail() {
    string p = inferProvinceFromEmail("admin.colombo@civilquest.com");
    test:assertEquals(p, "Western");
    string p2 = inferProvinceFromEmail("someone.unknown@civilquest.com");
    test:assertEquals(p2, "");
}

@test:Config {}
function testExtractIdStringVariants() {
    test:assertEquals(extractIdString("abc"), "abc");
    map<json> oidMap = {"$oid": "0123456789abcdef01234567"};
    test:assertEquals(extractIdString(<anydata|()>oidMap), "0123456789abcdef01234567");
    map<json> invalid = {"other": "x"};
    test:assertTrue(extractIdString(<anydata|()>invalid) is ());
}
