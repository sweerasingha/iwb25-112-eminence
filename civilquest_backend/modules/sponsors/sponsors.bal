import civilquest_api.audit;
import civilquest_api.database;
import civilquest_api.notifications;
import civilquest_api.points;
import civilquest_api.token;
import civilquest_api.utils;

import ballerina/http;
import ballerina/time;
import ballerina/uuid;
import ballerinax/mongodb;

public type Sponsor record {|
    string _id;
    string id?;
    string userId;
    string eventId;
    string sponsorType;
    float? amount;
    float? donationAmount;
    string? donation;
    string description;
    string approvedStatus;
    string createdAt;
    string updatedAt;
|};

final mongodb:Collection sponsorCollection;
final mongodb:Collection eventCollection;

function init() returns error? {
    sponsorCollection = check database:db->getCollection("sponsors");
    eventCollection = check database:db->getCollection("events");
}

// Creates a new sponsorship for an event
public function createSponsor(http:Caller caller, http:Request req) returns error? {
    // Input validation
    json|error body = req.getJsonPayload();
    if body is error {
        return caller->respond(<http:BadRequest>{body: "Invalid payload"});
    }
    map<json> m = <map<json>>body;

    // Validate required fields
    if !m.hasKey("userId") || !m.hasKey("eventId") || !m.hasKey("sponsorType") || !m.hasKey("description") {
        return caller->respond(<http:BadRequest>{body: "Missing required fields"});
    }

    // Validate sponsorship type
    string sponsorType = <string>m["sponsorType"];
    if sponsorType != "AMOUNT" && sponsorType != "DONATION" {
        return caller->respond(<http:BadRequest>{body: "Invalid sponsorType. Use AMOUNT or DONATION"});
    }

    // Validate event exists and is approved
    record {}|error|() evt = eventCollection->findOne({"_id": <string>m["eventId"]});
    if evt is error {
        return utils:serverError(caller);
    }
    if evt is () {
        return utils:notFound(caller, "Event not found");
    }
    if evt.hasKey("status") && evt["status"].toString() != "APPROVED" {
        return utils:badRequest(caller, "Only approved events can be sponsored");
    }

    // Validate amount/donation based on sponsorType
    float? amount = ();
    float? donationAmount = ();
    string? donation = ();

    if sponsorType == "AMOUNT" {
        if !m.hasKey("amount") {
            return caller->respond(<http:BadRequest>{body: "Amount is required for AMOUNT sponsorship"});
        }
        amount = <float>m["amount"];
        if !utils:validateSponsorshipAmount(<decimal>amount) {
            return utils:badRequest(caller, "Invalid amount");
        }
    } else {
        // DONATION type
        if m.hasKey("donationAmount") {
            donationAmount = <float>m["donationAmount"];
            if <decimal>donationAmount <= 0.0d {
                return utils:badRequest(caller, "donationAmount must be greater than 0");
            }
        }
        if m.hasKey("donation") {
            donation = <string>m["donation"];
        }
        if donationAmount is () && donation is () {
            return utils:badRequest(caller, "Provide donation details");
        }
    }
    string id = uuid:createRandomUuid();
    string now = time:utcToString(time:utcNow());

    Sponsor s = {
        _id: id,
        id: id,
        userId: <string>m["userId"],
        eventId: <string>m["eventId"],
        sponsorType: sponsorType,
        amount: amount,
        donationAmount: donationAmount,
        donation: donation,
        description: <string>m["description"],
        approvedStatus: "PENDING",
        createdAt: now,
        updatedAt: now
    };

    error? r = sponsorCollection->insertOne(s);
    if r is error {
        return utils:serverError(caller);
    }
    check caller->respond(<http:Ok>{body: {id}});
}

// Approves or rejects a sponsorship application
public function approveSponsor(http:Caller caller, http:Request req, string sponsorId, boolean approve) returns error? {
    string now = time:utcToString(time:utcNow());
    string status = approve ? "APPROVED" : "REJECTED";

    // Get sponsor details for processing
    Sponsor|error|() sponsor = sponsorCollection->findOne({"_id": sponsorId});
    if sponsor is error {
        return utils:serverError(caller);
    }
    if sponsor is () {
        return utils:notFound(caller, "Sponsor not found");
    }

    // Get operator info from token for audit and points
    string operatorId = "";
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is string {
        string tokenStr = authHeader.substring(7);
        string|error extracted = token:extractUserId(tokenStr);
        if extracted is string {
            operatorId = extracted;
        }
    }

    // Update sponsor status
    mongodb:UpdateResult|error ur = sponsorCollection->updateOne(
        {"_id": sponsorId},
        {"set": {approvedStatus: status, updatedAt: now}}
    );
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "Sponsor not found");
    }

    // If approving, update event's sponsor array
    if approve {
        mongodb:UpdateResult|error eventUpdateResult = eventCollection->updateOne(
            {"_id": sponsor.eventId},
            {"addToSet": {"sponsor": sponsor.userId}}
        );

        if eventUpdateResult is error {
            return utils:serverError(caller);
        }

        // Award sponsorship bonus points to sponsor
        points:PointsConfig|error cfg = points:getCurrentPointsConfig();
        if cfg is points:PointsConfig {
            if points:awardPoints(
                    sponsor.userId,
                    points:BONUS_AWARD,
                    cfg.sponsorshipBonusPoints,
                    "Sponsorship approved",
                    eventId = sponsor.eventId,
                    adminId = operatorId
            ) is error {
            }
        }
    } else {
        // If rejecting, remove from event's sponsor array (in case it was previously approved)
        mongodb:UpdateResult|error eventUpdateResult = eventCollection->updateOne(
            {"_id": sponsor.eventId},
            {"pull": {"sponsor": sponsor.userId}}
        );

        // Continue even if event update fails for rejection
        if eventUpdateResult is error {
            // Event update failed but continue with operation
        }
    }

    // Log audit trail
    if operatorId != "" {
        if audit:logSponsorshipApproval(operatorId, sponsorId, approve) is error {
        }
    }

    // Send notification to sponsor
    // Fetch event for title
    record {}|error|() evt = eventCollection->findOne({"_id": sponsor.eventId});
    string eventTitle = evt is record {} && evt.hasKey("eventTitle") ? evt["eventTitle"].toString() : "Event";
    decimal amt = 0.0d;
    if sponsor.amount is float {
        amt = <decimal>sponsor.amount;
    }
    else if sponsor.donationAmount is float {
        amt = <decimal>sponsor.donationAmount;
    }
    if notifications:notifySponsorshipApproval(sponsor.userId, eventTitle, approve, amt) is error {
    }

    check caller->respond(<http:Ok>{
        body: {
            status: status,
            message: approve ? "Sponsor approved successfully" : "Sponsor rejected successfully"
        }
    });
}

// Pure helper extracted for unit testing: returns the new status and whether to add sponsor to event
public function evaluateSponsorApproval(Sponsor sponsor, boolean approve) returns [string, boolean] {
    // returns [newStatus, addToEventSponsor]
    string status = approve ? "APPROVED" : "REJECTED";
    boolean add = approve;
    return [status, add];
}

// Get all sponsors with optional filtering
public function getSponsors(http:Caller caller, http:Request req) returns error? {
    map<string[]> queryParams = req.getQueryParams();
    map<json> filter = {};

    // Add filters based on query parameters
    if queryParams.hasKey("eventId") {
        string[]? eventIdArray = queryParams["eventId"];
        if eventIdArray is string[] && eventIdArray.length() > 0 {
            filter["eventId"] = eventIdArray[0];
        }
    }

    if queryParams.hasKey("userId") {
        string[]? userIdArray = queryParams["userId"];
        if userIdArray is string[] && userIdArray.length() > 0 {
            filter["userId"] = userIdArray[0];
        }
    }

    if queryParams.hasKey("approvedStatus") {
        string[]? statusArray = queryParams["approvedStatus"];
        if statusArray is string[] && statusArray.length() > 0 {
            filter["approvedStatus"] = statusArray[0];
        }
    }

    stream<Sponsor, error?>|error sponsors = sponsorCollection->find(filter);
    if sponsors is error {
        return caller->respond(<http:BadGateway>{body: "Server error"});
    }

    Sponsor[] sponsorList = [];
    check sponsors.forEach(function(Sponsor sponsor) {
        sponsorList.push(sponsor);
    });

    check caller->respond(<http:Ok>{body: sponsorList});
}

// Get single sponsor by ID
public isolated function getSponsor(http:Caller caller, http:Request req, string sponsorId) returns error? {
    Sponsor|error|() sponsor = sponsorCollection->findOne({"_id": sponsorId});
    if sponsor is error {
        return caller->respond(<http:BadGateway>{body: "Server error"});
    }
    if sponsor is () {
        return caller->respond(<http:NotFound>{body: "Sponsor not found"});
    }
    check caller->respond(<http:Ok>{body: sponsor});
}

// Create sponsor on behalf of organization (Admin Operator functionality)
public function createOfficialSponsor(http:Caller caller, http:Request req) returns error? {
    json|error body = req.getJsonPayload();
    if body is error {
        return caller->respond(<http:BadRequest>{body: "Invalid payload"});
    }
    map<json> m = <map<json>>body;
    string id = uuid:createRandomUuid();
    string now = time:utcToString(time:utcNow());

    Sponsor s = {
        _id: id,
        id: id, // For API compatibility
        userId: <string>m["adminOperatorId"],
        eventId: <string>m["eventId"],
        sponsorType: <string>m["sponsorType"],
        amount: m.hasKey("amount") ? <float>m["amount"] : (),
        donationAmount: m.hasKey("donationAmount") ? <float>m["donationAmount"] : (),
        donation: m.hasKey("donation") ? <string>m["donation"] : (),
        description: <string>m["description"],
        approvedStatus: "APPROVED",
        createdAt: now,
        updatedAt: now
    };

    // Insert sponsor record
    error? sponsorInsertResult = sponsorCollection->insertOne(s);
    if sponsorInsertResult is error {
        return caller->respond(<http:BadGateway>{body: "Server error"});
    }

    // Update event's sponsor array since auto-approved
    mongodb:UpdateResult|error eventUpdateResult = eventCollection->updateOne(
        {"_id": s.eventId},
        {"addToSet": {"sponsor": s.userId}}
    );

    if eventUpdateResult is error {
        return caller->respond(<http:BadGateway>{body: "Server error"});
    }

    // Success response
    check caller->respond(<http:Ok>{
        body: {
            id: id,
            message: "Official sponsorship created and approved successfully"
        }
    });
}

