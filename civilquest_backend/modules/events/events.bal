import civilquest_api.audit;
import civilquest_api.cloudinary;
import civilquest_api.database;
import civilquest_api.notifications;
import civilquest_api.points;
import civilquest_api.token;
import civilquest_api.utils;

import ballerina/http;
import ballerina/mime;
import ballerina/time;
import ballerina/uuid;
import ballerinax/mongodb;

// Add participant type for participation checking
public type Participant record {|
    string _id;
    string eventId;
    string userId;
    string name;
    string method; // INTERESTED or WILL_JOIN
    boolean isParticipated = false;
    string createdAt;
|};

// Normalize string for case-insensitive, trimmed comparisons
isolated function normalize(string s) returns string => s.trim().toLowerAscii();

// Helper function to check if an admin operator can manage events in a specific city
function canManageEventInCity(string operatorEmail, string eventCity) returns boolean {
    // Get users collection safely without throwing
    mongodb:Collection|error ucol = database:db->getCollection("users");
    if ucol is error {
        return false;
    }

    record {|anydata...;|}|error|() opDoc = ucol->findOne({
        "email": operatorEmail,
        "role": "ADMIN_OPERATOR"
    });

    if opDoc is error {
        return false;
    }
    if opDoc is () {
        return false;
    }

    string opCity = "";
    // opDoc must be a record at this point (error and () already returned)
    record {|anydata...;|} opRec = <record {|anydata...;|}>opDoc;
    anydata|() c = opRec["city"];
    if c is string {
        opCity = c;
    }
    if opCity == "" {
        return false;
    }

    return normalize(opCity) == normalize(eventCity);
}

// Helper function to check if an admin can manage events in a specific province  
function canManageEventInProvince(string adminEmail, string eventCity) returns boolean {
    mongodb:Collection|error ucol = database:db->getCollection("users");
    if ucol is error {
        return false;
    }

    record {|anydata...;|}|error|() adminDoc = ucol->findOne({
        "email": adminEmail,
        "role": "ADMIN"
    });

    if adminDoc is error {
        return false;
    }
    if adminDoc is () {
        return false;
    }

    string province = "";
    // adminDoc must be a record here (error and () already returned)
    record {|anydata...;|} adminRec = <record {|anydata...;|}>adminDoc;
    anydata|() p = adminRec["province"];
    if p is string {
        province = p;
    }
    if province == "" {
        return false;
    }

    // Simple province-city mapping for validation
    return isEventCityInProvince(eventCity, province);
}

// Helper function to check if a city belongs to a province
function isEventCityInProvince(string city, string province) returns boolean {
    // This is a simplified mapping. In a real system, this would be more comprehensive
    map<string[]> provinceCities = {
        "Western": ["Colombo", "Gampaha", "Kalutara", "Negombo", "Mount Lavinia", "Moratuwa", "Dehiwala"],
        "Central": ["Kandy", "Matale", "Nuwara Eliya", "Dambulla", "Gampola"],
        "Southern": ["Galle", "Matara", "Hambantota", "Tangalle", "Hikkaduwa"],
        "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
        "Eastern": ["Batticaloa", "Ampara", "Trincomalee", "Kalmunai"],
        "North Western": ["Kurunegala", "Puttalam", "Chilaw"],
        "North Central": ["Anuradhapura", "Polonnaruwa"],
        "Uva": ["Badulla", "Monaragala", "Bandarawela"],
        "Sabaragamuwa": ["Ratnapura", "Kegalle", "Balangoda"]
    };

    string[]? cities = provinceCities[province];
    if cities is () {
        return false;
    }

    foreach string validCity in cities {
        if normalize(city) == normalize(validCity) {
            return true;
        }
    }
    return false;
}

public type Event record {|
    string _id;
    string id; // For API compatibility
    string createdAt;
    string updatedAt;
    string date;
    string startTime;
    string? endTime;
    string location;
    string city;
    float? latitude;
    float? longitude;
    string eventTitle;
    string eventType;
    string eventDescription;
    string createdBy;
    string? approvedBy;
    string status; // PENDING, APPROVED, REJECTED, ENDED
    string[] sponsor = [];
    string[] participant = [];
    string reward;
    string image_url;
|};

final mongodb:Collection eventCollection;
final mongodb:Collection userCollection;
final mongodb:Collection participantCollection;
final mongodb:Collection sponsorCollection;

function init() returns error? {
    eventCollection = check database:db->getCollection("events");
    userCollection = check database:db->getCollection("users");
    participantCollection = check database:db->getCollection("participants");
    sponsorCollection = check database:db->getCollection("sponsors");
}

public function createEvent(http:Caller caller, http:Request req) returns error? {
    // Require authentication; derive creator from token rather than request body
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }
    string tokenStr = (<string>authHeader).substring(7);
    string|error userId = token:extractUserId(tokenStr);
    if userId is error {
        return utils:unauthorized(caller, "Invalid token");
    }
    string createdBy = <string>userId;

    string|error contentType = req.getHeader("Content-Type");
    if contentType is error || !(<string>contentType).startsWith("multipart/form-data") {
        return utils:badRequest(caller, "multipart/form-data required");
    }

    mime:Entity[]|error parts = req.getBodyParts();
    if parts is error {
        return utils:badRequest(caller, "Invalid form");
    }

    map<json> m = {};
    byte[] img = [];
    string imgName = "image";

    foreach var p in parts {
        mime:ContentDisposition|mime:ParserError cdOrErr = p.getContentDisposition();
        if cdOrErr is mime:ParserError {
            continue;
        }
        mime:ContentDisposition cd = cdOrErr;
        if cd.name == "image" {
            byte[]|mime:ParserError b = p.getByteArray();
            if b is byte[] {
                img = b;
            }
            string|error cdHeader = p.getHeader("Content-Disposition");
            if cdHeader is string {
                string headerVal = cdHeader;
                int? idxOpt = headerVal.indexOf("filename=");
                if idxOpt is int {
                    int fStart = idxOpt + 9;
                    if fStart < headerVal.length() {
                        string rest = headerVal.substring(fStart);
                        if rest.startsWith("\"") {
                            string restAfterQuote = rest.substring(1);
                            int? closingOpt = restAfterQuote.indexOf("\"");
                            if closingOpt is int {
                                imgName = restAfterQuote.substring(0, closingOpt);
                            }
                        } else {
                            int? semiOpt = rest.indexOf(";");
                            if semiOpt is int {
                                imgName = rest.substring(0, semiOpt).trim();
                            } else {
                                imgName = rest.trim();
                            }
                        }
                    }
                }
            }
        } else {
            string|error v = p.getText();
            if v is string {
                m[cd.name] = v;
            }
        }
    }

    // Validate event data, including date and times
    string[] validationErrors = utils:validateEventCreation(m);
    if validationErrors.length() > 0 {
        http:Response resp = new;
        resp.statusCode = 400;
        resp.setJsonPayload({"message": "Validation failed", "errors": validationErrors});
        check caller->respond(resp);
        return;
    }

    // Image is optional: upload only if provided
    string imageUrl = "";
    if img.length() > 0 {
        json|error uploaded = cloudinary:uploadImage(img, "events", imgName);
        if uploaded is error {
            return utils:serverError(caller, uploaded.message());
        }
        json upj = <json>uploaded;
        if upj is map<json> {
            json su = upj["secure_url"];
            if su is string {
                imageUrl = su;
            }
        }
        if imageUrl == "" {
            return utils:serverError(caller, "Image URL missing");
        }
    }

    string now = time:utcToString(time:utcNow());
    string id = uuid:createRandomUuid();

    Event evt = {
        _id: id,
        id: id,
        createdAt: now,
        updatedAt: now,
        date: <string>m["date"],
        startTime: <string>m["startTime"],
        endTime: (),
        location: <string>m["location"],
        city: <string>m["city"],
        latitude: (),
        longitude: (),
        eventTitle: <string>m["eventTitle"],
        eventType: <string>m["eventType"],
        eventDescription: <string>m["eventDescription"],
        createdBy: createdBy,
        approvedBy: (),
        status: "PENDING",
        sponsor: [],
        participant: [],
        reward: <string>m["reward"],
        image_url: imageUrl
    };

    if m.hasKey("endTime") {
        evt.endTime = <string>m["endTime"];
    }
    if m.hasKey("latitude") {
        float|error lat = float:fromString(m["latitude"].toString());
        if lat is float {
            if lat >= -90.0 && lat <= 90.0 {
                evt.latitude = lat;
            } else {
                return utils:badRequest(caller, "Invalid latitude");
            }
        }
    }
    if m.hasKey("longitude") {
        float|error lon = float:fromString(m["longitude"].toString());
        if lon is float {
            if lon >= -180.0 && lon <= 180.0 {
                evt.longitude = lon;
            } else {
                return utils:badRequest(caller, "Invalid longitude");
            }
        }
    }

    // Insert the event
    error? eventInsertResult = eventCollection->insertOne(evt);
    if eventInsertResult is error {
        return utils:serverError(caller);
    }

    // Update the user's organizeEventId array
    mongodb:UpdateResult|error userUpdateResult = userCollection->updateOne(
        {"email": createdBy},
        {"push": {"organizeEventId": id}}
    );

    if userUpdateResult is error {
        // The event was created successfully, but the user relationship update failed
        check caller->respond(<http:Ok>{
            body: {
                id: id,
                message: "Event created successfully, but user relationship update failed"
            }
        });
        return;
    } else {
        if userUpdateResult.matchedCount == 0 {
            // Creator record not found
            check caller->respond(<http:Ok>{
                body: {
                    id: id,
                    message: "Event created successfully, but user relationship update failed"
                }
            });
            return;
        }
        if userUpdateResult.modifiedCount == 0 {
            // Nothing updated (already present or write prevented)
            // Proceed without failing.
        }
    }

    // Award points for event creation using configured values
    points:PointsConfig|error config = points:getCurrentPointsConfig();
    if config is points:PointsConfig {
        // Award creation points (ignore any errors - optional operation)
        error? pointsResult = points:awardPoints(
                createdBy,
                points:EVENT_CREATION,
                config.eventCreationPoints,
                "Event creation: " + <string>m["eventTitle"],
                eventId = id
        );
        // Intentionally not checking pointsResult - points are optional
        if pointsResult is error {
            // Log but don't fail the operation
        }
    }

    check caller->respond(<http:Ok>{body: {id}});
}

public function approveEvent(http:Caller caller, http:Request req, string eventId, boolean approve) returns error? {
    // Get operator info for audit logging and authorization
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error operatorEmail = token:extractUserId(tokenStr);
    string|error operatorRole = token:extractRole(tokenStr);

    if operatorEmail is error || operatorRole is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Get event details first to check location-based permissions
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller);
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    // Role-aware permission checks
    boolean allowed = false;
    // operatorRole is guaranteed string (error already handled)
    if operatorRole == "SUPER_ADMIN" {
        allowed = true; // Full access
    } else if operatorRole == "ADMIN_OPERATOR" {
        allowed = canManageEventInCity(<string>operatorEmail, event.city);
    } else if operatorRole == "ADMIN" {
        allowed = canManageEventInProvince(<string>operatorEmail, event.city);
    }

    if !allowed {
        return utils:forbidden(caller);
    }

    string now = time:utcToString(time:utcNow());
    string status = approve ? "APPROVED" : "REJECTED";

    mongodb:UpdateResult|error ur = eventCollection->updateOne({"_id": eventId}, {"set": {status: status, updatedAt: now, approvedBy: <string>operatorEmail}});
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "Event not found");
    }

    // Log audit trail and notify
    // Audit log (non-blocking)
    error? auditResult = audit:logEventApproval(<string>operatorEmail, eventId, approve);
    if auditResult is error {
        // Continue without failing; audit failure shouldn't break operation
    }
    error? notifyResult = notifications:notifyEventApproval(event.createdBy, event.eventTitle, approve);
    if notifyResult is error {
        // Log error but don't fail the operation
    }

    // Award approval bonus points when event is approved
    if approve {
        points:PointsConfig|error config = points:getCurrentPointsConfig();
        if config is points:PointsConfig {
            error? approvalPointsResult = points:awardPoints(
                    event.createdBy,
                    points:BONUS_AWARD,
                    config.eventApprovalBonusPoints,
                    "Event approval bonus: " + event.eventTitle,
                    eventId = eventId
            );
            if approvalPointsResult is error {
                // Log but don't fail the operation
            }
        }
    }

    check caller->respond(<http:Ok>{body: {status}});
}

public function endEvent(http:Caller caller, http:Request req, string eventId) returns error? {
    // Get user role and ID from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error role = token:extractRole(tokenStr);
    string|error userId = token:extractUserId(tokenStr);

    if role is error || userId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Check permissions: Admin Operators can end any event, Premium Users can end their own events, Admins can end any event
    if role != "ADMIN_OPERATOR" && role != "PREMIUM_USER" && role != "ADMIN" {
        return utils:forbidden(caller);
    }

    // Get event details first
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller);
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    // If Premium User, check if they created the event
    if role == "PREMIUM_USER" {
        if event.createdBy != userId {
            return utils:forbidden(caller, "Can only end events you created");
        }
    }

    string now = time:utcToString(time:utcNow());
    mongodb:UpdateResult|error ur = eventCollection->updateOne({"_id": eventId}, {"set": {status: "ENDED", updatedAt: now}});
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "Event not found");
    }

    // Award completion bonus points to event creator and participants
    points:PointsConfig|error config = points:getCurrentPointsConfig();
    if config is points:PointsConfig {
        // Award completion bonus to event creator
        error? creatorBonusResult = points:awardPoints(
                event.createdBy,
                points:EVENT_COMPLETION,
                config.eventCompletionBonusPoints,
                "Event completion bonus: " + event.eventTitle,
                eventId = eventId
        );
        if creatorBonusResult is error {
            // Log but don't fail the operation
        }

        // Award completion bonus to all participants who actually participated
        if event.participant.length() > 0 {
            foreach string participantEmail in event.participant {
                error? participantBonusResult = points:awardPoints(
                        participantEmail,
                        points:EVENT_COMPLETION,
                        config.eventCompletionBonusPoints / 2, // Half bonus for participants
                        "Event completion participation bonus: " + event.eventTitle,
                        eventId = eventId
                );
                // Intentionally not checking participantBonusResult - points are optional
                if participantBonusResult is error {
                    // Log but don't fail the operation
                }
            }
        }
        // Intentionally not checking creatorBonusResult - points are optional
    }

    // Send completion notification to event creator
    error? notifyResult = notifications:notifyEventCompleted(event.createdBy, event.eventTitle);
    if notifyResult is error {
        // Log error but don't fail the operation
    }

    check caller->respond(<http:Ok>{body: {status: "ENDED"}});
}

// Get all events with optional filtering
public function getEvents(http:Caller caller, http:Request req) returns error? {
    map<string[]> queryParams = req.getQueryParams();
    map<json> filter = {};

    // Add filters based on query parameters
    if queryParams.hasKey("status") {
        string[]? statusArray = queryParams["status"];
        if statusArray is string[] && statusArray.length() > 0 {
            filter["status"] = statusArray[0];
        }
    }

    if queryParams.hasKey("city") {
        string[]? cityArray = queryParams["city"];
        if cityArray is string[] && cityArray.length() > 0 {
            filter["city"] = cityArray[0];
        }
    }

    if queryParams.hasKey("eventType") {
        string[]? typeArray = queryParams["eventType"];
        if typeArray is string[] && typeArray.length() > 0 {
            filter["eventType"] = typeArray[0];
        }
    }

    if queryParams.hasKey("createdBy") {
        string[]? createdByArray = queryParams["createdBy"];
        if createdByArray is string[] && createdByArray.length() > 0 {
            filter["createdBy"] = createdByArray[0];
        }
    }

    // Get user ID from token if authenticated (optional)
    string? currentUserId = ();
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is string && authHeader.length() > 7 {
        string tokenStr = authHeader.substring(7);
        string|error userIdFromToken = token:extractUserId(tokenStr);
        if userIdFromToken is string {
            currentUserId = userIdFromToken;
        }
    }

    stream<Event, error?>|error events = eventCollection->find(filter);
    if events is error {
        return utils:serverError(caller);
    }

    json[] eventList = [];
    check events.forEach(function(Event event) {
        // Get actual participant count from participant collection for accuracy
        int|error participantCount = participantCollection->countDocuments({"eventId": event._id});
        int actualParticipantCount = participantCount is int ? participantCount : 0;

        json eventData = {
            "_id": event._id,
            "id": event.id,
            "createdAt": event.createdAt,
            "updatedAt": event.updatedAt,
            "date": event.date,
            "startTime": event.startTime,
            "endTime": event.endTime,
            "location": event.location,
            "city": event.city,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "eventTitle": event.eventTitle,
            "eventType": event.eventType,
            "eventDescription": event.eventDescription,
            "createdBy": event.createdBy,
            "approvedBy": event.approvedBy,
            "status": event.status,
            "sponsor": event.sponsor,
            "participant": event.participant,
            "reward": event.reward,
            "image_url": event.image_url,
            "participantCount": actualParticipantCount
        };

        map<json> eventDataMap = <map<json>>eventData;

        // If user is authenticated, check their application status
        if currentUserId is string {
            Participant|error|() userParticipation = participantCollection->findOne({
                "eventId": event._id,
                "userId": currentUserId
            });

            if userParticipation is Participant {
                eventDataMap["userApplicationStatus"] = {
                    "hasApplied": true,
                    "method": userParticipation.method,
                    "isParticipated": userParticipation.isParticipated,
                    "appliedAt": userParticipation.createdAt
                };
            } else {
                eventDataMap["userApplicationStatus"] = {"hasApplied": false};
            }
        }

        // Attach detailed approved sponsors list
        json[] sponsorsDetailed = [];
        stream<record {|
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
        |}, error?>|error sponsorStream = sponsorCollection->find({"eventId": event._id, "approvedStatus": "APPROVED"});
        if sponsorStream is stream<record {|
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
        |}, error?> {
            error? forEachResult = sponsorStream.forEach(function(record {|
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
                    |} s) {
                sponsorsDetailed.push({
                    _id: s._id,
                    id: s.id,
                    userId: s.userId,
                    sponsorType: s.sponsorType,
                    amount: s.amount,
                    donationAmount: s.donationAmount,
                    donation: s.donation,
                    description: s.description,
                    approvedStatus: s.approvedStatus,
                    createdAt: s.createdAt,
                    updatedAt: s.updatedAt
                });
            });
            if forEachResult is error {
                // leave sponsorsDetailed empty on error
            }
        }
        eventDataMap["sponsor"] = sponsorsDetailed;
        eventData = eventDataMap;

        eventList.push(eventData);
    });

    check caller->respond(<http:Ok>{body: eventList});
}

// Get single event by ID
public function getEvent(http:Caller caller, http:Request req, string eventId) returns error? {
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller);
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    // Fetch approved sponsors for this event (if any) and enrich response.
    // We deliberately keep the original string[] sponsor field for backward compatibility
    // and add a new "sponsors" field containing detailed sponsor records.
    json[] sponsorsDetailed = [];
    stream<record {|
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
    |}, error?>|error sponsorStream = sponsorCollection->find({"eventId": eventId, "approvedStatus": "APPROVED"});
    if sponsorStream is stream<record {|
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
    |}, error?> {
        check sponsorStream.forEach(function(record {|
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
                |} s) {
            sponsorsDetailed.push({
                _id: s._id,
                id: s.id,
                userId: s.userId,
                sponsorType: s.sponsorType,
                amount: s.amount,
                donationAmount: s.donationAmount,
                donation: s.donation,
                description: s.description,
                approvedStatus: s.approvedStatus,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt
            });
        });
    }

    map<json> eventJson = {
        _id: event._id,
        id: event.id,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        city: event.city,
        latitude: event.latitude,
        longitude: event.longitude,
        eventTitle: event.eventTitle,
        eventType: event.eventType,
        eventDescription: event.eventDescription,
        createdBy: event.createdBy,
        approvedBy: event.approvedBy,
        status: event.status,
        sponsor: sponsorsDetailed,
        participant: event.participant,
        reward: event.reward,
        image_url: event.image_url
    };

    check caller->respond(<http:Ok>{body: eventJson});
}

// Update event (only by creator or admin operator)
public function updateEvent(http:Caller caller, http:Request req, string eventId) returns error? {
    json|error body = req.getJsonPayload();
    if body is error {
        return caller->respond(<http:BadRequest>{body: "Invalid payload"});
    }

    // Get user role and ID from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error role = token:extractRole(tokenStr);
    string|error userId = token:extractUserId(tokenStr);

    if role is error || userId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Check if event exists and get creator info
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller);
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    // Check permissions: Admin Operators and Admins can update any event, creators can update their own
    if role != "ADMIN_OPERATOR" && role != "ADMIN" && event.createdBy != userId {
        return utils:forbidden(caller, "Can only update events you created");
    }

    map<json> m = <map<json>>body;
    map<json> updateData = {};

    // Build update data from provided fields
    if m.hasKey("eventTitle") {
        updateData["eventTitle"] = m["eventTitle"];
    }
    if m.hasKey("eventDescription") {
        updateData["eventDescription"] = m["eventDescription"];
    }
    if m.hasKey("location") {
        updateData["location"] = m["location"];
    }
    if m.hasKey("city") {
        updateData["city"] = m["city"];
    }
    if m.hasKey("latitude") {
        float|error lat = float:fromString(m["latitude"].toString());
        if lat is float {
            if !(lat >= -90.0 && lat <= 90.0) {
                return utils:badRequest(caller, "Invalid latitude");
            }
            updateData["latitude"] = lat;
        } else {
            return utils:badRequest(caller, "Invalid latitude");
        }
    }
    if m.hasKey("longitude") {
        float|error lon = float:fromString(m["longitude"].toString());
        if lon is float {
            if !(lon >= -180.0 && lon <= 180.0) {
                return utils:badRequest(caller, "Invalid longitude");
            }
            updateData["longitude"] = lon;
        } else {
            return utils:badRequest(caller, "Invalid longitude");
        }
    }
    if m.hasKey("date") {
        string dateStr = m["date"].toString();
        boolean|error v = utils:validateEventDate(dateStr);
        if v is boolean && v {
            updateData["date"] = dateStr;
        } else {
            return utils:badRequest(caller, "Event date cannot be in the past");
        }
    }
    if m.hasKey("startTime") {
        string st = m["startTime"].toString();
        if !utils:validateTimeFormat(st) {
            return utils:badRequest(caller, "Invalid startTime format");
        }
        updateData["startTime"] = st;
    }
    if m.hasKey("endTime") {
        string et = m["endTime"].toString();
        if !utils:validateTimeFormat(et) {
            return utils:badRequest(caller, "Invalid endTime format");
        }
        // If startTime is not provided, read existing to validate order
        string startToCompare = m.hasKey("startTime") ? m["startTime"].toString() : event.startTime;
        boolean|error timeOrderOk = utils:validateTimeOrder(startToCompare, et);
        if timeOrderOk is boolean && timeOrderOk {
            updateData["endTime"] = et;
        } else {
            return utils:badRequest(caller, "endTime must be after startTime");
        }
    }
    if m.hasKey("reward") {
        updateData["reward"] = m["reward"];
    }

    updateData["updatedAt"] = time:utcToString(time:utcNow());

    mongodb:UpdateResult|error ur = eventCollection->updateOne({"_id": eventId}, {"set": updateData});
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "Event not found");
    }

    check caller->respond(<http:Ok>{body: {message: "Event updated successfully"}});
}

// Delete event (only by Admin or Admin Operator)
public function deleteEvent(http:Caller caller, http:Request req, string eventId) returns error? {
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

    // Only ADMIN and ADMIN_OPERATOR can delete events
    if role != "ADMIN" && role != "ADMIN_OPERATOR" {
        return utils:forbidden(caller);
    }

    // Get event details before deletion to update user's organizeEventId array
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller);
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    // Delete related participants and sponsors first for cascade cleanup
    mongodb:Collection participantCollection = check database:db->getCollection("participants");
    mongodb:Collection sponsorCollection = check database:db->getCollection("sponsors");

    _ = check participantCollection->deleteMany({"eventId": eventId});
    _ = check sponsorCollection->deleteMany({"eventId": eventId});

    // Delete the event itself
    mongodb:DeleteResult|error deleteResult = eventCollection->deleteOne({"_id": eventId});
    if deleteResult is error {
        return utils:serverError(caller);
    }
    if deleteResult.deletedCount == 0 {
        return utils:notFound(caller, "Event not found");
    }

    // Remove event ID from creator's organizeEventId array
    mongodb:UpdateResult|error userUpdateResult = userCollection->updateOne(
        {"email": event.createdBy},
        {"pull": {"organizeEventId": eventId}}
    );

    if userUpdateResult is error {
        // Log the error but don't fail the deletion since event is already deleted
        check caller->respond(<http:Ok>{
            body: {
                message: "Event deleted successfully, but user relationship update failed"
            }
        });
        return;
    }

    // Remove this eventId from any participant users' eventId arrays
    mongodb:UpdateResult|error clearParticipants = userCollection->updateMany(
        {"eventId": eventId},
        {"pull": {"eventId": eventId}}
    );
    if clearParticipants is error {
        // log only
    }

    check caller->respond(<http:Ok>{body: {message: "Event deleted successfully"}});
}

