import civilquest_api.bcrypt;
import civilquest_api.otp;
import civilquest_api.token;
import civilquest_api.user;
import civilquest_api.utils;

import ballerina/http;
import ballerina/time;

// Authenticates user with email and password
public isolated function login(http:Caller caller, http:Request req) returns error? {
    // Input validation
    json|error requestBody = req.getJsonPayload();
    if requestBody is error {
        return caller->respond(<http:BadRequest>{body: "Invalid payload"});
    }

    // Parse login data
    LoginUserDto userData = check requestBody.cloneWithType(LoginUserDto);

    // Find user by email
    user:User|error|() foundUser = user:findUserByEmail(userData.email);
    if foundUser is error {
        return utils:serverError(caller);
    }
    if foundUser is () {
        return caller->respond(<http:NotFound>{body: "User not found"});
    }

    // Verify password
    boolean|error passwordResult = bcrypt:verifyPassword(userData.password, foundUser.password);
    if passwordResult is error {
        return utils:serverError(caller);
    }
    if !passwordResult {
        return caller->respond(<http:BadRequest>{body: "Invalid credentials"});
    }

    // Generate authentication token
    string|error token = token:generateToken(foundUser.email ?: "", foundUser.role);
    if token is error {
        return utils:serverError(caller);
    }

    // Success response
    json response = {message: "Login successful", token};
    check caller->respond(<http:Ok>{body: response});
}

// Initiates user registration process with email verification
public isolated function initRegisteration(http:Caller caller, http:Request req) returns error? {
    // Input validation
    json|error requestBody = req.getJsonPayload();
    if requestBody is error {
        return caller->respond(<http:BadRequest>{body: "Invalid payload"});
    }

    // Parse registration data
    RegisterUserDto userData = check requestBody.cloneWithType(RegisterUserDto);

    // Check if user already exists
    user:User|error|() foundUser = user:findAnyUserByEmail(userData.email);
    if foundUser is error {
        return utils:serverError(caller);
    }
    if !(foundUser is ()) {
        return caller->respond(<http:BadRequest>{body: "Email already registered"});
    }

    // Hash password
    string|error passwordHash = bcrypt:hashPassword(userData.password, 5);
    if passwordHash is error {
        return utils:serverError(caller);
    }

    // Create new user record
    string now = time:utcToString(time:utcNow());
    user:User newUser = {
        email: userData.email,
        password: passwordHash,
        name: userData.name,
        verified: false,
        role: "USER",
        createdAt: now,
        updatedAt: now
    };

    // Insert user into database
    error? insertUser = user:insertUser(newUser);
    if insertUser is error {
        return utils:serverError(caller);
    }

    // Send OTP for email verification
    int|error otpCode = otp:issueOtp(userData.email);
    if otpCode is error {
        return utils:serverError(caller);
    }

    // Success response
    check caller->respond(<http:Ok>{body: "Registration successful! OTP sent to your email"});
}

// Completes user registration by verifying OTP
public isolated function completeRegistration(http:Caller caller, http:Request req) returns error? {
    // Input validation
    json|error requestBody = req.getJsonPayload();
    if requestBody is error {
        return caller->respond(<http:BadRequest>{body: "Invalid payload"});
    }

    // Parse OTP verification data
    OtpVerifyDto userData = check requestBody.cloneWithType(OtpVerifyDto);

    // Verify OTP
    boolean|error result = otp:verifyOtp(userData.email, userData.otp);
    if result is error {
        return utils:serverError(caller);
    }
    if result is false {
        return caller->respond(<http:BadRequest>{body: "Invalid or expired OTP"});
    }

    // Update user verification status
    error? updateResult = user:updateUserByEmail(userData.email, {"verified": true});
    if updateResult is error {
        return utils:serverError(caller);
    }

    // Success response
    check caller->respond(<http:Ok>{body: "Account verified successfully"});
}

// Requests password reset OTP for user
public isolated function requestPasswordResetOtp(http:Caller caller, http:Request req) returns error? {
    // Input validation
    json|error requestBody = req.getJsonPayload();
    if requestBody is error {
        return caller->respond(<http:BadRequest>{body: "Invalid payload"});
    }

    // Parse password reset request data
    PasswordResetRequestDto userData = check requestBody.cloneWithType(PasswordResetRequestDto);

    // Find user by email
    user:User|error|() foundUser = user:findAnyUserByEmail(userData.email);
    if foundUser is error {
        return utils:serverError(caller);
    }
    if foundUser is () {
        return caller->respond(<http:NotFound>{body: "User not found"});
    }

    // Send password reset OTP
    int|error otpCode = otp:issueOtp(userData.email);
    if otpCode is error {
        return utils:serverError(caller);
    }

    // Success response
    check caller->respond(<http:Ok>{body: "Password reset OTP sent successfully"});
}

// Resets user password using OTP verification
public isolated function resetPassword(http:Caller caller, http:Request req) returns error? {
    // Input validation
    json|error requestBody = req.getJsonPayload();
    if requestBody is error {
        return caller->respond(<http:BadRequest>{body: "Invalid payload"});
    }

    // Parse password reset data
    PasswordResetDto userData = check requestBody.cloneWithType(PasswordResetDto);

    // Verify OTP
    boolean|error result = otp:verifyOtp(userData.email, userData.otp);
    if result is error {
        return utils:serverError(caller);
    }
    if result is false {
        return caller->respond(<http:BadRequest>{body: "Invalid or expired OTP"});
    }

    // Hash new password
    string|error passwordHash = bcrypt:hashPassword(userData.newPassword, 5);
    if passwordHash is error {
        return utils:serverError(caller);
    }

    // Update user password
    error? updateResult = user:updateUserByEmail(userData.email, {"password": passwordHash});
    if updateResult is error {
        return utils:serverError(caller);
    }

    // Success response
    check caller->respond(<http:Ok>{body: "Password reset successful"});
}

