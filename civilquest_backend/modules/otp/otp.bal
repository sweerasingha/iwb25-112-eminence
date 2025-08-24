import civilquest_api.database;
import civilquest_api.email;

import ballerina/random;
import ballerina/time;
import ballerinax/mongodb;

final mongodb:Collection otpCollection;

function init() returns error? {
    otpCollection = check database:db->getCollection("otp");
}

// Verifies an OTP code for a given email address
public isolated function verifyOtp(string emailAddr, string otp) returns boolean|error {

    // Get the current time
    int timeNow = time:utcNow()[0];

    map<json> filter = {email: emailAddr, otp, expiresAt: {"$gt": timeNow}};

    Otp|error|() result = otpCollection->findOne(filter, targetType = Otp);

    if result is error {
        return error("Error whie finding validating the OTP");
    }

    if result is () {
        return false;
    }

    return true;
}

// Generates and sends a new OTP code to the specified email address
public isolated function issueOtp(string toEmail) returns int|error {

    // Get the current time  + 10 minutes
    int expiresAt = time:utcAddSeconds(time:utcNow(), 600)[0];

    int otp = check random:createIntInRange(100000, 999999);

    map<json> otpData = {
        "email": toEmail,
        "otp": otp.toString(),
        "expiresAt": expiresAt
    };
    check otpCollection->insertOne(otpData);
    // Send OTP via email
    check email:sendEmail(toEmail, "Your OTP Code", string `Your OTP is: ${otp}`);

    return otp;
}

