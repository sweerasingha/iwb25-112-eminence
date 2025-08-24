import ballerina/test;

@test:Config {}
function testParseNotificationQueryParamsDefaults() {
    NotificationQueryParams q = parseNotificationQueryParams({});
    test:assertFalse(q.unreadOnly);
    test:assertEquals(q.limitCount, 50);
}

@test:Config {}
function testParseNotificationQueryParamsValues() {
    map<string[]> params = {};
    params["unreadOnly"] = ["true"];
    params["limit"] = ["10"];
    NotificationQueryParams q = parseNotificationQueryParams(params);
    test:assertTrue(q.unreadOnly);
    test:assertEquals(q.limitCount, 10);
}
