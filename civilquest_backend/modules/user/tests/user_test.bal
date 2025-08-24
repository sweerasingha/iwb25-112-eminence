import ballerina/test;

@test:Config {}
function testIsValidProvinceValid() {
    test:assertTrue(isValidProvince("Western"), msg = "Expected Western to be a valid province");
}

@test:Config {}
function testIsValidProvinceInvalid() {
    test:assertFalse(isValidProvince("Atlantis"), msg = "Expected Atlantis to be invalid province");
}

@test:Config {}
function testByUserIdObjectIdForm() {
    string objectId = "0123456789abcdef01234567";
    map<json> filter = byUserId(objectId);
    test:assertTrue(filter.hasKey("_id"), msg = "Filter must contain _id");
    anydata v = filter["_id"];
    test:assertTrue(v is map<json>, msg = "_id should be map for ObjectId");
    if v is map<json> {
        test:assertEquals(v["$oid"], objectId, msg = "Expected $oid value to match input");
    }
}

@test:Config {}
function testByUserIdPlainString() {
    string simpleId = "user-123";
    map<json> filter = byUserId(simpleId);
    test:assertEquals(filter["_id"], simpleId, msg = "Expected plain string id mapping");
}

@test:Config {}
function testExtractIdStringFromString() {
    string sid = "plain-id";
    string|() result = extractIdString(sid);
    test:assertEquals(result, sid);
}

@test:Config {}
function testExtractIdStringFromMap() {
    string oid = "abcdefabcdefabcdefabcdef";
    map<json> idMap = {"$oid": oid};
    string|() result = extractIdString(<anydata|()>idMap);
    test:assertEquals(result, oid);
}

@test:Config {}
function testExtractIdStringInvalid() {
    // Missing $oid should return ()
    map<json> invalid = {"wrong": "value"};
    string|() result = extractIdString(<anydata|()>invalid);
    test:assertTrue(result is (), msg = "Expected () for invalid id map");
}

