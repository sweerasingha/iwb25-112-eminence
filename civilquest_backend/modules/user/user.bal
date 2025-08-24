import civilquest_api.audit;
import civilquest_api.bcrypt;
import civilquest_api.database;
import civilquest_api.notifications;
import civilquest_api.token;
import civilquest_api.utils;

import ballerina/http;
import ballerina/time;
import ballerinax/mongodb;

final mongodb:Collection userCollection;

function init() returns error? {
    userCollection = check database:db->getCollection("users");
}

// Sri Lankan Provinces for location-based access control
public final readonly & string[] VALID_PROVINCES = [
    "Western",
    "Central",
    "Southern",
    "Northern",
    "Eastern",
    "North Western",
    "North Central",
    "Uva",
    "Sabaragamuwa"
];

// Helper function to validate province
isolated function isValidProvince(string province) returns boolean {
    foreach string validProvince in VALID_PROVINCES {
        if province == validProvince {
            return true;
        }
    }
    return false;
}

// Helper function to get user's location context for authorization
isolated function getUserLocationContext(string userEmail) returns [string?, string?]|error {
    UserDoc|error|() user = userCollection->findOne({"email": userEmail}, targetType = UserDoc);
    if user is error {
        return user;
    }
    if user is () {
        return [(), ()];
    }
    return [user?.province, user?.city];
}

// Build a MongoDB _id filter that supports ObjectId (24-hex) and plain string IDs
isolated function byUserId(string id) returns map<json> {
    // If looks like a Mongo ObjectId hex (24 chars), use extended JSON form
    if id.length() == 24 {
        return {"_id": {"$oid": id}};
    }
    // Fallback: treat as plain string id
    return {"_id": id};
}

// Extract string form of Mongo _id whether it's a string or {"$oid": "..."}
isolated function extractIdString(anydata|() idVal) returns string|() {
    if idVal is string {
        return idVal;
    }
    if idVal is map<json> {
        json|() oid = idVal["$oid"];
        if oid is string {
            return oid;
        }
    }
    return ();
}

type UserDoc record {|
    string|anydata _id?;
    string name?;
    string phoneNumber?;
    string password?;
    boolean verified?;
    string role?;
    int points?;
    string[] eventId?;
    string[] organizeEventId?;
    string email?;
    string username?;
    string address?;
    string hometown?;
    string livingCity?;
    string gender?;
    boolean otpVerified?;
    string nationalid?;
    string profile_url?;
    string id_photo_url?;
    string createdAt?;
    string updatedAt?;

    string province?;
    string city?;
    string managedBy?;

    anydata...;
|};

// Finds a user by their phone number
public function findUserByPhoneNumber(string phoneNumber) returns ()|User|error {
    map<json> filter = {"phoneNumber": phoneNumber, verified: true};

    UserDoc|error|() raw = userCollection->findOne(filter, targetType = UserDoc);
    if raw is error {
        return error("Error while finding user by phone number");
    }
    if raw is () {
        return ();
    }

    // Build a minimal User record from the typed doc
    User u = {
        name: raw.name ?: "",
        password: raw.password ?: "",
        verified: raw.verified ?: false,
        role: raw.role ?: "USER",
        points: raw.points ?: 0,
        eventId: [],
        organizeEventId: []
    };

    // Extract MongoDB _id properly (handles ObjectId and string)
    anydata|() idValue = raw?._id;
    string|() sid = extractIdString(idValue);
    if sid is string {
        u._id = sid;
    }

    // Handle optional phoneNumber
    if raw.phoneNumber is string {
        u.phoneNumber = raw.phoneNumber;
    }

    string[] ev = [];
    if raw.eventId is string[] {
        ev = <string[]>raw.eventId;
    }
    u.eventId = ev;
    string[] org = [];
    if raw.organizeEventId is string[] {
        org = <string[]>raw.organizeEventId;
    }
    u.organizeEventId = org;
    if raw.email is string {
        u.email = raw.email;
    }
    return u;
}

// Finds a verified user by their email address (for login purposes)
public isolated function findUserByEmail(string email) returns ()|User|error {
    map<json> filter = {"email": email, verified: true};

    UserDoc|error|() raw = userCollection->findOne(filter, targetType = UserDoc);
    if raw is error {
        return error("Error while finding user by email");
    }
    if raw is () {
        return ();
    }

    // Build a minimal User record from the typed doc
    User u = {
        name: raw.name ?: "",
        password: raw.password ?: "",
        verified: raw.verified ?: false,
        role: raw.role ?: "USER",
        points: raw.points ?: 0,
        eventId: [],
        organizeEventId: []
    };

    // Extract MongoDB _id properly (handles ObjectId and string)
    anydata|() idValue = raw?._id;
    string|() sid = extractIdString(idValue);
    if sid is string {
        u._id = sid;
    }

    // Handle optional phoneNumber
    if raw.phoneNumber is string {
        u.phoneNumber = raw.phoneNumber;
    }

    string[] ev = [];
    if raw.eventId is string[] {
        ev = <string[]>raw.eventId;
    }
    u.eventId = ev;
    string[] org = [];
    if raw.organizeEventId is string[] {
        org = <string[]>raw.organizeEventId;
    }
    u.organizeEventId = org;
    if raw.email is string {
        u.email = raw.email;
    }
    return u;
}

// Function to find any user by email (including unverified - for password reset and registration checks)
public isolated function findAnyUserByEmail(string email) returns ()|User|error {
    map<json> filter = {"email": email};

    UserDoc|error|() raw = userCollection->findOne(filter, targetType = UserDoc);
    if raw is error {
        return error("Error while finding user by email");
    }
    if raw is () {
        return ();
    }

    // Build a minimal User record from the typed doc
    User u = {
        name: raw.name ?: "",
        password: raw.password ?: "",
        verified: raw.verified ?: false,
        role: raw.role ?: "USER",
        points: raw.points ?: 0,
        eventId: [],
        organizeEventId: []
    };

    // Extract MongoDB _id properly (handles ObjectId and string)
    anydata|() idValue = raw?._id;
    string|() sid = extractIdString(idValue);
    if sid is string {
        u._id = sid;
    }

    // Handle optional phoneNumber
    if raw.phoneNumber is string {
        u.phoneNumber = raw.phoneNumber;
    }

    string[] ev = [];
    if raw.eventId is string[] {
        ev = <string[]>raw.eventId;
    }
    u.eventId = ev;
    string[] org = [];
    if raw.organizeEventId is string[] {
        org = <string[]>raw.organizeEventId;
    }
    u.organizeEventId = org;
    if raw.email is string {
        u.email = raw.email;
    }
    return u;
}

// Inserts a new user into the database
public isolated function insertUser(User userData) returns error? {
    check userCollection->insertOne(userData);
}

// Updates user data by phone number
public function updateUserByPhoneNumber(string phoneNumber, map<json> updateData) returns error? {
    mongodb:UpdateResult|error updateResult = userCollection->updateOne(
        {"phoneNumber": phoneNumber},
        {"set": updateData}
    );

    if updateResult is error {
        return error("Error while updating user data");
    }

    if updateResult.matchedCount == 0 {
        return error(string `No user found with phone number: ${phoneNumber}`);
    }
}

// Check existence of a user with a specific role
public function anyUserWithRole(string role) returns boolean|error {
    User|error|() result = userCollection->findOne({"role": role});
    if result is error {
        return error("Error while checking user role existence");
    }
    return !(result is ());
}

// Function to update a user data by email
public isolated function updateUserByEmail(string email, map<json> updateData) returns error? {
    mongodb:UpdateResult|error updateResult = userCollection->updateOne(
        {"email": email},
        {"set": updateData}
    );

    if updateResult is error {
        return error("Error while updating user data");
    }

    if updateResult.matchedCount == 0 {
        return error(string `No user found with email: ${email}`);
    }
}

// Function to delete a user by ID
public function deleteUser(string userId) returns error? {
    mongodb:DeleteResult deleteResult = check userCollection->deleteOne(byUserId(userId));

    if deleteResult.deletedCount == 0 {
        return error(string `No user found with ID: ${userId}`);
    }
}

// Function to delete a user by phone number
public function deleteUserByPhoneNumber(string phoneNumber) returns error? {
    map<json> filter = {"phoneNumber": phoneNumber};
    mongodb:DeleteResult deleteResult = check userCollection->deleteOne(filter);

    if (deleteResult.deletedCount == 0) {
        return error(string `No user found with phone number: ${phoneNumber}`);
    }
}

// Request premium user role
public isolated function requestPremium(http:Caller caller, http:Request req) returns error? {
    // Get user ID from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error userId = token:extractUserId(tokenStr);

    if userId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Check if user exists and has USER role
    UserDoc|error|() user = userCollection->findOne({"email": userId, "role": "USER"});
    if user is error {
        return utils:serverError(caller);
    }
    if user is () {
        return utils:badRequest(caller, "Only regular users can apply for premium status");
    }

    // Update user role to PREMIUM_PENDING (validate transition)
    string currentRole = user.role ?: "USER";
    if !utils:validateRoleTransition(currentRole, "PREMIUM_PENDING") {
        return utils:badRequest(caller, "Invalid role transition");
    }
    mongodb:UpdateResult|error ur = userCollection->updateOne(
        {"email": userId},
        {"set": {"role": "PREMIUM_PENDING", "updatedAt": time:utcToString(time:utcNow())}}
    );
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "User not found");
    }
    check caller->respond(<http:Ok>{body: {status: "REQUESTED"}});
}

// Approve or reject premium
public isolated function approvePremium(http:Caller caller, http:Request req, string userId, boolean approve) returns error? {
    // Get current user data for auditing
    UserDoc|error|() currentUser = userCollection->findOne(byUserId(userId));
    if currentUser is error {
        return utils:serverError(caller);
    }
    if currentUser is () {
        return utils:notFound(caller, "User not found");
    }

    string oldRole = currentUser.role ?: "USER";
    string newRole = approve ? "PREMIUM_USER" : "USER";

    if !utils:validateRoleTransition(oldRole, newRole) {
        return utils:badRequest(caller, "Invalid role transition");
    }

    mongodb:UpdateResult|error ur = userCollection->updateOne(byUserId(userId), {"set": {"role": newRole}});
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "User not found");
    }

    // Get operator info for audit logging
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is string {
        string tokenStr = authHeader.substring(7);
        string|error operatorId = token:extractUserId(tokenStr);

        if operatorId is string {
            // Log role change
            error? auditResult = audit:logRoleChange(
                    userId,
                    operatorId,
                    "ADMIN_OPERATOR",
                    oldRole,
                    newRole,
                        approve ? "Premium application approved" : "Premium application rejected"
            );
            if auditResult is error {
                // Log error but don't fail the operation
            }

            // Send notification to user
            string userEmail = currentUser.email ?: userId;
            error? notifyResult = notifications:notifyPremiumApproval(userEmail, approve);
            if notifyResult is error {
                // Log error but don't fail the operation
            }
        }
    }

    check caller->respond(<http:Ok>{body: {role: newRole}});
}

// Create Admin (by Super Admin)
public isolated function createAdmin(http:Caller caller, http:Request req) returns error? {
    // 1. Input validation
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }

    map<json> m = <map<json>>body;

    // Validate required fields for Admin
    if !m.hasKey("province") {
        return utils:badRequest(caller, "Province is required for Admin");
    }

    // 2. Province validation
    string province = <string>m["province"];
    if !isValidProvince(province) {
        string validProvinces = string:'join(", ", ...VALID_PROVINCES);
        return utils:badRequest(caller, "Invalid province. Valid provinces: " + validProvinces);
    }

    // 3. Business logic - create admin with location-based access control
    string now = time:utcToString(time:utcNow());

    // Validate and hash password
    if !m.hasKey("password") || !utils:validatePasswordComplexity(<string>m["password"]) {
        return utils:badRequest(caller, "Password does not meet complexity requirements");
    }
    string hashed = check bcrypt:hashPassword(<string>m["password"], 5);

    User newAdmin = {
        name: <string>m["name"],
        password: hashed,
        verified: true,
        role: "ADMIN",
        province: province, // Set province for location-based access control
        createdAt: now,
        updatedAt: now
    };

    // Note: _id will be auto-generated by MongoDB

    // Add phoneNumber if provided
    if m["phoneNumber"] is string {
        newAdmin.phoneNumber = <string>m["phoneNumber"];
    }

    // Add email if provided
    if m["email"] is string {
        newAdmin.email = <string>m["email"];
    }

    // Insert new admin into database
    error? r = userCollection->insertOne(newAdmin);
    if r is error {
        return utils:serverError(caller);
    }

    // Audit log
    string operatorId = "";
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is string {
        string tokenStr = authHeader.substring(7);
        string|error extractedOperatorId = token:extractUserId(tokenStr);
        if extractedOperatorId is string {
            operatorId = extractedOperatorId;
        }
    }

    if operatorId != "" {
        string createdEmail = newAdmin.email is string ? <string>newAdmin.email : "";
        // Fire and forget audit log; ignore errors
        error? auditRes = audit:logUserCreation(operatorId, "SUPER_ADMIN", createdEmail, "ADMIN", createdEmail);
        if auditRes is error {
            // Ignore audit errors
        }
    }

    // 4. Success response
    check caller->respond(<http:Ok>{body: {message: "Admin created successfully"}});
}

// Update Admin (by Super Admin)
public isolated function updateAdmin(http:Caller caller, http:Request req, string adminId) returns error? {
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }

    map<json> m = <map<json>>body;
    map<json> updateData = {};

    // Build update data from provided fields
    if m.hasKey("name") {
        updateData["name"] = m["name"];
    }
    if m.hasKey("email") {
        updateData["email"] = m["email"];
    }
    if m.hasKey("phoneNumber") {
        updateData["phoneNumber"] = m["phoneNumber"];
    }

    updateData["updatedAt"] = time:utcToString(time:utcNow());

    map<json> filter = byUserId(adminId);
    filter["role"] = "ADMIN";
    mongodb:UpdateResult|error ur = userCollection->updateOne(filter, {"set": updateData});
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "Admin not found");
    }

    check caller->respond(<http:Ok>{body: {message: "Admin updated successfully"}});
}

// Delete Admin (by Super Admin)
public isolated function deleteAdmin(http:Caller caller, http:Request req, string adminId) returns error? {
    map<json> filter = byUserId(adminId);
    filter["role"] = "ADMIN";
    mongodb:DeleteResult|error deleteResult = userCollection->deleteOne(filter);
    if deleteResult is error {
        return utils:serverError(caller);
    }
    if deleteResult.deletedCount == 0 {
        return utils:notFound(caller, "Admin not found");
    }

    check caller->respond(<http:Ok>{body: {message: "Admin deleted successfully"}});
}

// Get All Admins (by Super Admin)
public function getAllAdmins(http:Caller caller, http:Request req) returns error? {
    stream<UserDoc, error?>|error admins = userCollection->find({"role": "ADMIN"});
    if admins is error {
        return utils:serverError(caller);
    }

    map<anydata>[] adminList = [];
    check admins.forEach(function(UserDoc user) {
        map<anydata> adminInfo = {
            "_id": user?._id,
            "name": user.name,
            "email": user.email,
            "phoneNumber": user.phoneNumber,
            "role": user.role,
            "verified": user.verified,
            "province": user?.province,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt
        };
        adminList.push(adminInfo);
    });

    check caller->respond(<http:Ok>{body: adminList});
}

// Create Admin Operator (by Admin)
public isolated function createAdminOperator(http:Caller caller, http:Request req) returns error? {
    // 1. Input validation
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }
    map<json> m = <map<json>>body;

    // 2. Authentication/Authorization
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error adminEmail = token:extractUserId(tokenStr);
    if adminEmail is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Verify that the requesting user is an ADMIN (not SUPER_ADMIN)
    UserDoc|error|() requestingAdmin = userCollection->findOne({"email": adminEmail}, targetType = UserDoc);
    if requestingAdmin is error {
        return utils:serverError(caller);
    }
    if requestingAdmin is () {
        return utils:unauthorized(caller, "Admin user not found");
    }

    string adminRole = requestingAdmin.role ?: "";
    if adminRole != "ADMIN" {
        return utils:forbidden(caller, "Only ADMINs can create Admin Operators");
    }

    // Get creating admin's province
    [string?, string?]|error adminLocation = getUserLocationContext(adminEmail);
    if adminLocation is error {
        return utils:serverError(caller);
    }

    string? adminProvince = adminLocation[0];
    if adminProvince is () {
        return utils:badRequest(caller, "Admin province not found. Please contact system administrator to set your province.");
    }

    // Validate required fields for Admin Operator
    if !m.hasKey("city") {
        return caller->respond(<http:BadRequest>{body: "City is required for Admin Operator"});
    }

    string city = <string>m["city"];

    string now = time:utcToString(time:utcNow());
    // Validate and hash password
    if !m.hasKey("password") || !utils:validatePasswordComplexity(<string>m["password"]) {
        return utils:badRequest(caller, "Password does not meet complexity requirements");
    }
    string hashed = check bcrypt:hashPassword(<string>m["password"], 5);
    User newAdminOperator = {
        name: <string>m["name"],
        password: hashed,
        verified: true,
        role: "ADMIN_OPERATOR",
        province: adminProvince,
        city: city,
        managedBy: adminEmail,
        createdAt: now,
        updatedAt: now
    };
    // Note: _id will be auto-generated by MongoDB

    // Add phoneNumber if provided
    if m["phoneNumber"] is string {
        newAdminOperator.phoneNumber = <string>m["phoneNumber"];
    }

    // Add email if provided
    if m["email"] is string {
        newAdminOperator.email = <string>m["email"];
    }

    error? r = userCollection->insertOne(newAdminOperator);
    if r is error {
        return utils:serverError(caller);
    }
    check caller->respond(<http:Ok>{body: {message: "Admin Operator created successfully"}});
}

// Update Admin Operator (by Admin)
public isolated function updateAdminOperator(http:Caller caller, http:Request req, string operatorId) returns error? {
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }

    // Get the requesting Admin's information for authorization
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error adminEmail = token:extractUserId(tokenStr);
    if adminEmail is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Check if this operator is managed by the requesting admin
    map<json> checkFilter = byUserId(operatorId);
    checkFilter["role"] = "ADMIN_OPERATOR";
    checkFilter["managedBy"] = adminEmail;

    UserDoc|error|() operator = userCollection->findOne(checkFilter, targetType = UserDoc);
    if operator is error {
        return utils:serverError(caller);
    }
    if operator is () {
        return utils:forbidden(caller, "Cannot modify Admin Operator not managed by you");
    }

    map<json> m = <map<json>>body;
    map<json> updateData = {};

    // Build update data from provided fields
    if m.hasKey("name") {
        updateData["name"] = m["name"];
    }
    if m.hasKey("email") {
        updateData["email"] = m["email"];
    }
    if m.hasKey("phoneNumber") {
        updateData["phoneNumber"] = m["phoneNumber"];
    }
    if m.hasKey("city") {
        updateData["city"] = m["city"];
    } // Allow city updates

    updateData["updatedAt"] = time:utcToString(time:utcNow());

    mongodb:UpdateResult|error ur = userCollection->updateOne(checkFilter, {"set": updateData});
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "Admin Operator not found");
    }

    check caller->respond(<http:Ok>{body: {message: "Admin Operator updated successfully"}});
}

// Delete Admin Operator (by Admin)
public isolated function deleteAdminOperator(http:Caller caller, http:Request req, string operatorId) returns error? {
    // Get the requesting Admin's information for authorization
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error adminEmail = token:extractUserId(tokenStr);
    if adminEmail is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Only allow deletion of operators managed by this admin
    map<json> filter = byUserId(operatorId);
    filter["role"] = "ADMIN_OPERATOR";
    filter["managedBy"] = adminEmail;

    mongodb:DeleteResult|error deleteResult = userCollection->deleteOne(filter);
    if deleteResult is error {
        return utils:serverError(caller);
    }
    if deleteResult.deletedCount == 0 {
        return utils:notFound(caller, "Admin Operator not found or not managed by you");
    }

    check caller->respond(<http:Ok>{body: {message: "Admin Operator deleted successfully"}});
}

// Get All Admin Operators (by Admin)
public function getAllAdminOperators(http:Caller caller, http:Request req) returns error? {
    // Get the requesting Admin's information for location filtering
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error adminEmail = token:extractUserId(tokenStr);
    if adminEmail is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Only show Admin Operators managed by this Admin
    stream<UserDoc, error?>|error operators = userCollection->find({
        "role": "ADMIN_OPERATOR",
        "managedBy": adminEmail
    });
    if operators is error {
        return utils:serverError(caller);
    }

    map<anydata>[] operatorList = [];
    check operators.forEach(function(UserDoc user) {
        map<anydata> operatorInfo = {
            "_id": user?._id,
            "name": user.name,
            "email": user.email,
            "phoneNumber": user.phoneNumber,
            "role": user.role,
            "verified": user.verified,
            "province": user?.province,
            "city": user?.city,
            "managedBy": user?.managedBy,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt
        };
        operatorList.push(operatorInfo);
    });

    check caller->respond(<http:Ok>{body: operatorList});
}

// Get user profile
public function getUserProfile(http:Caller caller, http:Request req) returns error? {
    // Extract requesting user's ID from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error userId = token:extractUserId(tokenStr);

    if userId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Find the user by email (since tokens use email as userId)
    UserDoc|error|() targetUser = userCollection->findOne({"email": userId}, targetType = UserDoc);

    if targetUser is error {
        return utils:serverError(caller);
    }
    if targetUser is () {
        return utils:notFound(caller, "User not found");
    }

    // Build response without password
    map<anydata> userProfile = {
        "_id": targetUser?._id,
        "name": targetUser.name,
        "email": targetUser.email,
        "phoneNumber": targetUser.phoneNumber,
        "role": targetUser.role,
        "verified": targetUser.verified,
        "points": targetUser.points,
        "username": targetUser.username,
        "address": targetUser.address,
        "hometown": targetUser.hometown,
        "livingCity": targetUser.livingCity,
        "gender": targetUser.gender,
        "otpVerified": targetUser.otpVerified,
        "nationalid": targetUser.nationalid,
        "profile_url": targetUser.profile_url,
        "id_photo_url": targetUser.id_photo_url,
        "eventId": targetUser.eventId,
        "organizeEventId": targetUser.organizeEventId
    };

    check caller->respond(<http:Ok>{body: userProfile});
}

// Update user profile
public function updateUserProfile(http:Caller caller, http:Request req) returns error? {
    // Extract requesting user's ID from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error userId = token:extractUserId(tokenStr);

    if userId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }

    map<json> m = <map<json>>body;
    map<json> updateData = {};

    // Build update data from provided fields
    if m.hasKey("name") {
        updateData["name"] = m["name"];
    }
    if m.hasKey("username") {
        updateData["username"] = m["username"];
    }
    if m.hasKey("address") {
        updateData["address"] = m["address"];
    }
    if m.hasKey("hometown") {
        updateData["hometown"] = m["hometown"];
    }
    if m.hasKey("livingCity") {
        updateData["livingCity"] = m["livingCity"];
    }
    if m.hasKey("gender") {
        updateData["gender"] = m["gender"];
    }
    if m.hasKey("nationalid") {
        updateData["nationalid"] = m["nationalid"];
    }
    if m.hasKey("profile_url") {
        updateData["profile_url"] = m["profile_url"];
    }
    if m.hasKey("id_photo_url") {
        updateData["id_photo_url"] = m["id_photo_url"];
    }

    updateData["updatedAt"] = time:utcToString(time:utcNow());

    // Update user by email (since tokens use email as userId)
    mongodb:UpdateResult|error ur = userCollection->updateOne({"email": userId}, {"set": updateData});
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "User not found");
    }

    check caller->respond(<http:Ok>{body: {message: "Profile updated successfully"}});
}

// User search with filters (email, name, role) and pagination
public function searchUsers(http:Caller caller, http:Request req) returns error? {
    map<string[]> queryParams = req.getQueryParams();
    map<json> filter = {};
    int limitCount = 50;
    int skip = 0;

    if queryParams.hasKey("email") {
        string[]? a = queryParams["email"];
        if a is string[] && a.length() > 0 {
            filter["email"] = a[0];
        }
    }
    if queryParams.hasKey("name") {
        string[]? a = queryParams["name"];
        if a is string[] && a.length() > 0 {
            filter["name"] = {"$regex": a[0], "$options": "i"};
        }
    }
    if queryParams.hasKey("role") {
        string[]? a = queryParams["role"];
        if a is string[] && a.length() > 0 {
            filter["role"] = a[0];
        }
    }
    if queryParams.hasKey("limit") {
        string[]? a = queryParams["limit"];
        if a is string[] && a.length() > 0 {
            int|error p = int:fromString(a[0]);
            if p is int {
                limitCount = p;
            }
        }
    }
    if queryParams.hasKey("skip") {
        string[]? a = queryParams["skip"];
        if a is string[] && a.length() > 0 {
            int|error p = int:fromString(a[0]);
            if p is int {
                skip = p;
            }
        }
    }

    stream<UserDoc, error?>|error users = userCollection->find(filter);
    if users is error {
        return utils:serverError(caller);
    }

    map<anydata>[] result = [];
    int skipped = 0;
    int count = 0;
    check users.forEach(function(UserDoc u) {
        if skipped < skip {
            skipped += 1;
            return;
        }
        if count < limitCount {
            result.push({
                "_id": u?._id,
                "name": u.name,
                "email": u.email,
                "phoneNumber": u.phoneNumber,
                "role": u.role,
                "verified": u.verified,
                "createdAt": u.createdAt
            });
            count += 1;
        }
    });

    check caller->respond(<http:Ok>{body: result});
}

// Get users by role (admin function)
public function getUsersByRole(http:Caller caller, http:Request req, string role) returns error? {
    stream<UserDoc, error?>|error users = userCollection->find({"role": role});
    if users is error {
        return utils:serverError(caller);
    }

    map<anydata>[] userList = [];
    check users.forEach(function(UserDoc user) {
        map<anydata> userInfo = {
            "_id": user?._id,
            "name": user.name,
            "email": user.email,
            "phoneNumber": user.phoneNumber,
            "role": user.role,
            "verified": user.verified,
            "points": user.points
        };
        userList.push(userInfo);
    });

    check caller->respond(<http:Ok>{body: userList});
}

// Get pending premium user requests
public function getPendingPremiumRequests(http:Caller caller, http:Request req) returns error? {
    stream<UserDoc, error?>|error users = userCollection->find({"role": "PREMIUM_PENDING"});
    if users is error {
        return utils:serverError(caller);
    }

    map<anydata>[] userList = [];
    check users.forEach(function(UserDoc user) {
        map<anydata> userInfo = {
            "_id": user?._id,
            "name": user.name,
            "email": user.email,
            "phoneNumber": user.phoneNumber,
            "role": user.role,
            "verified": user.verified
        };
        userList.push(userInfo);
    });

    check caller->respond(<http:Ok>{body: userList});
}

