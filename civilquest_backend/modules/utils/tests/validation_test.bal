import ballerina/test;

@test:Config {}
function testValidateStringBounds() {
    string|boolean tooShort = validateString("A", "Name", 2, 5);
    test:assertTrue(tooShort is string);
    string|boolean ok = validateString("Alice", "Name", 2, 10);
    test:assertTrue(ok is boolean && ok);
    string|boolean tooLong = validateString("ABCDEFGHIJK", "Name", 2, 5);
    test:assertTrue(tooLong is string);
}

@test:Config {}
function testValidatePhoneEmail() {
    test:assertTrue(validatePhoneNumber("0771234567") is boolean);
    test:assertTrue(validatePhoneNumber("123") is string);
    test:assertTrue(validateEmail("good@mail.com") is boolean);
    test:assertTrue(validateEmail("badmail") is string);
}

@test:Config {}
function testValidatePasswordAndNationalId() {
    test:assertTrue(validatePasswordComplexity("Abcdef1!"));
    test:assertFalse(validatePasswordComplexity("abc"));
    test:assertTrue(validateNationalId("123456789V"));
    test:assertTrue(validateNationalId("199912345678"));
    test:assertFalse(validateNationalId("12345"));
}

@test:Config {}
function testValidateRoleTransitionMatrix() {
    test:assertTrue(validateRoleTransition("USER", "PREMIUM_PENDING"));
    test:assertFalse(validateRoleTransition("SUPER_ADMIN", "ADMIN"));
}

@test:Config {}
function testValidateEventDateFuturePast() {
    // Use a fixed far-future date to ensure it's always valid
    string futureDate = "2099-12-31";
    boolean|error futureOk = validateEventDate(futureDate);
    test:assertTrue(futureOk is boolean && futureOk, msg = "Future date should be valid");

    // Past date
    string pastDate = "2000-01-01"; // safely in past
    boolean|error pastOk = validateEventDate(pastDate);
    test:assertTrue(pastOk is boolean && !pastOk, msg = "Past date should be invalid");
}

@test:Config {}
function testValidateSponsorshipAmount() {
    test:assertTrue(validateSponsorshipAmount(100.0d));
    test:assertFalse(validateSponsorshipAmount(0.0d));
    test:assertFalse(validateSponsorshipAmount(-5.0d));
}

@test:Config {}
function testValidateTimeAndOrder() {
    test:assertTrue(validateTimeFormat("09:30"));
    test:assertFalse(validateTimeFormat("9:60")); // invalid minutes
    boolean|error orderOk = validateTimeOrder("09:00", "10:00");
    test:assertTrue(orderOk is boolean && orderOk);
    boolean|error orderBad = validateTimeOrder("09:00", "08:59");
    test:assertTrue(orderBad is boolean && !orderBad);
    boolean|error orderNoEnd = validateTimeOrder("09:00", ());
    test:assertTrue(orderNoEnd is boolean && orderNoEnd);
    boolean|error orderErr = validateTimeOrder("09:AA", "10:00");
    test:assertTrue(orderErr is error, msg = "Invalid format should error");
}

@test:Config {}
function testValidateNumericVariants() {
    string|boolean ok = validateNumeric("123", "Value", 0, 200);
    test:assertTrue(ok is boolean && ok);
    string|boolean notNumeric = validateNumeric("abc", "Value", 0, 200);
    test:assertTrue(notNumeric is string);
    string|boolean tooSmall = validateNumeric("9", "Value", 10, 200);
    test:assertTrue(tooSmall is string);
    string|boolean tooLarge = validateNumeric("300", "Value", 0, 200);
    test:assertTrue(tooLarge is string);
}

@test:Config {}
function testValidateUserRegistrationComposite() {
    map<json> data = {"name": "A", "email": "bad", "phoneNumber": "123", "password": "weak", "nationalid": "xxx"};
    string[] errors = validateUserRegistration(data);
    test:assertTrue(errors.length() > 0, msg = "Expected multiple validation errors");
}

@test:Config {}
function testValidateEventCreationComposite() {
    // Intentionally invalid event
    map<json> eventData = {
        "eventTitle": "Ab", // too short
        "eventDescription": "Short desc", // too short
        "date": "1999-01-01", // past
        "startTime": "09:00",
        "endTime": "08:00", // before start
        "city": "C", // too short
        "reward": "2001" // too large
    };
    string[] errors = validateEventCreation(eventData);
    test:assertTrue(errors.length() >= 5, msg = "Expected multiple event validation errors");
    // Valid minimal event
    string futureDate = "2099-12-31";
    map<json> goodEvent = {
        "eventTitle": "Valid Event Title",
        "eventDescription": "This is a sufficiently long valid event description text that exceeds twenty characters and has only letters numbers and spaces",
        "date": futureDate,
        "startTime": "09:00",
        "endTime": "10:00",
        "city": "Colombo",
        "reward": "100"
    };
    string[] noErrors = validateEventCreation(goodEvent);
    test:assertEquals(noErrors.length(), 0, msg = "Valid event should have no validation errors");
}

@test:Config {}
function testValidateEventDescriptionWithPunctuation() {
    string futureDate = "2099-12-31";
    map<json> ev = {
        "eventTitle": "Beach Cleanup: Phase #2 (Colombo)",
        "eventDescription": "Bring gloves, bags & friends! Meeting point: Gate A, 9:00 AM. Let's do this.",
        "date": futureDate,
        "startTime": "09:00",
        "endTime": "10:00",
        "city": "Colombo",
        "reward": "50"
    };
    string[] errs = validateEventCreation(ev);
    test:assertEquals(errs.length(), 0, msg = "Description with punctuation should be accepted");
}
