import ballerina/test;

@test:Config {}
function testParseAuditLogQueryParamsDefaults() {
    AuditLogQueryParams q = parseAuditLogQueryParams({});
    test:assertTrue(q.userId is ());
    test:assertEquals(q.limitCount, 100);
    test:assertEquals(q.skipCount, 0);
}

@test:Config {}
function testParseAuditLogQueryParamsValues() {
    map<string[]> params = {};
    params["userId"] = ["u1"];
    params["action"] = ["ACT"];
    params["resourceType"] = ["EVENT"];
    params["startDate"] = ["2025-01-01"];
    params["endDate"] = ["2025-01-31"];
    params["limit"] = ["10"];
    params["skip"] = ["5"];
    AuditLogQueryParams q = parseAuditLogQueryParams(params);
    test:assertEquals(q.userId, "u1");
    test:assertEquals(q.action, "ACT");
    test:assertEquals(q.resourceType, "EVENT");
    test:assertEquals(q.startDate, "2025-01-01");
    test:assertEquals(q.endDate, "2025-01-31");
    test:assertEquals(q.limitCount, 10);
    test:assertEquals(q.skipCount, 5);
}
