//System integrity checks, initial data seeding (e.g., SUPER_ADMIN), and maintenance utilities
import civilquest_api.bcrypt;
import civilquest_api.database;

import ballerina/log;
import ballerina/time;
import ballerinax/mongodb;

// Flexible typed document shape for reading from MongoDB
type UserDoc record {|
    string|anydata _id?;
    string name?;
    string password?;
    string role?;
    string email?;
    anydata...;
|};

final mongodb:Collection userCollection;

function init() returns error? {
    userCollection = check database:db->getCollection("users");
}

// Bootstrap function to create initial SUPER_ADMIN if none exists
public function ensureSuperAdminExists() returns error? {
    // Check if SUPER_ADMIN already exists
    UserDoc|error|() existingSuperAdmin = userCollection->findOne({"role": "SUPER_ADMIN"});

    if existingSuperAdmin is error {
        log:printError("Error checking for existing SUPER_ADMIN: " + existingSuperAdmin.message());
        return error("Failed to check for existing SUPER_ADMIN");
    }

    if existingSuperAdmin is () {
        // No SUPER_ADMIN exists, create one
        log:printInfo("No SUPER_ADMIN found. Creating initial SUPER_ADMIN...");

        string hashedPassword = check bcrypt:hashPassword("SuperAdmin123!", 5);
        string now = time:utcToString(time:utcNow());

        map<json> superAdminUser = {
            "name": "System Super Administrator",
            "email": "superadmin@civilquest.com",
            "password": hashedPassword,
            "verified": true,
            "role": "SUPER_ADMIN",
            "points": 0,
            "eventId": [],
            "organizeEventId": [],
            "otpVerified": true,
            "createdAt": now,
            "updatedAt": now
        };

        error? insertResult = userCollection->insertOne(superAdminUser);
        if insertResult is error {
            log:printError("Failed to create initial SUPER_ADMIN: " + insertResult.message());
            return error("Failed to create initial SUPER_ADMIN");
        }

        log:printInfo("Initial SUPER_ADMIN created successfully!");
        log:printInfo("Email: superadmin@civilquest.com");
        log:printInfo("Password: SuperAdmin123!");
        log:printWarn("Please change the default password after first login!");
    } else {
        log:printInfo("SUPER_ADMIN already exists. Skipping creation.");
    }
}

// Function to check system integrity and create missing roles
public function checkSystemIntegrity() returns error? {
    log:printInfo("Checking system integrity...");

    // Ensure SUPER_ADMIN exists
    check ensureSuperAdminExists();

    // Fix admin users without province information
    check fixAdminUsersWithoutProvince();

    // Fix specific known admin users
    check fixSpecificAdminUsers();

    // Check for orphaned records and clean them up
    check cleanupOrphanedRecords();

    log:printInfo("System integrity check completed.");
}

// Fix specific known admin users that need province updates
public function fixSpecificAdminUsers() returns error? {
    log:printInfo("Fixing specific admin users with missing province...");

    // Fix admin.colombo@civilquest.com - should be in Western province
    mongodb:UpdateResult|error updateResult = userCollection->updateOne(
        {"email": "admin.colombo@civilquest.com", "role": "ADMIN"},
        {"set": {"province": "Western", "updatedAt": time:utcToString(time:utcNow())}}
    );

    if updateResult is mongodb:UpdateResult {
        if updateResult.modifiedCount > 0 {
            log:printInfo("Updated admin.colombo@civilquest.com with Western province");
        } else {
            log:printInfo("Admin admin.colombo@civilquest.com already has province or not found");
        }
    } else {
        log:printError("Failed to update admin.colombo@civilquest.com: " + updateResult.message());
    }
}

// Fix admin users that don't have province information
public function fixAdminUsersWithoutProvince() returns error? {
    log:printInfo("Checking for admin users without province information...");

    // Find all ADMIN users without province
    stream<UserDoc, error?>|error adminsWithoutProvince = userCollection->find({
        "role": "ADMIN",
        "$or": [
            {"province": {"$exists": false}},
            {"province": null}
        ]
    });

    if adminsWithoutProvince is error {
        log:printError("Error finding admins without province: " + adminsWithoutProvince.message());
        return;
    }

    int count = 0;
    check adminsWithoutProvince.forEach(function(UserDoc admin) {
        string email = admin.email ?: "";
        string adminId = extractIdString(admin?._id) ?: "";

        if email != "" && adminId != "" {
            // Try to infer province from email
            string inferredProvince = inferProvinceFromEmail(email);
            if inferredProvince != "" {
                // Build the filter based on ID type
                map<json> filter = {};
                if adminId.length() == 24 {
                    filter = {"_id": {"$oid": adminId}};
                } else {
                    filter = {"_id": adminId};
                }

                mongodb:UpdateResult|error updateResult = userCollection->updateOne(
                    filter,
                    {"set": {"province": inferredProvince, "updatedAt": time:utcToString(time:utcNow())}}
                );

                if updateResult is mongodb:UpdateResult && updateResult.modifiedCount > 0 {
                    log:printInfo("Updated admin " + email + " with province: " + inferredProvince);
                    count += 1;
                } else if updateResult is error {
                    log:printError("Failed to update admin " + email + ": " + updateResult.message());
                }
            } else {
                log:printWarn("Could not infer province for admin: " + email + ". Please update manually.");
            }
        }
    });

    if count > 0 {
        log:printInfo("Updated " + count.toString() + " admin users with province information");
    } else {
        log:printInfo("No admin users needed province updates");
    }
}

// Infer province from admin email
isolated function inferProvinceFromEmail(string email) returns string {
    // Map of cities/areas to provinces based on common admin email patterns
    map<string> cityToProvince = {
        "colombo": "Western",
        "western": "Western",
        "kandy": "Central",
        "central": "Central",
        "galle": "Southern",
        "matara": "Southern",
        "southern": "Southern",
        "jaffna": "Northern",
        "northern": "Northern",
        "batticaloa": "Eastern",
        "eastern": "Eastern",
        "kurunegala": "North Western",
        "northwestern": "North Western",
        "anuradhapura": "North Central",
        "northcentral": "North Central",
        "badulla": "Uva",
        "uva": "Uva",
        "ratnapura": "Sabaragamuwa",
        "sabaragamuwa": "Sabaragamuwa"
    };

    string lowerEmail = email.toLowerAscii();
    foreach string city in cityToProvince.keys() {
        if lowerEmail.includes(city) {
            return cityToProvince[city] ?: "";
        }
    }

    return ""; // Could not infer
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

// Cleanup orphaned records
public function cleanupOrphanedRecords() returns error? {
    log:printInfo("Cleaning up orphaned records...");

    // This function can be expanded to handle:
    // - Users with invalid role transitions
    // - Events without valid creators
    // - Participants for deleted events
    // - Sponsors for deleted events

    // For now, we'll implement basic cleanup for invalid role transitions
    mongodb:UpdateResult|error resetInvalidRoles = userCollection->updateMany(
        {
        "and": [
            {"role": {"$nin": ["USER", "PREMIUM_USER", "PREMIUM_PENDING", "ADMIN_OPERATOR", "ADMIN", "SUPER_ADMIN"]}},
            {"verified": true}
        ]
    },
        {"set": {"role": "USER", "updatedAt": time:utcToString(time:utcNow())}}
    );

    if resetInvalidRoles is error {
        log:printError("Error resetting invalid user roles: " + resetInvalidRoles.message());
    } else if resetInvalidRoles.modifiedCount > 0 {
        log:printInfo("Reset " + resetInvalidRoles.modifiedCount.toString() + " invalid user roles to USER");
    }

    log:printInfo("Orphaned records cleanup completed.");
}

// Function to create system configuration if not exists
public function ensureSystemConfiguration() returns error? {
    // This can be extended to ensure default configurations exist
    // For example: default points configuration, default event types, etc.
    log:printInfo("System configuration check completed.");
}

