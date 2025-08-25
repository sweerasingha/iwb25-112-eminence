import ballerina/lang.regexp;
import ballerina/time;

public isolated function validateString(string name, string label, int? minLength = 0, int? maxLength = 0, boolean allowNumeric = false) returns string|boolean {
    // Regex pattern based on the `allowNumeric` flag
    string:RegExp pattern = allowNumeric ? re `^[a-zA-Z0-9\s]+$` : re `^[a-zA-Z\s]+$`;

    // Check for empty input or invalid characters
    if name.length() == 0 || regexp:isFullMatch(pattern, name) == false {
        return label + ": should not be empty and should only contain " + (allowNumeric ? "alphabetic and numeric characters" : "alphabetic characters");
    }

    // Check for minimum length constraint
    if minLength is int && name.length() < minLength {
        return label + ": should have at least " + minLength.toString() + " characters";
    }

    // Check for maximum length constraint
    if maxLength is int && name.length() > maxLength {
        return label + ": should not exceed " + maxLength.toString() + " characters";
    }

    return true;
}

public isolated function validatePhoneNumber(string phoneNumber) returns string|boolean {
    string:RegExp phonePattern = re `^[0-9]{10}$`;
    if regexp:isFullMatch(phonePattern, phoneNumber) == false {
        return "Phone Number should contain only 10 digits";
    }
    return true;
}

public isolated function validateEmail(string email) returns string|boolean {
    string:RegExp emailPattern = re `^[\w\-.]+@[\w-]+\.[a-z]{2,3}$`;
    if regexp:isFullMatch(emailPattern, email) == false {
        return "Email address is not in a valid format";
    }
    return true;
}

public isolated function validateNumeric(string input, string label, int? min = 0, int? max = 0) returns string|boolean {
    string:RegExp numericPattern = re `^[0-9]+$`;
    if regexp:isFullMatch(numericPattern, input) == false {
        return label + ": should contain only numeric digits";
    }

    int|error inputNumber = int:fromString(input);

    if inputNumber is error {
        return label + ": is invalid";
    }

    if min is int && inputNumber < min {
        return label + ": should be higher than " + min.toString();
    }

    if max is int && inputNumber > max {
        return label + ": should not exceed " + max.toString();
    }

    return true;
}

// Enhanced validation functions for business logic

// Validate event date is not in the past
public isolated function validateEventDate(string eventDate) returns boolean|error {
    time:Utc eventTime = check time:utcFromString(eventDate + "T23:59:59.000Z");
    time:Utc currentTime = time:utcNow();

    time:Seconds diff = time:utcDiffSeconds(eventTime, currentTime);
    return diff >= 0d;
}

// Validate sponsorship amount
public isolated function validateSponsorshipAmount(decimal amount) returns boolean {
    return amount > 0.0d && amount <= 1000000.0d; // Max 1M in local currency
}

// Validate role transition
public isolated function validateRoleTransition(string currentRole, string newRole) returns boolean {
    match currentRole {
        "USER" => {
            return newRole == "PREMIUM_PENDING" || newRole == "USER";
        }
        "PREMIUM_PENDING" => {
            return newRole == "PREMIUM_USER" || newRole == "USER";
        }
        "PREMIUM_USER" => {
            return newRole == "USER" || newRole == "PREMIUM_USER";
        }
        "ADMIN_OPERATOR" => {
            return newRole == "ADMIN_OPERATOR" || newRole == "USER";
        }
        "ADMIN" => {
            return newRole == "ADMIN" || newRole == "USER";
        }
        "SUPER_ADMIN" => {
            return newRole == "SUPER_ADMIN";
        }
        _ => {
            return false;
        }
    }
}

// Validate password complexity
public isolated function validatePasswordComplexity(string password) returns boolean {
    // At least 8 characters, contains uppercase, lowercase, digit, and special character
    string:RegExp upperPattern = re `.*[A-Z].*`;
    string:RegExp lowerPattern = re `.*[a-z].*`;
    string:RegExp digitPattern = re `.*[0-9].*`;
    string:RegExp specialPattern = re `.*[!@#$%^&*(),.?":{}|<>].*`;

    return password.length() >= 8 &&
        regexp:isFullMatch(upperPattern, password) &&
        regexp:isFullMatch(lowerPattern, password) &&
        regexp:isFullMatch(digitPattern, password) &&
        regexp:isFullMatch(specialPattern, password);
}

// Validate National ID format (Sri Lankan format)
public isolated function validateNationalId(string nationalId) returns boolean {
    // Old format: 9 digits + V or X
    // New format: 12 digits
    string:RegExp oldPattern = re `^[0-9]{9}[VvXx]$`;
    string:RegExp newPattern = re `^[0-9]{12}$`;

    return regexp:isFullMatch(oldPattern, nationalId) || regexp:isFullMatch(newPattern, nationalId);
}

// Validate time format (HH:MM)
public isolated function validateTimeFormat(string timeStr) returns boolean {
    string:RegExp timePattern = re `^([0-9]|[01][0-9]|2[0-3]):[0-5][0-9]$`;
    return regexp:isFullMatch(timePattern, timeStr);
}

// Validate start time is before end time
public isolated function validateTimeOrder(string startTime, string? endTime) returns boolean|error {
    if endTime is () {
        return true; // No end time specified
    }

    // Simple time comparison (assumes same day)
    string[] startParts = regexp:split(re `:`, startTime);
    string[] endParts = regexp:split(re `:`, endTime);

    if startParts.length() != 2 || endParts.length() != 2 {
        return error("Invalid time format");
    }

    int startHour = check int:fromString(startParts[0]);
    int startMinute = check int:fromString(startParts[1]);
    int endHour = check int:fromString(endParts[0]);
    int endMinute = check int:fromString(endParts[1]);

    int startTotalMinutes = startHour * 60 + startMinute;
    int endTotalMinutes = endHour * 60 + endMinute;

    return startTotalMinutes < endTotalMinutes;
}

// Composite validation for user registration
public isolated function validateUserRegistration(map<json> userData) returns string[] {
    string[] errors = [];

    if userData.hasKey("name") {
        string name = userData["name"].toString();
        string|boolean nameResult = validateString(name, "Name", 2, 100);
        if nameResult is string {
            errors.push(nameResult);
        }
    }

    if userData.hasKey("email") {
        string email = userData["email"].toString();
        string|boolean emailResult = validateEmail(email);
        if emailResult is string {
            errors.push(emailResult);
        }
    }

    if userData.hasKey("phoneNumber") {
        string phoneNumber = userData["phoneNumber"].toString();
        string|boolean phoneResult = validatePhoneNumber(phoneNumber);
        if phoneResult is string {
            errors.push(phoneResult);
        }
    }

    if userData.hasKey("password") {
        string password = userData["password"].toString();
        if !validatePasswordComplexity(password) {
            errors.push("Password must be at least 8 characters with uppercase, lowercase, digit, and special character");
        }
    }

    if userData.hasKey("nationalid") {
        string nationalId = userData["nationalid"].toString();
        if !validateNationalId(nationalId) {
            errors.push("Invalid National ID format");
        }
    }

    return errors;
}

// Composite validation for event creation
public isolated function validateEventCreation(map<json> eventData) returns string[] {
    string[] errors = [];

    if eventData.hasKey("eventTitle") {
        string title = eventData["eventTitle"].toString();
        string|boolean titleResult = validateString(title, "Event title", 5, 200, true);
        if titleResult is string {
            errors.push(titleResult);
        }
    }

    if eventData.hasKey("eventDescription") {
        string description = eventData["eventDescription"].toString();
        string|boolean descResult = validateString(description, "Event description", 20, 2000, true);
        if descResult is string {
            errors.push(descResult);
        }
    }

    if eventData.hasKey("date") {
        string eventDate = eventData["date"].toString();
        boolean|error isValidDate = validateEventDate(eventDate);
        if isValidDate is error || !isValidDate {
            errors.push("Event date cannot be in the past");
        }
    }

    if eventData.hasKey("startTime") {
        string startTime = eventData["startTime"].toString();
        if !validateTimeFormat(startTime) {
            errors.push("Invalid start time format (use HH:MM)");
        }

        if eventData.hasKey("endTime") && eventData["endTime"] != () {
            string endTime = eventData["endTime"].toString();
            if !validateTimeFormat(endTime) {
                errors.push("Invalid end time format (use HH:MM)");
            } else {
                boolean|error timeOrderResult = validateTimeOrder(startTime, endTime);
                if timeOrderResult is error || !timeOrderResult {
                    errors.push("End time must be after start time");
                }
            }
        }
    }

    if eventData.hasKey("city") {
        string city = eventData["city"].toString();
        string|boolean cityResult = validateString(city, "City", 2, 50);
        if cityResult is string {
            errors.push(cityResult);
        }
    }

    if eventData.hasKey("reward") {
        string rewardStr = eventData["reward"].toString();
        string|boolean rewardResult = validateNumeric(rewardStr, "Reward points", 0, 1000);
        if rewardResult is string {
            errors.push(rewardResult);
        }
    }

    // Validate optional geolocation if provided
    if eventData.hasKey("latitude") && eventData["latitude"] != () {
        float|error lat = float:fromString(eventData["latitude"].toString());
        if lat is error || !(lat >= -90.0 && lat <= 90.0) {
            errors.push("Invalid latitude value");
        }
    }
    if eventData.hasKey("longitude") && eventData["longitude"] != () {
        float|error lon = float:fromString(eventData["longitude"].toString());
        if lon is error || !(lon >= -180.0 && lon <= 180.0) {
            errors.push("Invalid longitude value");
        }
    }

    return errors;
}

