import civilquest_api.database;
import civilquest_api.token;
import civilquest_api.utils;

import ballerina/http;
import ballerina/time;
import ballerina/uuid;
import ballerinax/mongodb;

// Safely extract string values from json or anydata
function safeGetString(anydata|() v) returns string {
    if v is string {
        return v;
    }
    return "";
}

// Lexicographic string compare: returns true if a < b
function stringLess(string a, string b) returns boolean {
    // Basic lexicographic comparison using substring; OK for typical ASCII names
    int i = 0;
    int al = a.length();
    int bl = b.length();
    while i < al && i < bl {
        string ca = a.substring(i, i + 1);
        string cb = b.substring(i, i + 1);
        if ca != cb {
            return ca < cb;
        }
        i += 1;
    }
    return al < bl;
}

// Utility function to safely convert JSON points value to int
function safeConvertPoints(anydata|() pointsValue) returns int {
    if pointsValue == () {
        return 0;
    }

    if pointsValue is int {
        return pointsValue;
    } else if pointsValue is float {
        return <int>pointsValue;
    } else if pointsValue is string {
        int|error parsed = int:fromString(pointsValue);
        return parsed is int ? parsed : 0;
    }

    return 0;
}

// Minimal user document shape for MongoDB lookups in this module
type UserLite record {|
    anydata|() _id?;
    string email?;
    int points?;
    anydata...;
|};

// Generic document type for Mongo streams
type AnyDoc record {|
    anydata...;
|};

// Typed projection for leaderboard
public type RankUser record {|
    string email = "";
    string name = "";
    string livingCity = "";
    int points = 0;
|};

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

// Point transaction types
public enum PointTransactionType {
    EVENT_CREATION,
    EVENT_PARTICIPATION,
    EVENT_COMPLETION,
    ADMINISTRATIVE_ADD,
    ADMINISTRATIVE_DEDUCT,
    BONUS_AWARD,
    PENALTY_DEDUCT
}

// Point transaction record for audit trail
public type PointTransaction record {|
    string _id;
    string id;
    string userId;
    string userEmail;
    PointTransactionType transactionType;
    int pointsAwarded;
    int previousBalance;
    int newBalance;
    string? eventId;
    string? adminId;
    string description;
    string createdAt;
    json metadata?;
|};

// Points configuration record
public type PointsConfig record {|
    string _id;
    string id;
    int eventCreationPoints;
    int eventParticipationPoints;
    int eventCompletionBonusPoints;
    int eventApprovalBonusPoints;
    int sponsorshipBonusPoints;
    boolean allowNegativeBalance;
    int maxDailyPointsPerUser;
    string lastUpdatedBy;
    string updatedAt;
    string createdAt;
|};

final mongodb:Collection pointTransactionCollection;
final mongodb:Collection pointsConfigCollection;
final mongodb:Collection userCollection;

function init() returns error? {
    pointTransactionCollection = check database:db->getCollection("point_transactions");
    pointsConfigCollection = check database:db->getCollection("points_config");
    userCollection = check database:db->getCollection("users");

    // Initialize default points configuration if it doesn't exist
    error? initResult = initializeDefaultPointsConfig();
    if initResult is error {
        // Log error but don't fail module initialization
    }
}

// Leaderboard/Scoreboard: returns users ranked by points with optional city filter and pagination
public function getLeaderboard(http:Caller caller, http:Request req) returns error? {
    // Auth optional; no role restriction for viewing leaderboard
    map<string[]> query = req.getQueryParams();
    string? city = ();
    int limitCount = 50;
    int skipCount = 0;

    if query.hasKey("city") {
        string[]? a = query["city"];
        if a is string[] && a.length() > 0 {
            city = a[0];
        }
    }
    if query.hasKey("limit") {
        string[]? a = query["limit"];
        if a is string[] && a.length() > 0 {
            int|error v = int:fromString(a[0]);
            if v is int {
                limitCount = v;
            }
        }
    }
    if query.hasKey("skip") {
        string[]? a = query["skip"];
        if a is string[] && a.length() > 0 {
            int|error v = int:fromString(a[0]);
            if v is int {
                skipCount = v;
            }
        }
    }

    // Build base filter
    map<json> filter = {"role": {"$in": ["USER", "PREMIUM_USER"]}};
    if city is string {
        filter["livingCity"] = city;
    }

    // Fetch all matching users into array to compute ranks
    stream<AnyDoc, error?>|error usersStream = userCollection->find(filter, targetType = AnyDoc);
    if usersStream is error {
        return utils:serverError(caller);
    }

    RankUser[] users = [];
    check usersStream.forEach(function(AnyDoc u) {
        RankUser ru = {
            email: safeGetString(u["email"]),
            name: safeGetString(u["name"]),
            livingCity: safeGetString(u["livingCity"]),
            points: safeConvertPoints(u["points"])
        };
        users.push(ru);
    });

    // Defensive: filter out any entries with missing email to avoid sort/compare surprises
    RankUser[] cleanUsers = [];
    foreach RankUser u in users {
        if u.email != "" {
            cleanUsers.push(u);
        }
    }
    users = cleanUsers;

    // Manual selection sort by points desc, then name asc
    int i = 0;
    while i < users.length() {
        int maxIdx = i;
        int j = i + 1;
        while j < users.length() {
            RankUser a = users[j];
            RankUser b = users[maxIdx];
            // Compare by points desc, then name asc using local compare
            string an = a.name;
            string bn = b.name;
            boolean better = a.points > b.points || (a.points == b.points && stringLess(an, bn));
            if better {
                maxIdx = j;
            }
            j += 1;
        }
        if maxIdx != i {
            RankUser tmp = users[i];
            users[i] = users[maxIdx];
            users[maxIdx] = tmp;
        }
        i += 1;
    }

    // Compute global rank across all eligible users (USER, PREMIUM_USER), regardless of city
    map<json> globalFilter = {"role": {"$in": ["USER", "PREMIUM_USER"]}};
    stream<AnyDoc, error?>|error allUsersStream = userCollection->find(globalFilter, targetType = AnyDoc);
    RankUser[] allUsers = [];
    if allUsersStream is stream<AnyDoc, error?> {
        check allUsersStream.forEach(function(AnyDoc u) {
            RankUser ru = {
                email: safeGetString(u["email"]),
                name: safeGetString(u["name"]),
                livingCity: safeGetString(u["livingCity"]),
                points: safeConvertPoints(u["points"])
            };
            allUsers.push(ru);
        });
        // total count not used in response currently
        // Manual selection sort by points desc
        int ai = 0;
        while ai < allUsers.length() {
            int maxIdx = ai;
            int aj = ai + 1;
            while aj < allUsers.length() {
                if allUsers[aj].points > allUsers[maxIdx].points {
                    maxIdx = aj;
                }
                aj += 1;
            }
            if maxIdx != ai {
                RankUser t = allUsers[ai];
                allUsers[ai] = allUsers[maxIdx];
                allUsers[maxIdx] = t;
            }
            ai += 1;
        }
    } else {
    }

    // Prepare ranked slice
    int end = (skipCount + limitCount) < users.length() ? (skipCount + limitCount) : users.length();
    map<json>[] page = [];
    int idx = skipCount;
    while idx < end {
        RankUser u = users[idx];
        string email = u.email;
        int pointsVal = u.points;
        string name = u.name;
        string livingCity = u.livingCity;

        // city rank is based on current filtered list ordering (users)
        int cityRank = idx + 1;

        // compute global rank by looking up position in allUsers (first index where email matches)
        int globalRank = 0;
        int gi = 0;
        while gi < allUsers.length() {
            RankUser gu = allUsers[gi];
            if gu.email == email {
                globalRank = gi + 1;
                break;
            }
            gi += 1;
        }

        page.push({
            "email": email,
            "name": name,
            "points": pointsVal,
            "livingCity": livingCity,
            "rank": city is string ? cityRank : globalRank,
            "globalRank": globalRank,
            "cityRank": cityRank
        });
        idx += 1;
    }

    // Determine logged-in user (optional) and compute their ranks
    string? meEmail = ();
    string? meName = ();
    string? meCity = ();
    int mePoints = 0;
    int myGlobalRank = 0;
    int myCityRank = 0;

    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is string && authHeader.length() > 7 {
        string tokenStr = authHeader.substring(7);
        string|error userIdFromToken = token:extractUserId(tokenStr);
        if userIdFromToken is string {
            string emailMe = userIdFromToken;
            // find in allUsers for global rank and details
            int gi2 = 0;
            while gi2 < allUsers.length() {
                RankUser gu2 = allUsers[gi2];
                if gu2.email == emailMe {
                    meEmail = gu2.email;
                    meName = gu2.name;
                    meCity = gu2.livingCity;
                    mePoints = gu2.points;
                    myGlobalRank = gi2 + 1;
                    break;
                }
                gi2 += 1;
            }
            // find in filtered list for city rank when applicable
            if city is string {
                int ci2 = 0;
                while ci2 < users.length() {
                    if users[ci2].email == emailMe {
                        myCityRank = ci2 + 1;
                        break;
                    }
                    ci2 += 1;
                }
            }
        }
    }

    map<json> resp = {
        "scope": city is string ? "city" : "global",
        "city": city is string ? <string>city : "",
        "total": users.length(),
        "skip": skipCount,
        "limit": limitCount,
        "results": page
    };

    if meEmail is string {
        map<json> meObj = {
            "email": meEmail,
            "name": meName is string ? <string>meName : "",
            "livingCity": meCity is string ? <string>meCity : "",
            "points": mePoints,
            "globalRank": myGlobalRank,
            "cityRank": myCityRank,
            "rank": city is string ? (myCityRank > 0 ? myCityRank : 0) : (myGlobalRank > 0 ? myGlobalRank : 0)
        };
        resp["me"] = meObj;
    }

    check caller->respond(<http:Ok>{body: resp});
}

// Initialize default points configuration
function initializeDefaultPointsConfig() returns error? {
    PointsConfig|error|() existingConfig = pointsConfigCollection->findOne({});

    if existingConfig is () {
        // Create default configuration
        string now = time:utcToString(time:utcNow());
        string configId = uuid:createRandomUuid();

        PointsConfig defaultConfig = {
            _id: configId,
            id: configId,
            eventCreationPoints: 50,
            eventParticipationPoints: 0,
            eventCompletionBonusPoints: 25,
            eventApprovalBonusPoints: 50,
            sponsorshipBonusPoints: 30,
            allowNegativeBalance: false,
            maxDailyPointsPerUser: 500,
            lastUpdatedBy: "SYSTEM",
            updatedAt: now,
            createdAt: now
        };

        error? insertResult = pointsConfigCollection->insertOne(defaultConfig);
        return insertResult;
    }

    return ();
}

// Awards points to a user with transaction logging and balance update
public function awardPoints(string userEmail, PointTransactionType transactionType, int points,
        string description, string? eventId = (), string? adminId = ()) returns error? {

    if points <= 0 {
        return error("Points to award must be positive");
    }

    // Get current user using typed findOne (avoids unsupported map type in streams)
    UserLite|error|() user = userCollection->findOne({"email": userEmail}, targetType = UserLite);
    if user is error {
        return error("Failed to query user: " + user.message());
    }
    if user is () {
        return error("User not found");
    }
    int currentPoints = user.points ?: 0;
    string|() extractedId = extractIdString(user?._id);
    string resolvedUserId = extractedId is string ? extractedId : (user.email ?: userEmail);
    int newBalance = currentPoints + points;

    // Check daily points limit
    PointsConfig|error config = getCurrentPointsConfig();
    if config is PointsConfig {
        error? dailyLimitCheck = checkDailyPointsLimit(userEmail, points, config.maxDailyPointsPerUser);
        if dailyLimitCheck is error {
            return dailyLimitCheck;
        }
    }

    string now = time:utcToString(time:utcNow());
    string transactionId = uuid:createRandomUuid();

    // Create transaction record
    PointTransaction transactionRecord = {
        _id: transactionId,
        id: transactionId,
        userId: resolvedUserId,
        userEmail: userEmail,
        transactionType: transactionType,
        pointsAwarded: points,
        previousBalance: currentPoints,
        newBalance: newBalance,
        eventId: eventId,
        adminId: adminId,
        description: description,
        createdAt: now
    };

    // Insert transaction record
    error? transactionResult = pointTransactionCollection->insertOne(transactionRecord);
    if transactionResult is error {
        return error("Failed to create transaction record: " + transactionResult.message());
    }

    // Update user's points
    mongodb:UpdateResult|error updateResult = userCollection->updateOne(
        {"email": userEmail},
        {"set": {"points": newBalance}}
    );

    if updateResult is error {
        return error("Failed to update user points: " + updateResult.message());
    }

    return ();
}

// Deduct points from a user with transaction logging
public function deductPoints(string userEmail, PointTransactionType transactionType, int points,
        string description, string? eventId = (), string? adminId = ()) returns error? {

    if points <= 0 {
        return error("Points to deduct must be positive");
    }

    // Get current user using typed findOne (avoids unsupported map type in streams)
    UserLite|error|() user = userCollection->findOne({"email": userEmail}, targetType = UserLite);
    if user is error {
        return error("Failed to query user: " + user.message());
    }
    if user is () {
        return error("User not found");
    }

    int currentPoints = user.points ?: 0;
    string|() extractedId = extractIdString(user?._id);
    string resolvedUserId = extractedId is string ? extractedId : (user.email ?: userEmail);
    int newBalance = currentPoints - points;

    // Check if negative balance is allowed
    PointsConfig|error config = getCurrentPointsConfig();
    if config is PointsConfig && !config.allowNegativeBalance && newBalance < 0 {
        return error("Insufficient points. Current balance: " + currentPoints.toString() +
                    ", attempting to deduct: " + points.toString());
    }

    string now = time:utcToString(time:utcNow());
    string transactionId = uuid:createRandomUuid();

    // Create transaction record
    PointTransaction transactionRecord = {
        _id: transactionId,
        id: transactionId,
        userId: resolvedUserId,
        userEmail: userEmail,
        transactionType: transactionType,
        pointsAwarded: -points,
        previousBalance: currentPoints,
        newBalance: newBalance,
        eventId: eventId,
        adminId: adminId,
        description: description,
        createdAt: now
    };

    // Insert transaction record
    error? transactionResult = pointTransactionCollection->insertOne(transactionRecord);
    if transactionResult is error {
        return error("Failed to create transaction record: " + transactionResult.message());
    }

    // Update user's points
    mongodb:UpdateResult|error updateResult = userCollection->updateOne(
        {"email": userEmail},
        {"set": {"points": newBalance}}
    );

    if updateResult is error {
        return error("Failed to update user points: " + updateResult.message());
    }

    return ();
}

// Check daily points limit for a user
function checkDailyPointsLimit(string userEmail, int pointsToAdd, int maxDailyPoints) returns error? {
    string today = time:utcToString(time:utcNow()).substring(0, 10); // Get YYYY-MM-DD format

    // Get today's transactions for this user
    stream<PointTransaction, error?>|error transactions = pointTransactionCollection->find({
        "userEmail": userEmail,
        "createdAt": {"$regex": "^" + today}
    });

    if transactions is error {
        return ();
    }

    int todaysTotalPoints = 0;
    check transactions.forEach(function(PointTransaction transactionRecord) {
        if transactionRecord.pointsAwarded > 0 { // Only count positive point awards
            todaysTotalPoints += transactionRecord.pointsAwarded;
        }
    });

    if (todaysTotalPoints + pointsToAdd) > maxDailyPoints {
        return error("Daily points limit exceeded. Today's points: " + todaysTotalPoints.toString() +
                    ", limit: " + maxDailyPoints.toString());
    }

    return ();
}

// Get current points configuration
public isolated function getCurrentPointsConfig() returns PointsConfig|error {
    PointsConfig|error|() config = pointsConfigCollection->findOne({});
    if config is error {
        return error("Failed to retrieve points configuration: " + config.message());
    }
    if config is () {
        return error("Points configuration not found");
    }
    return config;
}

// Get points history for a user
public function getPointsHistory(http:Caller caller, http:Request req, string userEmail) returns error? {
    // Get user role from token for authorization
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error role = token:extractRole(tokenStr);
    string|error tokenUserId = token:extractUserId(tokenStr);

    if role is error || tokenUserId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Users can only view their own history, admins can view any user's history
    if role != "ADMIN" && role != "ADMIN_OPERATOR" && tokenUserId != userEmail {
        return utils:forbidden(caller, "Can only view your own points history");
    }

    // Get query parameters for pagination and filtering
    map<string[]> queryParams = req.getQueryParams();
    int 'limit = 50; // Default limit
    int offset = 0; // Default offset

    if queryParams.hasKey("limit") {
        string[]? limitArray = queryParams["limit"];
        if limitArray is string[] && limitArray.length() > 0 {
            int|error limitResult = int:fromString(limitArray[0]);
            if limitResult is int {
                'limit = limitResult;
            }
        }
    }

    if queryParams.hasKey("offset") {
        string[]? offsetArray = queryParams["offset"];
        if offsetArray is string[] && offsetArray.length() > 0 {
            int|error offsetResult = int:fromString(offsetArray[0]);
            if offsetResult is int {
                offset = offsetResult;
            }
        }
    }

    // Build filter for transaction type if specified
    map<json> filter = {"userEmail": userEmail};
    if queryParams.hasKey("transactionType") {
        string[]? typeArray = queryParams["transactionType"];
        if typeArray is string[] && typeArray.length() > 0 {
            filter["transactionType"] = typeArray[0];
        }
    }

    // Get transactions with pagination
    stream<PointTransaction, error?>|error transactions = pointTransactionCollection->find(filter);

    if transactions is error {
        return utils:serverError(caller, "Server error retrieving points history");
    }

    PointTransaction[] transactionList = [];
    check transactions.forEach(function(PointTransaction transactionRecord) {
        transactionList.push(transactionRecord);
    });

    // Get current user points for summary
    map<json>|error|() userResult = userCollection->findOne({"email": userEmail});
    int currentPoints = 0;
    if userResult is map<json> {
        currentPoints = safeConvertPoints(userResult["points"]);
    }

    json response = {
        "userEmail": userEmail,
        "currentPoints": currentPoints,
        "transactions": transactionList,
        "pagination": {
            "limit": 'limit,
            "offset": offset,
            "totalTransactions": transactionList.length()
        }
    };

    check caller->respond(<http:Ok>{body: response});
}

// Get points configuration (admin only)
public isolated function getPointsConfig(http:Caller caller, http:Request req) returns error? {
    // Get user role from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error role = token:extractRole(tokenStr);

    if role is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Only admins can view configuration
    if role != "ADMIN" && role != "ADMIN_OPERATOR" {
        return utils:forbidden(caller, "Admin access required");
    }

    PointsConfig|error config = getCurrentPointsConfig();
    if config is error {
        return utils:serverError(caller, "Failed to retrieve points configuration");
    }

    check caller->respond(<http:Ok>{body: config});
}

// Update points configuration (admin only)
public function updatePointsConfig(http:Caller caller, http:Request req) returns error? {
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }

    // Get user role from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error role = token:extractRole(tokenStr);
    string|error adminId = token:extractUserId(tokenStr);

    if role is error || adminId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Only admins can update configuration
    if role != "ADMIN" {
        return utils:forbidden(caller, "Admin access required");
    }

    map<json> m = <map<json>>body;
    map<json> updateData = {};

    // Build update data from provided fields
    if m.hasKey("eventCreationPoints") {
        updateData["eventCreationPoints"] = m["eventCreationPoints"];
    }
    if m.hasKey("eventParticipationPoints") {
        updateData["eventParticipationPoints"] = m["eventParticipationPoints"];
    }
    if m.hasKey("eventCompletionBonusPoints") {
        updateData["eventCompletionBonusPoints"] = m["eventCompletionBonusPoints"];
    }
    if m.hasKey("eventApprovalBonusPoints") {
        updateData["eventApprovalBonusPoints"] = m["eventApprovalBonusPoints"];
    }
    if m.hasKey("sponsorshipBonusPoints") {
        updateData["sponsorshipBonusPoints"] = m["sponsorshipBonusPoints"];
    }
    if m.hasKey("allowNegativeBalance") {
        updateData["allowNegativeBalance"] = m["allowNegativeBalance"];
    }
    if m.hasKey("maxDailyPointsPerUser") {
        updateData["maxDailyPointsPerUser"] = m["maxDailyPointsPerUser"];
    }

    updateData["lastUpdatedBy"] = adminId;
    updateData["updatedAt"] = time:utcToString(time:utcNow());

    mongodb:UpdateResult|error updateResult = pointsConfigCollection->updateOne({}, {"set": updateData});
    if updateResult is error {
        return utils:serverError(caller, "Failed to update points configuration");
    }

    if updateResult.matchedCount == 0 {
        return utils:notFound(caller, "Points configuration not found");
    }

    check caller->respond(<http:Ok>{body: {message: "Points configuration updated successfully"}});
}

// Administrative function to manually award/deduct points (admin only)
public function adminAdjustPoints(http:Caller caller, http:Request req) returns error? {
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }

    // Get user role from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error role = token:extractRole(tokenStr);
    string|error adminId = token:extractUserId(tokenStr);

    if role is error || adminId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Only admins can manually adjust points
    if role != "ADMIN" && role != "ADMIN_OPERATOR" {
        return utils:forbidden(caller, "Admin access required");
    }

    map<json> m = <map<json>>body;
    string userEmail = <string>m["userEmail"];
    int pointsAdjustment = <int>m["pointsAdjustment"];
    string reason = <string>m["reason"];

    if pointsAdjustment == 0 {
        return utils:badRequest(caller, "Points adjustment cannot be zero");
    }

    error? result;
    if pointsAdjustment > 0 {
        result = awardPoints(
                userEmail,
                ADMINISTRATIVE_ADD,
                pointsAdjustment,
                "Administrative adjustment: " + reason,
                adminId = adminId
        );
    } else {
        result = deductPoints(
                userEmail,
                ADMINISTRATIVE_DEDUCT,
                -pointsAdjustment,
                "Administrative adjustment: " + reason,
                adminId = adminId
        );
    }

    if result is error {
        return utils:badRequest(caller, result.message());
    }

    check caller->respond(<http:Ok>{
        body: {
            message: "Points adjusted successfully",
            userEmail: userEmail,
            pointsAdjustment: pointsAdjustment,
            reason: reason
        }
    });
}

