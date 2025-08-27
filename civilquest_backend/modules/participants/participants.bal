import civilquest_api.database;
import civilquest_api.points;
import civilquest_api.token;
import civilquest_api.utils;

import ballerina/http;
import ballerina/time;
import ballerina/uuid;
import ballerinax/mongodb;

public type Participant record {|
    string _id;
    string id?;
    string eventId;
    string userId;
    string name;
    string method;
    boolean isParticipated = false;
    string createdAt;
|};

// Import the Event type from events module
public type Event record {|
    string _id;
    string id;
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

final mongodb:Collection participantCollection;
final mongodb:Collection userCollection;
final mongodb:Collection eventCollection;

function init() returns error? {
    participantCollection = check database:db->getCollection("participants");
    userCollection = check database:db->getCollection("users");
    eventCollection = check database:db->getCollection("events");
}

// Mark actual participation by the authenticated user during the event window (until 1 hour after end)
// - If a prior application exists, it will be updated; otherwise, a new record is created and marked as participated.
// - Awards event reward points only once per user-event upon first successful participation mark.
public function participateInEvent(http:Caller caller, http:Request req, string eventId) returns error? {
    // Require auth and extract user
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }
    string tokenStr = (<string>authHeader).substring(7);
    string|error tokenUserId = token:extractUserId(tokenStr);
    if tokenUserId is error {
        return utils:unauthorized(caller, "Invalid token");
    }
    string userId = tokenUserId;

    // Load event and compute participation window
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller);
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    // Allow only approved events
    if event.status != "APPROVED" {
        return utils:forbidden(caller, "Event is not approved for participation");
    }

    // Extract user-provided location (latitude, longitude) and validate proximity (<= 500m)
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload; expected JSON with latitude and longitude");
    }
    map<json> bm = <map<json>>body;
    if !bm.hasKey("latitude") || !bm.hasKey("longitude") {
        return utils:badRequest(caller, "latitude and longitude are required");
    }
    float|error userLat = float:fromString(bm["latitude"].toString());
    float|error userLon = float:fromString(bm["longitude"].toString());
    if userLat is error || userLon is error {
        return utils:badRequest(caller, "Invalid latitude/longitude values");
    }
    if event.latitude is () || event.longitude is () {
        return utils:badRequest(caller, "Event location coordinates not available");
    }
    float distance = utils:calculateHaversineDistanceMeters(<float>event.latitude, <float>event.longitude, <float>userLat, <float>userLon);
    if distance > 500.0 {
        return utils:forbidden(caller, "You must be within 500 meters of the event location to participate");
    }

    // Build UTC datetimes from event date and times (expects YYYY-MM-DD and HH:MM)
    string startIso = event.date + "T" + event.startTime + ":00.000Z";
    time:Utc|error startUtc = time:utcFromString(startIso);
    if startUtc is error {
        return utils:badRequest(caller, "Invalid event start date/time");
    }
    time:Utc now = time:utcNow();
    time:Utc nowLocal = time:utcAddSeconds(now, 19800);
    string nowIsoLocal = time:utcToString(nowLocal);
    string todayLocal = nowIsoLocal.substring(0, 10);
    if todayLocal != event.date {
        return utils:forbidden(caller, "Participation is allowed only on the event day");
    }
    time:Utc startUtcAdj = time:utcAddSeconds(<time:Utc>startUtc, -19800);
    if time:utcDiffSeconds(now, startUtcAdj) < 0d {
        return utils:forbidden(caller, "Participation is allowed only after the event starts");
    }
    if event.endTime is string {
        string endIso = event.date + "T" + <string>event.endTime + ":00.000Z";
        time:Utc|error endUtc = time:utcFromString(endIso);
        if endUtc is error {
            return utils:badRequest(caller, "Invalid event end time");
        }
        time:Utc endUtcAdj = time:utcAddSeconds(<time:Utc>endUtc, -19800);
        if time:utcDiffSeconds(endUtcAdj, now) < 0d {
            return utils:forbidden(caller, "Participation is allowed only until the event ends on the event day");
        }
    }

    // Find existing participation (application) if any
    Participant|error|() existing = participantCollection->findOne({
        "eventId": eventId,
        "userId": userId
    });
    if existing is error {
        return utils:serverError(caller);
    }

    // If already marked participated, return idempotent success
    if existing is Participant && existing.isParticipated {
        return caller->respond(<http:Ok>{body: {message: "Already marked as participated"}});
    }

    string nowStr = time:utcToString(now);

    // If no record, create one with participated=true
    if existing is () {
        string pid = uuid:createRandomUuid();
        Participant p = {
            _id: pid,
            id: pid,
            eventId: eventId,
            userId: userId,
            name: "",
            method: "WILL_JOIN",
            isParticipated: true,
            createdAt: nowStr
        };

        error? ins = participantCollection->insertOne(p);
        if ins is error {
            return utils:serverError(caller);
        }

        // Maintain relationships
        mongodb:UpdateResult|error rel1 = userCollection->updateOne({"email": userId}, {"addToSet": {"eventId": eventId}});
        if rel1 is error {
        }
        mongodb:UpdateResult|error rel2 = eventCollection->updateOne({"_id": eventId}, {"addToSet": {"participant": userId}});
        if rel2 is error {
        }

        // Award reward points based on event.reward
        int|error rewardPoints = int:fromString(event.reward);
        if rewardPoints is int && rewardPoints > 0 {
            error? apErr = points:awardPoints(userId, points:EVENT_PARTICIPATION, rewardPoints,
                    "Event participation: " + event.eventTitle, eventId = eventId);
            if apErr is error {
            }
        }

        mongodb:UpdateResult|error _meta1 = eventCollection->updateOne(
            {"_id": eventId, "applications.userId": userId},
            {"set": {"applications.$.isParticipated": true}}
        );
        if _meta1 is error {
        }
        mongodb:UpdateResult|error _meta2 = eventCollection->updateOne(
            {"_id": eventId},
            {"addToSet": {"applications": {"userId": userId, "method": "WILL_JOIN", "createdAt": nowStr, "isParticipated": true}}}
        );
        if _meta2 is error {
        }

        // Sync participant list on event
        error? syncErr = syncParticipantCount(eventId);
        if syncErr is error {
        }

        return caller->respond(<http:Ok>{body: {message: "Participation recorded", participated: true}});
    }

    // Otherwise, update existing record to set isParticipated = true
    mongodb:UpdateResult|error ur = participantCollection->updateOne(
        {"_id": existing._id}, {"set": {"isParticipated": true}}
    );
    if ur is error {
        return utils:serverError(caller);
    }

    // Maintain relationships
    mongodb:UpdateResult|error rel3 = userCollection->updateOne({"email": userId}, {"addToSet": {"eventId": eventId}});
    if rel3 is error {
    }
    mongodb:UpdateResult|error rel4 = eventCollection->updateOne({"_id": eventId}, {"addToSet": {"participant": userId}});
    if rel4 is error {
    }

    mongodb:UpdateResult|error _meta3 = eventCollection->updateOne(
        {"_id": eventId, "applications.userId": userId},
        {"set": {"applications.$.isParticipated": true}}
    );
    if _meta3 is error {
    }

    // Award points only if transitioning from false -> true
    int|error rewardPts = int:fromString(event.reward);
    if rewardPts is int && rewardPts > 0 {
        error? apErr2 = points:awardPoints(userId, points:EVENT_PARTICIPATION, rewardPts,
                "Event participation: " + event.eventTitle, eventId = eventId);
        if apErr2 is error {
        }
    }

    error? syncErr2 = syncParticipantCount(eventId);
    if syncErr2 is error {
    }
    return caller->respond(<http:Ok>{body: {message: "Participation recorded", participated: true}});
}

// Applies user to participate in an event
public function applyToEvent(http:Caller caller, http:Request req, string eventId) returns error? {
    // Input validation
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }

    map<json> m = <map<json>>body;

    // Get user ID from token for security
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error tokenUserId = token:extractUserId(tokenStr);

    if tokenUserId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Use the user ID from token for security (prevent users from applying on behalf of others)
    string userId = tokenUserId;
    string participantId = uuid:createRandomUuid();
    string now = time:utcToString(time:utcNow());

    if !m.hasKey("method") {
        return utils:badRequest(caller, "method is required");
    }
    string method = m["method"].toString();
    string nameVal = m.hasKey("name") ? m["name"].toString() : "";

    // Verify event exists and is approved
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller, "Server error checking event");
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }
    if event.status != "APPROVED" {
        return utils:badRequest(caller, "Can only apply to approved events");
    }

    string startIso = event.date + "T" + event.startTime + ":00.000Z";
    time:Utc|error startUtc = time:utcFromString(startIso);
    if startUtc is error {
        return utils:badRequest(caller, "Invalid event start date/time");
    }
    time:Utc nowUtc = time:utcNow();
    time:Utc startUtcAdj = time:utcAddSeconds(<time:Utc>startUtc, -19800);
    if time:utcDiffSeconds(nowUtc, startUtcAdj) >= 0d {
        return utils:forbidden(caller, "Applications are closed as the event has started");
    }

    // Check if user already applied to this event
    Participant|error|() existingParticipant = participantCollection->findOne({
        "eventId": eventId,
        "userId": userId
    });

    if existingParticipant is error {
        return utils:serverError(caller, "Server error checking existing participation");
    }

    if existingParticipant is Participant {
        if existingParticipant.method != method {
            mongodb:UpdateResult|error ur = participantCollection->updateOne(
                {"_id": existingParticipant._id}, {"set": {"method": method}}
            );
            if ur is error {
                return utils:serverError(caller, "Failed to update application method");
            }
            mongodb:UpdateResult|error metaUpdate = eventCollection->updateOne(
                {"_id": eventId, "applications.userId": userId},
                {"set": {"applications.$.method": method}}
            );
            if metaUpdate is error {
                mongodb:UpdateResult|error add1 = eventCollection->updateOne(
                    {"_id": eventId},
                    {"addToSet": {"applications": {"userId": userId, "method": method, "createdAt": now}}}
                );
                if add1 is error {
                }
            } else if metaUpdate.matchedCount == 0 {
                mongodb:UpdateResult|error add2 = eventCollection->updateOne(
                    {"_id": eventId},
                    {"addToSet": {"applications": {"userId": userId, "method": method, "createdAt": now}}}
                );
                if add2 is error {
                }
            }

            mongodb:UpdateResult|error relA = userCollection->updateOne({"email": userId}, {"addToSet": {"eventId": eventId}});
            if relA is error {
            }
            mongodb:UpdateResult|error relB = eventCollection->updateOne({"_id": eventId}, {"addToSet": {"participant": userId}});
            if relB is error {
            }

            check caller->respond(<http:Ok>{
                body: {id: existingParticipant._id, message: "Application method updated", method}
            });
            return;
        } else {
            mongodb:UpdateResult|error add3 = eventCollection->updateOne(
                {"_id": eventId},
                {"addToSet": {"applications": {"userId": userId, "method": method, "createdAt": existingParticipant.createdAt}}}
            );
            if add3 is error {
            }
            check caller->respond(<http:Ok>{
                body: {id: existingParticipant._id, message: "Application method unchanged", method}
            });
            return;
        }
    }

    // Create participant record
    Participant p = {
        _id: participantId,
        id: participantId,
        eventId: eventId,
        userId: userId,
        name: nameVal,
        method: method,
        isParticipated: false,
        createdAt: now
    };

    // Start transaction-like operations
    // Insert participant record first
    error? participantInsertResult = participantCollection->insertOne(p);
    if participantInsertResult is error {
        return utils:serverError(caller, "Server error creating participation");
    }

    // Update user's eventId array to include this event
    mongodb:UpdateResult|error userUpdateResult = userCollection->updateOne(
        {"email": userId},
        {"addToSet": {"eventId": eventId}}
    );

    if userUpdateResult is error {
        return utils:serverError(caller);
    }

    // Update event's participant array to include this user
    mongodb:UpdateResult|error eventUpdateResult = eventCollection->updateOne(
        {"_id": eventId},
        {"addToSet": {"participant": userId}}
    );

    if eventUpdateResult is error {
        return utils:serverError(caller, "Server error updating event participation record");
    }

    mongodb:UpdateResult|error eventMetaUpdate = eventCollection->updateOne(
        {"_id": eventId},
        {"addToSet": {"applications": {"userId": userId, "method": method, "createdAt": now}}}
    );
    if eventMetaUpdate is error {
        // ignore
    }

    // Sync participant count to ensure accuracy
    error? syncResult = syncParticipantCount(eventId);
    if syncResult is error {
        // Log but don't fail - the participation was created successfully
    }

    check caller->respond(<http:Ok>{
        body: {
            id: participantId,
            message: "Successfully applied to event",
            method: p.method
        }
    });
}

// Get all participants with optional filtering
public function getParticipants(http:Caller caller, http:Request req) returns error? {
    map<string[]> queryParams = req.getQueryParams();
    map<json> filter = {};

    // Add filters based on query parameters
    if queryParams.hasKey("status") {
        string[]? statusArray = queryParams["status"];
        if statusArray is string[] && statusArray.length() > 0 {
            filter["status"] = statusArray[0];
        }
    }

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

    if queryParams.hasKey("method") {
        string[]? methodArray = queryParams["method"];
        if methodArray is string[] && methodArray.length() > 0 {
            filter["method"] = methodArray[0];
        }
    }

    if queryParams.hasKey("isParticipated") {
        string[]? participatedArray = queryParams["isParticipated"];
        if participatedArray is string[] && participatedArray.length() > 0 {
            boolean isParticipated = participatedArray[0] == "true";
            filter["isParticipated"] = isParticipated;
        }
    }

    stream<Participant, error?>|error participants = participantCollection->find(filter);
    if participants is error {
        return utils:serverError(caller);
    }

    Participant[] participantList = [];
    check participants.forEach(function(Participant participant) {
        participantList.push(participant);
    });

    check caller->respond(<http:Ok>{body: participantList});
}

// Update participation status
public function updateParticipationStatus(http:Caller caller, http:Request req, string eventId, string participantId) returns error? {
    json|error body = req.getJsonPayload();
    if body is error {
        return utils:badRequest(caller, "Invalid payload");
    }

    map<json> m = <map<json>>body;
    boolean isParticipated = <boolean>m["isParticipated"];

    // Verify event exists first
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller, "Server error checking event");
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    // Get participant details and validate it belongs to the specified event
    Participant|error|() participant = participantCollection->findOne({
        "_id": participantId,
        "eventId": eventId
    });
    if participant is error {
        return utils:serverError(caller);
    }
    if participant is () {
        return utils:notFound(caller, "Participant not found for this event");
    }

    // Store previous participation status to determine point changes
    boolean previousParticipationStatus = participant.isParticipated;

    // Update participant status
    mongodb:UpdateResult|error ur = participantCollection->updateOne(
        {"_id": participantId},
        {"set": {"isParticipated": isParticipated}}
    );
    if ur is error {
        return utils:serverError(caller);
    }
    if ur.matchedCount == 0 {
        return utils:notFound(caller, "Participant not found");
    }

    // Handle points based on participation status change
    if isParticipated && !previousParticipationStatus {
        // Award points when marking as participated (false -> true)
        Event|error|() eventDetails = eventCollection->findOne({"_id": participant.eventId});
        if eventDetails is Event {
            int|error rewardPoints = int:fromString(eventDetails.reward);
            if rewardPoints is int && rewardPoints > 0 {
                // Award participation points (result intentionally ignored)
                if points:awardPoints(
                        participant.userId,
                        points:EVENT_PARTICIPATION,
                        rewardPoints,
                        "Event participation: " + eventDetails.eventTitle,
                        eventId = participant.eventId
                ) is error {
                    // Points award failed, but continue with participation update
                }
            }
        }
    } else if !isParticipated && previousParticipationStatus {
        // Deduct points when removing participation status (true -> false)
        Event|error|() eventDetails = eventCollection->findOne({"_id": participant.eventId});
        if eventDetails is Event {
            int|error rewardPoints = int:fromString(eventDetails.reward);
            if rewardPoints is int && rewardPoints > 0 {
                // Deduct participation points (result intentionally ignored)
                if points:deductPoints(
                        participant.userId,
                        points:ADMINISTRATIVE_DEDUCT,
                        rewardPoints,
                        "Participation removed: " + eventDetails.eventTitle,
                        eventId = participant.eventId
                ) is error {
                }
            }
        }
    }

    mongodb:UpdateResult|error userUpdate = userCollection->updateOne(
        {"email": participant.userId},
        {"addToSet": {"eventId": participant.eventId}}
    );

    mongodb:UpdateResult|error eventUpdate = eventCollection->updateOne(
        {"_id": participant.eventId},
        {"addToSet": {"participant": participant.userId}}
    );

    if userUpdate is error {
    }
    if eventUpdate is error {
    }

    check caller->respond(<http:Ok>{
        body: {
            message: "Participation status updated",
            isParticipated: isParticipated
        }
    });
}

// Remove participation (properly handle relationship cleanup)
public function removeParticipation(http:Caller caller, http:Request req, string eventId, string participantId) returns error? {
    // Get user ID from token for authorization
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error tokenUserId = token:extractUserId(tokenStr);
    string|error role = token:extractRole(tokenStr);

    if tokenUserId is error || role is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Verify event exists first
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller, "Server error checking event");
    }
    if event is () {
        return utils:notFound(caller, "Event not found");
    }

    // Get participant details and validate it belongs to the specified event
    Participant|error|() participant = participantCollection->findOne({
        "_id": participantId,
        "eventId": eventId // Ensure participant belongs to this event
    });
    if participant is error {
        return utils:serverError(caller);
    }
    if participant is () {
        return utils:notFound(caller, "Participant not found for this event");
    }

    // Authorization check: Users can only remove their own participation, Admin Operators can remove any
    if role != "ADMIN_OPERATOR" && participant.userId != tokenUserId {
        return utils:forbidden(caller, "Can only remove your own participation");
    }

    // Remove participant record
    mongodb:DeleteResult|error deleteResult = participantCollection->deleteOne({"_id": participantId});
    if deleteResult is error {
        return utils:serverError(caller);
    }
    if deleteResult.deletedCount == 0 {
        return utils:notFound(caller, "Participant not found");
    }

    // Check if user has other participations in the same event before removing from arrays
    Participant|error|() otherParticipation = participantCollection->findOne({
        "eventId": participant.eventId,
        "userId": participant.userId,
        "_id": {"$ne": participantId}
    });

    // Only remove from arrays if no other participation exists for this user-event combination
    if otherParticipation is () {
        // Remove event from user's eventId array
        mongodb:UpdateResult|error userUpdate = userCollection->updateOne(
            {"email": participant.userId},
            {"pull": {"eventId": participant.eventId}}
        );

        // Remove user from event's participant array
        mongodb:UpdateResult|error eventUpdate = eventCollection->updateOne(
            {"_id": participant.eventId},
            {"pull": {"participant": participant.userId}}
        );

        // Log errors but don't fail the operation since main deletion succeeded
        if userUpdate is error {
        }
        if eventUpdate is error {
        }

        // Sync participant count after removal
        error? syncResult = syncParticipantCount(participant.eventId);
        if syncResult is error {
        }
    }

    check caller->respond(<http:Ok>{body: {message: "Participation removed successfully"}});
}

// Get participants for a specific event (useful for event organizers)
public function getEventParticipants(http:Caller caller, http:Request req, string eventId) returns error? {
    stream<Participant, error?>|error participants = participantCollection->find({"eventId": eventId});
    if participants is error {
        return utils:serverError(caller);
    }

    Participant[] participantList = [];
    check participants.forEach(function(Participant participant) {
        participantList.push(participant);
    });

    // Group by method for better organization
    Participant[] interested = [];
    Participant[] willJoin = [];
    Participant[] participated = [];

    foreach Participant p in participantList {
        if p.isParticipated {
            participated.push(p);
        } else if p.method == "WILL_JOIN" {
            willJoin.push(p);
        } else {
            interested.push(p);
        }
    }

    json response = {
        "eventId": eventId,
        "summary": {
            "total": participantList.length(),
            "interested": interested.length(),
            "willJoin": willJoin.length(),
            "participated": participated.length()
        },
        "participants": {
            "interested": interested,
            "willJoin": willJoin,
            "participated": participated
        }
    };

    check caller->respond(<http:Ok>{body: response});
}

// Get user's own participation status across all events
public function getUserParticipations(http:Caller caller, http:Request req) returns error? {
    // Get user ID from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error tokenUserId = token:extractUserId(tokenStr);

    if tokenUserId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Get all participations for this user
    stream<Participant, error?>|error participations = participantCollection->find({"userId": tokenUserId});
    if participations is error {
        return utils:serverError(caller);
    }

    // Convert stream to array and enrich with event details
    json[] userParticipations = [];
    check participations.forEach(function(Participant participation) {
        // Get event details for each participation
        Event|error|() event = eventCollection->findOne({"_id": participation.eventId});
        if event is Event {
            json participationWithEvent = {
                "_id": participation._id,
                "eventId": participation.eventId,
                "userId": participation.userId,
                "name": participation.name,
                "method": participation.method,
                "isParticipated": participation.isParticipated,
                "createdAt": participation.createdAt,
                "event": {
                    "eventTitle": event.eventTitle,
                    "eventDescription": event.eventDescription,
                    "eventType": event.eventType,
                    "date": event.date,
                    "startTime": event.startTime,
                    "endTime": event.endTime,
                    "location": event.location,
                    "city": event.city,
                    "status": event.status,
                    "reward": event.reward,
                    "image_url": event.image_url
                }
            };
            userParticipations.push(participationWithEvent);
        }
    });

    // Group by participation status for better organization
    json[] interested = [];
    json[] willJoin = [];
    json[] participated = [];

    foreach json p in userParticipations {
        map<json> participationMap = <map<json>>p;
        if <boolean>participationMap["isParticipated"] {
            participated.push(p);
        } else if <string>participationMap["method"] == "WILL_JOIN" {
            willJoin.push(p);
        } else {
            interested.push(p);
        }
    }

    json response = {
        "userId": tokenUserId,
        "summary": {
            "total": userParticipations.length(),
            "interested": interested.length(),
            "willJoin": willJoin.length(),
            "participated": participated.length()
        },
        "participations": {
            "interested": interested,
            "willJoin": willJoin,
            "participated": participated
        }
    };

    check caller->respond(<http:Ok>{body: response});
}

// Get list of events the authenticated user has applied to (any method), with basic event details
public function getUserAppliedEvents(http:Caller caller, http:Request req) returns error? {
    // Auth
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return utils:unauthorized(caller);
    }
    string tokenStr = (<string>authHeader).substring(7);
    string|error tokenUserId = token:extractUserId(tokenStr);
    if tokenUserId is error {
        return utils:unauthorized(caller, "Invalid token");
    }

    // Fetch participations for user
    stream<Participant, error?>|error participations = participantCollection->find({"userId": tokenUserId});
    if participations is error {
        return caller->respond(<http:BadGateway>{body: "Server error"});
    }

    json[] results = [];
    check participations.forEach(function(Participant p) {
        Event|error|() evt = eventCollection->findOne({"_id": p.eventId});
        if evt is Event {
            results.push({
                "eventId": p.eventId,
                "method": p.method,
                "isParticipated": p.isParticipated,
                "appliedAt": p.createdAt,
                "event": {
                    "title": evt.eventTitle,
                    "date": evt.date,
                    "startTime": evt.startTime,
                    "endTime": evt.endTime,
                    "city": evt.city,
                    "latitude": evt.latitude,
                    "longitude": evt.longitude,
                    "status": evt.status,
                    "reward": evt.reward,
                    "image_url": evt.image_url
                }
            });
        }
    });

    check caller->respond(<http:Ok>{body: results});
}

// Get user's participation status for a specific event
public function getUserEventParticipation(http:Caller caller, http:Request req, string eventId) returns error? {
    // Get user ID from token
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is error || authHeader is () {
        return caller->respond(<http:Unauthorized>{body: "Authentication required"});
    }

    string tokenStr = (<string>authHeader).substring(7);
    string|error tokenUserId = token:extractUserId(tokenStr);

    if tokenUserId is error {
        return caller->respond(<http:Unauthorized>{body: "Invalid token"});
    }

    // Check if user has applied to this event
    Participant|error|() participation = participantCollection->findOne({
        "eventId": eventId,
        "userId": tokenUserId
    });

    if participation is error {
        return utils:serverError(caller);
    }

    if participation is () {
        // User hasn't applied to this event
        check caller->respond(<http:Ok>{
            body: {
                "hasApplied": false,
                "eventId": eventId,
                "message": "You have not applied to this event"
            }
        });
        return;
    }

    // Get event details
    Event|error|() event = eventCollection->findOne({"_id": eventId});
    if event is error {
        return utils:serverError(caller, "Server error retrieving event details");
    }

    json response = {
        "hasApplied": true,
        "participation": {
            "_id": participation._id,
            "eventId": participation.eventId,
            "userId": participation.userId,
            "name": participation.name,
            "method": participation.method,
            "isParticipated": participation.isParticipated,
            "createdAt": participation.createdAt
        }
    };

    // Add event details if available
    if event is Event {
        map<json> responseMap = <map<json>>response;
        responseMap["event"] = {
            "eventTitle": event.eventTitle,
            "eventDescription": event.eventDescription,
            "date": event.date,
            "startTime": event.startTime,
            "location": event.location,
            "city": event.city,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "status": event.status,
            "reward": event.reward
        };
        response = responseMap;
    }

    check caller->respond(<http:Ok>{body: response});
}

// Utility function to sync participant counts between collection and event arrays
public function syncParticipantCount(string eventId) returns error? {
    // Get all participants for this event from participant collection
    stream<Participant, error?>|error participants = participantCollection->find({"eventId": eventId});
    if participants is error {
        return participants;
    }

    string[] participantUserIds = [];
    check participants.forEach(function(Participant participant) {
        participantUserIds.push(participant.userId);
    });

    // Update the event's participant array to match the actual participants
    mongodb:UpdateResult|error updateResult = eventCollection->updateOne(
        {"_id": eventId},
        {"set": {"participant": participantUserIds}}
    );

    if updateResult is error {
        return updateResult;
    }

    return;
}

// Fix all participant count discrepancies (admin function)
public function fixAllParticipantCounts(http:Caller caller, http:Request req) returns error? {
    // Get all events
    stream<Event, error?>|error events = eventCollection->find({});
    if events is error {
        return utils:serverError(caller, "Server error retrieving events");
    }

    int fixedCount = 0;
    int errorCount = 0;

    check events.forEach(function(Event event) {
        error? syncResult = syncParticipantCount(event._id);
        if syncResult is error {
            errorCount += 1;
        } else {
            fixedCount += 1;
        }
    });

    check caller->respond(<http:Ok>{
        body: {
            message: "Participant count synchronization completed",
            eventsFixed: fixedCount,
            errors: errorCount
        }
    });
}
