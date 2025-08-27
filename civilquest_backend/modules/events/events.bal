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
    string id?;
    string eventId;
    string userId;
    string name;
    string method; // INTERESTED or WILL_JOIN
    boolean isParticipated = false;
    string createdAt;
    json...;
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

// Centralized province-city mapping for reuse
public function getProvinceCityMapping() returns map<string[]> {
    return {
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
}

// Helper function to check if a city belongs to a province
function isEventCityInProvince(string city, string province) returns boolean {
    map<string[]> provinceCities = getProvinceCityMapping();
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
    string? province;
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

public type RawDoc record {|
    json...;
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

// Helper to allow adding new fields
function toPlainJsonMap(json j) returns map<json> {
    map<json> out = {};
    if j is map<json> {
        foreach var [k, v] in j.entries() {
            out[k] = v;
        }
    }
    return out;
}

// Get approved sponsors for a given event
function getApprovedSponsorsJson(string eventId) returns json[] {
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
            // ignore errors and return what we have
        }
    }
    return sponsorsDetailed;
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

    // Province/city presence and consistency
    if !m.hasKey("province") {
        return utils:badRequest(caller, "province is required");
    }
    string province = <string>m["province"];
    if !isEventCityInProvince(<string>m["city"], province) {
        return utils:badRequest(caller, "City does not belong to the selected province");
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
        province: province,
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
    // Require latitude and longitude
    if !m.hasKey("latitude") || !m.hasKey("longitude") {
        return utils:badRequest(caller, "latitude and longitude are required");
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

    record {|anydata...;|}|error|() edoc = eventCollection->findOne({"_id": eventId});
    if edoc is error {
        return utils:serverError(caller, edoc.message());
    }
    if edoc is () {
        return utils:notFound(caller, "Event not found");
    }
    record {|anydata...;|} ev = <record {|anydata...;|}>edoc;
    string eventCity = "";
    string createdBy = "";
    string eventTitle = "";
    anydata|() c1 = ev["city"];
    if c1 is string {
        eventCity = c1;
    }
    anydata|() cb = ev["createdBy"];
    if cb is string {
        createdBy = cb;
    }
    anydata|() et = ev["eventTitle"];
    if et is string {
        eventTitle = et;
    }
    if eventCity == "" {
        return utils:badRequest(caller, "Event is missing a valid city");
    }

    boolean cityKnown = false;
    {
        map<string[]> mapping = getProvinceCityMapping();
        foreach var [_, cities] in mapping.entries() {
            foreach string c in cities {
                if normalize(c) == normalize(eventCity) {
                    cityKnown = true;
                    break;
                }
            }
            if cityKnown {
                break;
            }
        }
    }
    if !cityKnown {
        return utils:badRequest(caller, "Invalid event city: " + eventCity);
    }

    if operatorRole == "SUPER_ADMIN" {
        // Full access
    } else if operatorRole == "ADMIN_OPERATOR" {
        if !canManageEventInCity(<string>operatorEmail, eventCity) {
            return utils:forbidden(caller, "You can only approve events in your city");
        }
    } else if operatorRole == "ADMIN" {
        if !canManageEventInProvince(<string>operatorEmail, eventCity) {
            return utils:forbidden(caller, "You can only approve events in your province");
        }
    } else {
        return utils:forbidden(caller, "Your role cannot approve events");
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

    check caller->respond(<http:Ok>{body: {status}});

    error? auditRes = audit:logEventApproval(<string>operatorEmail, eventId, approve);
    if auditRes is error {
        // ignore
    }
    if createdBy != "" && eventTitle != "" {
        error? notifyRes = notifications:notifyEventApproval(createdBy, eventTitle, approve);
        if notifyRes is error {
            // ignore
        }
    }
    if approve && createdBy != "" {
        points:PointsConfig|error cfg = points:getCurrentPointsConfig();
        if cfg is points:PointsConfig {
            error? pointsRes = points:awardPoints(
                    createdBy,
                    points:BONUS_AWARD,
                    cfg.eventApprovalBonusPoints,
                    "Event approval bonus: " + eventTitle,
                    eventId = eventId
            );
            if pointsRes is error {
                // ignore
            }
        }
    }
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

    // Check acceptable roles up-front
    if role != "ADMIN_OPERATOR" && role != "PREMIUM_USER" && role != "ADMIN" && role != "SUPER_ADMIN" {
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

    if role == "PREMIUM_USER" {
        if event.createdBy != userId {
            return utils:forbidden(caller, "Can only end events you created");
        }
    } else if role == "ADMIN_OPERATOR" {
        if !canManageEventInCity(<string>userId, event.city) {
            return utils:forbidden(caller, "You can only end events in your city");
        }
    } else if role == "ADMIN" {
        if !canManageEventInProvince(<string>userId, event.city) {
            return utils:forbidden(caller, "You can only end events in your province");
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

    check caller->respond(<http:Ok>{body: {status: "ENDED"}});

    points:PointsConfig|error _cfg = points:getCurrentPointsConfig();
    if _cfg is points:PointsConfig {
        error? _creator = points:awardPoints(
                event.createdBy,
                points:EVENT_COMPLETION,
                _cfg.eventCompletionBonusPoints,
                "Event completion bonus: " + event.eventTitle,
                eventId = eventId
        );
        if _creator is error {
            // ignore
        }
        // Award to participants
        if event.participant.length() > 0 {
            foreach string participantEmail in event.participant {
                error? _p = points:awardPoints(
                        participantEmail,
                        points:EVENT_COMPLETION,
                        _cfg.eventCompletionBonusPoints / 2,
                        "Event completion participation bonus: " + event.eventTitle,
                        eventId = eventId
                );
                if _p is error {
                    // ignore
                }
            }
        }
    }
    error? _n = notifications:notifyEventCompleted(event.createdBy, event.eventTitle);
    if _n is error {
        // ignore
    }
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

    // Pagination and sorting
    int page = 1;
    int perPage = 20;
    string sortBy = "createdAt";
    int sortDir = -1; // -1 desc, 1 asc

    if queryParams.hasKey("page") {
        string[]? pArr = queryParams["page"];
        if pArr is string[] && pArr.length() > 0 {
            int|error p = int:fromString(pArr[0]);
            if p is int && p > 0 {
                page = p;
            }
        }
    }
    if queryParams.hasKey("limit") {
        string[]? lArr = queryParams["limit"];
        if lArr is string[] && lArr.length() > 0 {
            int|error l = int:fromString(lArr[0]);
            if l is int {
                if l < 1 {
                    perPage = 1;
                } else if l > 100 {
                    perPage = 100;
                } else {
                    perPage = l;
                }
            }
        }
    }
    if queryParams.hasKey("sortBy") {
        string[]? sbArr = queryParams["sortBy"];
        if sbArr is string[] && sbArr.length() > 0 {
            string sb = sbArr[0];
            // Allow-listed sort fields
            if sb == "createdAt" || sb == "updatedAt" || sb == "date" || sb == "city" || sb == "eventTitle" || sb == "status" {
                sortBy = sb;
            }
        }
    }
    if queryParams.hasKey("sortOrder") {
        string[]? soArr = queryParams["sortOrder"];
        if soArr is string[] && soArr.length() > 0 {
            string so = soArr[0].toLowerAscii();
            if so == "asc" {
                sortDir = 1;
            } else if so == "desc" {
                sortDir = -1;
            }
        }
    }

    int skip = (page - 1) * perPage;
    map<json> sortSpec = {};
    sortSpec[sortBy] = sortDir;

    stream<RawDoc, error?>|error events = eventCollection->find(filter, {"sort": sortSpec, "skip": skip, "limit": perPage});
    if events is error {
        return utils:serverError(caller);
    }

    json[] eventList = [];
    check events.forEach(function(RawDoc rawDoc) {
        map<json> eventMap = rawDoc;
        string eid = eventMap.hasKey("_id") && eventMap["_id"] is string ? <string>eventMap["_id"] : eventMap["_id"].toString();
        if !eventMap.hasKey("id") || !(eventMap["id"] is string) {
            eventMap["id"] = eid;
        }

        int participantCountComputed = 0;
        anydata|() partArr = eventMap.hasKey("participant") ? eventMap["participant"] : ();
        if partArr is json[] {
            participantCountComputed = partArr.length();
        } else {
            int|error pc = participantCollection->countDocuments({"eventId": eid});
            if pc is int {
                participantCountComputed = pc;
            }
        }
        eventMap["participantCount"] = participantCountComputed;

        // If user is authenticated, check their application status
        if currentUserId is string {
            record {|anydata...;|}|error|() userParticipation = participantCollection->findOne({
                "eventId": eid,
                "userId": currentUserId
            });
            if userParticipation is () {
                string uId = <string>currentUserId;
                map<json> ciFilter = {
                    "eventId": eid,
                    "userId": {"$regex": "^" + uId + "$", "$options": "i"}
                };
                userParticipation = participantCollection->findOne(ciFilter);
            }

            if userParticipation is error {
                // ignore; do not add status
            } else if userParticipation is () {
                boolean applied = false;
                string? methodF = ();
                boolean isPartF = false;
                string? appliedAtF = ();
                anydata|() apps = eventMap.hasKey("applications") ? eventMap["applications"] : ();
                if apps is json[] {
                    foreach json a in apps {
                        if a is map<json> {
                            anydata|() uidv = a["userId"];
                            if uidv is string && normalize(uidv) == normalize(<string>currentUserId) {
                                applied = true;
                                anydata|() mv = a["method"];
                                if mv is string {
                                    methodF = mv;
                                }
                                anydata|() pv = a["isParticipated"];
                                if pv is boolean {
                                    isPartF = pv;
                                }
                                anydata|() cav = a["createdAt"];
                                if cav is string {
                                    appliedAtF = cav;
                                }
                                break;
                            }
                        }
                    }
                }
                if applied {
                    map<json> status = {"hasApplied": true};
                    if methodF is string {
                        status["method"] = methodF;
                    }
                    status["isParticipated"] = isPartF;
                    if appliedAtF is string {
                        status["appliedAt"] = appliedAtF;
                    }
                    eventMap["userApplicationStatus"] = status;
                } else {
                    boolean appliedLegacy = false;
                    anydata|() part = eventMap.hasKey("participant") ? eventMap["participant"] : ();
                    if part is json[] {
                        foreach json u in part {
                            if u is string && normalize(u) == normalize(<string>currentUserId) {
                                appliedLegacy = true;
                                break;
                            }
                        }
                    }
                    if appliedLegacy {
                        eventMap["userApplicationStatus"] = {"hasApplied": true};
                    } else {
                        eventMap["userApplicationStatus"] = {"hasApplied": false};
                    }
                }
            } else {
                record {|anydata...;|} upr = <record {|anydata...;|}>userParticipation;
                string? method = (upr["method"] is string) ? <string>upr["method"] : ();
                boolean isParticipated = (upr["isParticipated"] is boolean) ? <boolean>upr["isParticipated"] : false;
                string? appliedAt = (upr["createdAt"] is string) ? <string>upr["createdAt"] : ();
                map<json> status = {"hasApplied": true};
                if method is string {
                    status["method"] = method;
                }
                status["isParticipated"] = isParticipated;
                if appliedAt is string {
                    status["appliedAt"] = appliedAt;
                }
                eventMap["userApplicationStatus"] = status;
            }
        }

        // Include approved sponsors detailed list
        json[] sponsorsDetailedList = getApprovedSponsorsJson(eid);
        if sponsorsDetailedList.length() > 0 {
            eventMap["sponsors"] = sponsorsDetailedList;
        }

        eventList.push(eventMap);
    });

    check caller->respond(<http:Ok>{body: eventList});
}

// Get single event by ID
public function getEvent(http:Caller caller, http:Request req, string eventId) returns error? {
    record {|anydata...;|}|error|() edoc = eventCollection->findOne({"_id": eventId});
    if edoc is error {
        return utils:serverError(caller);
    }
    if edoc is () {
        return utils:notFound(caller, "Event not found");
    }

    record {|anydata...;|} ev = <record {|anydata...;|}>edoc;
    map<json> eventMap = {};
    foreach var [k, v] in ev.entries() {
        eventMap[k] = <json>v;
    }
    if !eventMap.hasKey("id") || !(eventMap["id"] is string) {
        anydata|() _idv = eventMap["_id"];
        string eid = _idv is string ? _idv : _idv.toString();
        eventMap["id"] = eid;
    }
    if !eventMap.hasKey("applications") {
        eventMap["applications"] = [];
    }
    string eid = <string>eventMap["id"];
    json[] sponsorsDetailed = getApprovedSponsorsJson(eventId);
    if sponsorsDetailed.length() > 0 {
        eventMap["sponsors"] = sponsorsDetailed;
    }
    // Add participantCount for single event response
    int participantCount = 0;
    anydata|() partArr2 = eventMap.hasKey("participant") ? eventMap["participant"] : ();
    if partArr2 is json[] {
        participantCount = partArr2.length();
    }
    else {
        int|error pc2 = participantCollection->countDocuments({"eventId": eid});
        if pc2 is int {
            participantCount = pc2;
        }
    }
    eventMap["participantCount"] = participantCount;

    // If user is authenticated, add their participation status
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is string && authHeader.length() > 7 {
        string tokenStr = authHeader.substring(7);
        string|error userIdFromToken = token:extractUserId(tokenStr);
        if userIdFromToken is string {
            record {|anydata...;|}|error|() userParticipation = participantCollection->findOne({
                "eventId": eid,
                "userId": userIdFromToken
            });
            if userParticipation is () {
                string tokenId = <string>userIdFromToken;
                map<json> ciFilter = {
                    "eventId": eid,
                    "userId": {"$regex": "^" + tokenId + "$", "$options": "i"}
                };
                userParticipation = participantCollection->findOne(ciFilter);
            }
            if userParticipation is error {
                // ignore
            } else if userParticipation is () {
                boolean applied = false;
                string? methodF = ();
                boolean isPartF = false;
                string? appliedAtF = ();
                anydata|() apps = eventMap.hasKey("applications") ? eventMap["applications"] : ();
                if apps is json[] {
                    foreach json a in apps {
                        if a is map<json> {
                            anydata|() uidv = a["userId"];
                            if uidv is string && normalize(uidv) == normalize(<string>userIdFromToken) {
                                applied = true;
                                anydata|() mv = a["method"];
                                if mv is string {
                                    methodF = mv;
                                }
                                anydata|() pv = a["isParticipated"];
                                if pv is boolean {
                                    isPartF = pv;
                                }
                                anydata|() cav = a["createdAt"];
                                if cav is string {
                                    appliedAtF = cav;
                                }
                                break;
                            }
                        }
                    }
                }
                if applied {
                    map<json> status = {"hasApplied": true};
                    if methodF is string {
                        status["method"] = methodF;
                    }
                    status["isParticipated"] = isPartF;
                    if appliedAtF is string {
                        status["appliedAt"] = appliedAtF;
                    }
                    eventMap["userApplicationStatus"] = status;
                } else {
                    boolean appliedLegacy = false;
                    anydata|() part = eventMap.hasKey("participant") ? eventMap["participant"] : ();
                    if part is json[] {
                        foreach json u in part {
                            if u is string && normalize(u) == normalize(<string>userIdFromToken) {
                                appliedLegacy = true;
                                break;
                            }
                        }
                    }
                    if appliedLegacy {
                        eventMap["userApplicationStatus"] = {"hasApplied": true};
                    } else {
                        eventMap["userApplicationStatus"] = {"hasApplied": false};
                    }
                }
            } else {
                record {|anydata...;|} upr = <record {|anydata...;|}>userParticipation;
                string? method = (upr["method"] is string) ? <string>upr["method"] : ();
                boolean isParticipated = (upr["isParticipated"] is boolean) ? <boolean>upr["isParticipated"] : false;
                string? appliedAt = (upr["createdAt"] is string) ? <string>upr["createdAt"] : ();
                map<json> status = {"hasApplied": true};
                if method is string {
                    status["method"] = method;
                }
                status["isParticipated"] = isParticipated;
                if appliedAt is string {
                    status["appliedAt"] = appliedAt;
                }
                eventMap["userApplicationStatus"] = status;
            }
        }
    }

    check caller->respond(<http:Ok>{body: eventMap});
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

    // Check if event exists and get creator/city info (permissive mapping to avoid conversion errors)
    record {|anydata...;|}|error|() edoc = eventCollection->findOne({"_id": eventId});
    if edoc is error {
        return utils:serverError(caller);
    }
    if edoc is () {
        return utils:notFound(caller, "Event not found");
    }
    record {|anydata...;|} ev = <record {|anydata...;|}>edoc;
    string evCity = "";
    string evProvince = "";
    string evCreatedBy = "";
    string evStartTime = "";
    string evStatus = "";
    anydata|() c1 = ev["city"];
    if c1 is string {
        evCity = c1;
    }
    anydata|() p1 = ev["province"];
    if p1 is string {
        evProvince = p1;
    }
    anydata|() cb = ev["createdBy"];
    if cb is string {
        evCreatedBy = cb;
    }
    anydata|() st0 = ev["startTime"];
    if st0 is string {
        evStartTime = st0;
    }
    anydata|() st = ev["status"];
    if st is string {
        evStatus = st;
    }

    // Disallow editing approved events for all roles
    if evStatus == "APPROVED" {
        return utils:forbidden(caller, "Approved events cannot be edited");
    }

    // Check permissions: SUPER_ADMIN any; ADMIN within province; ADMIN_OPERATOR within city; creators can update own
    boolean updateAllowed = false;
    if role == "SUPER_ADMIN" {
        updateAllowed = true;
    } else if role == "ADMIN_OPERATOR" {
        updateAllowed = canManageEventInCity(<string>userId, evCity);
    } else if role == "ADMIN" {
        updateAllowed = canManageEventInProvince(<string>userId, evCity);
    } else if evCreatedBy == userId {
        updateAllowed = true;
    }
    if !updateAllowed {
        return utils:forbidden(caller);
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
    if m.hasKey("province") {
        updateData["province"] = m["province"];
    }
    if m.hasKey("city") || m.hasKey("province") {
        string newCity = m.hasKey("city") ? m["city"].toString() : evCity;
        string newProvince = m.hasKey("province") ? m["province"].toString() : evProvince;
        if newProvince != "" && !isEventCityInProvince(newCity, newProvince) {
            return utils:badRequest(caller, "City does not belong to selected province");
        }
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
        string stStart = m["startTime"].toString();
        if !utils:validateTimeFormat(stStart) {
            return utils:badRequest(caller, "Invalid startTime format");
        }
        updateData["startTime"] = stStart;
    }
    if m.hasKey("endTime") {
        string et = m["endTime"].toString();
        if !utils:validateTimeFormat(et) {
            return utils:badRequest(caller, "Invalid endTime format");
        }
        // If startTime is not provided, read existing to validate order
        string startToCompare = m.hasKey("startTime") ? m["startTime"].toString() : evStartTime;
        boolean|error timeOrderOk = utils:validateTimeOrder(startToCompare, et);
        if timeOrderOk is boolean && timeOrderOk {
            updateData["endTime"] = et;
        } else {
            return utils:badRequest(caller, "endTime must be after startTime");
        }
    }
    if m.hasKey("eventType") {
        updateData["eventType"] = m["eventType"];
    }
    if m.hasKey("reward") {
        updateData["reward"] = m["reward"];
    }

    if updateData.length() == 0 {
        return utils:badRequest(caller, "No fields to update");
    }
    updateData["updatedAt"] = time:utcToString(time:utcNow());

    mongodb:UpdateResult|error ur = eventCollection->updateOne({"_id": eventId}, {"set": updateData});
    if ur is error {
        return utils:serverError(caller, ur.message());
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
    string|error userId = token:extractUserId(tokenStr);

    if role is error || userId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller);
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    if role != "ADMIN" && role != "ADMIN_OPERATOR" && role != "SUPER_ADMIN" {
        return utils:forbidden(caller);
    }
    if role == "ADMIN_OPERATOR" {
        if !canManageEventInCity(<string>userId, event.city) {
            return utils:forbidden(caller, "You can only delete events in your city");
        }
    } else if role == "ADMIN" {
        if !canManageEventInProvince(<string>userId, event.city) {
            return utils:forbidden(caller, "You can only delete events in your province");
        }
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

