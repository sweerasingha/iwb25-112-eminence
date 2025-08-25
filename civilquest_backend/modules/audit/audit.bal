import civilquest_api.database;

import ballerina/lang.value as value;
import ballerina/time;
import ballerina/uuid;
import ballerinax/mongodb;

type BsonDoc record {|
    anydata...;
|};

public type AuditLog record {|
    string? _id?;
    string userId;
    string userRole;
    string action;
    string resourceType;
    string? resourceId?;
    json? oldData?;
    json? newData?;
    string timestamp;
    string? ipAddress?;
    string? userAgent?;
    string? description?;
    json...;
|};

final mongodb:Collection auditCollection;

function init() returns error? {
    auditCollection = check database:db->getCollection("audit_logs");
}

public type AuditLogQueryParams record {|
    string? userId;
    string? action;
    string? resourceType;
    string? startDate;
    string? endDate;
    int limitCount;
    int skipCount;
|};

// Parse audit log related query params into a strongly typed record
// Applies defaults: limit=100, skip=0
public isolated function parseAuditLogQueryParams(map<string[]> params) returns AuditLogQueryParams {
    string? userId = ();
    string? action = ();
    string? resourceType = ();
    string? startDate = ();
    string? endDate = ();
    int limitCount = 100;
    int skipCount = 0;

    if params.hasKey("userId") {
        string[]? arr = params["userId"];
        if arr is string[] && arr.length() > 0 {
            userId = arr[0];
        }
    }
    if params.hasKey("action") {
        string[]? arr = params["action"];
        if arr is string[] && arr.length() > 0 {
            action = arr[0];
        }
    }
    if params.hasKey("resourceType") {
        string[]? arr = params["resourceType"];
        if arr is string[] && arr.length() > 0 {
            resourceType = arr[0];
        }
    }
    if params.hasKey("startDate") {
        string[]? arr = params["startDate"];
        if arr is string[] && arr.length() > 0 {
            startDate = arr[0];
        }
    }
    if params.hasKey("endDate") {
        string[]? arr = params["endDate"];
        if arr is string[] && arr.length() > 0 {
            endDate = arr[0];
        }
    }
    if params.hasKey("limit") {
        string[]? arr = params["limit"];
        if arr is string[] && arr.length() > 0 {
            int|error parsed = int:fromString(arr[0]);
            if parsed is int {
                limitCount = parsed;
            }
        }
    }
    if params.hasKey("skip") {
        string[]? arr = params["skip"];
        if arr is string[] && arr.length() > 0 {
            int|error parsed = int:fromString(arr[0]);
            if parsed is int {
                skipCount = parsed;
            }
        }
    }

    return {userId, action, resourceType, startDate, endDate, limitCount, skipCount};
}

// Logs administrative actions for audit trail
public isolated function logAdminAction(
        string userId,
        string userRole,
        string action,
        string resourceType,
        string? resourceId = (),
        json? oldData = (),
        json? newData = (),
        string? description = (),
        string? ipAddress = (),
        string? userAgent = ()
) returns error? {

    string auditId = uuid:createRandomUuid();
    string now = time:utcToString(time:utcNow());

    AuditLog auditEntry = {
        _id: auditId,
        userId: userId,
        userRole: userRole,
        action: action,
        resourceType: resourceType,
        resourceId: resourceId,
        oldData: oldData,
        newData: newData,
        timestamp: now,
        ipAddress: ipAddress,
        userAgent: userAgent,
        description: description
    };

    error? insertResult = auditCollection->insertOne(auditEntry);
    if insertResult is error {
        return insertResult;
    }
}

// Logs user role changes for audit trail
public isolated function logRoleChange(
        string userId,
        string adminUserId,
        string adminRole,
        string oldRole,
        string newRole,
        string? reason = ()
) returns error? {

    json oldData = {
        "role": oldRole
    };

    json newData = {
        "role": newRole
    };

    string description = "Role changed from " + oldRole + " to " + newRole;
    if reason is string {
        description = description + ". Reason: " + reason;
    }

    check logAdminAction(
            adminUserId,
            adminRole,
            "ROLE_CHANGE",
            "USER",
            userId,
            oldData,
            newData,
            description
    );
}

// Log event approval/rejection
public isolated function logEventApproval(
        string operatorId,
        string eventId,
        boolean approved,
        string? reason = ()
) returns error? {

    string action = approved ? "EVENT_APPROVE" : "EVENT_REJECT";
    json newData = {
        "status": approved ? "APPROVED" : "REJECTED"
    };

    string description = "Event " + (approved ? "approved" : "rejected");
    if reason is string {
        description = description + ". Reason: " + reason;
    }

    check logAdminAction(
            operatorId,
            "ADMIN_OPERATOR",
            action,
            "EVENT",
            eventId,
            (),
            newData,
            description
    );
}

// Log sponsorship approval/rejection
public isolated function logSponsorshipApproval(
        string operatorId,
        string sponsorId,
        boolean approved,
        string? reason = ()
) returns error? {

    string action = approved ? "SPONSORSHIP_APPROVE" : "SPONSORSHIP_REJECT";
    json newData = {
        "approved": approved
    };

    string description = "Sponsorship " + (approved ? "approved" : "rejected");
    if reason is string {
        description = description + ". Reason: " + reason;
    }

    check logAdminAction(
            operatorId,
            "ADMIN_OPERATOR",
            action,
            "SPONSORSHIP",
            sponsorId,
            (),
            newData,
            description
    );
}

// Log premium user approval/rejection
public isolated function logPremiumApproval(
        string operatorId,
        string userId,
        boolean approved,
        string? reason = ()
) returns error? {

    string action = approved ? "PREMIUM_APPROVE" : "PREMIUM_REJECT";
    json newData = {
        "role": approved ? "PREMIUM_USER" : "USER"
    };

    string description = "Premium status " + (approved ? "approved" : "rejected");
    if reason is string {
        description = description + ". Reason: " + reason;
    }

    check logAdminAction(
            operatorId,
            "ADMIN_OPERATOR",
            action,
            "USER",
            userId,
            (),
            newData,
            description
    );
}

// Log points adjustment
public isolated function logPointsAdjustment(
        string adminId,
        string adminRole,
        string userId,
        int oldPoints,
        int newPoints,
        string reason
) returns error? {

    json oldData = {
        "points": oldPoints
    };

    json newData = {
        "points": newPoints
    };

    check logAdminAction(
            adminId,
            adminRole,
            "POINTS_ADJUST",
            "USER",
            userId,
            oldData,
            newData,
            reason
    );
}

// Log user creation (admin, admin operator)
public isolated function logUserCreation(
        string creatorId,
        string creatorRole,
        string newUserId,
        string newUserRole,
        string newUserEmail
) returns error? {

    json newData = {
        "role": newUserRole,
        "email": newUserEmail
    };

    string description = "Created new " + newUserRole + " user: " + newUserEmail;

    check logAdminAction(
            creatorId,
            creatorRole,
            "USER_CREATE",
            "USER",
            newUserId,
            (),
            newData,
            description
    );
}

// Log user deletion
public isolated function logUserDeletion(
        string deletorId,
        string deletorRole,
        string deletedUserId,
        string deletedUserRole,
        string deletedUserEmail
) returns error? {

    json oldData = {
        "role": deletedUserRole,
        "email": deletedUserEmail
    };

    string description = "Deleted " + deletedUserRole + " user: " + deletedUserEmail;

    check logAdminAction(
            deletorId,
            deletorRole,
            "USER_DELETE",
            "USER",
            deletedUserId,
            oldData,
            (),
            description
    );
}

// Get audit logs with filtering
public function getAuditLogs(
        string? userId = (),
        string? action = (),
        string? resourceType = (),
        string? startDate = (),
        string? endDate = (),
        int limitCount = 100,
        int skipCount = 0
) returns AuditLog[]|error {
    map<json> filter = {};

    if userId is string {
        filter["userId"] = userId;
    }

    if action is string {
        filter["action"] = action;
    }

    if resourceType is string {
        filter["resourceType"] = resourceType;
    }

    if startDate is string && endDate is string {
        filter["timestamp"] = {
            "$gte": startDate,
            "$lte": endDate
        };
    } else if startDate is string {
        filter["timestamp"] = {
            "$gte": startDate
        };
    } else if endDate is string {
        filter["timestamp"] = {
            "$lte": endDate
        };
    }

    mongodb:FindOptions findOptions = {
        sort: {"timestamp": -1} // Most recent first
    };

    stream<BsonDoc, error?>|error auditStream = auditCollection->find(filter, findOptions);
    if auditStream is error {
        return auditStream;
    }

    AuditLog[] auditLogs = [];
    int count = 0;
    int skipped = 0;

    error? foreachErr = auditStream.forEach(function(BsonDoc doc) {
        if doc.hasKey("_id") {
            anydata v = doc["_id"];
            if v is map<json> {
                json? maybeOid = v["$oid"];
                if maybeOid is string {
                    doc["_id"] = maybeOid;
                } else {
                    string|error sid = value:toString(v);
                    doc["_id"] = sid is string ? sid : ();
                }
            } else if !(v is string) {
                string|error sid = value:toString(v);
                doc["_id"] = sid is string ? sid : ();
            }
        }

        if doc.hasKey("timestamp") {
            anydata ts = doc["timestamp"];
            if ts is map<json> {
                json? dateVal = ts["$date"];
                if dateVal is string {
                    doc["timestamp"] = dateVal;
                } else if dateVal is int|float|decimal {
                    doc["timestamp"] = value:toString(dateVal);
                }
            } else if !(ts is string) {
                string|error s = value:toString(ts);
                if s is string {
                    doc["timestamp"] = s;
                }
            }
        }

        AuditLog|error decoded = value:fromJsonWithType(<json>doc, AuditLog);
        if decoded is error {
            return;
        }

        if skipped < skipCount {
            skipped += 1;
            return;
        }

        if count < limitCount {
            auditLogs.push(decoded);
            count += 1;
        }
    });

    if foreachErr is error {
        return foreachErr;
    }

    return auditLogs;
}

// Get audit log count
public function getAuditLogCount(
        string? userId = (),
        string? action = (),
        string? resourceType = (),
        string? startDate = (),
        string? endDate = ()
) returns int|error {

    map<json> filter = {};

    if userId is string {
        filter["userId"] = userId;
    }

    if action is string {
        filter["action"] = action;
    }

    if resourceType is string {
        filter["resourceType"] = resourceType;
    }

    if startDate is string && endDate is string {
        filter["timestamp"] = {
            "$gte": startDate,
            "$lte": endDate
        };
    } else if startDate is string {
        filter["timestamp"] = {
            "$gte": startDate
        };
    } else if endDate is string {
        filter["timestamp"] = {
            "$lte": endDate
        };
    }

    int|error count = auditCollection->countDocuments(filter);
    return count;
}

