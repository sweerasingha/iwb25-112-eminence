import civilquest_api.database;

import ballerina/time;
import ballerinax/mongodb;

// Analytics types
public type EventAnalytics record {|
    int totalEvents;
    int approvedEvents;
    int rejectedEvents;
    int pendingEvents;
    int endedEvents;
    int totalParticipants;
    int totalSponsors;
    decimal totalSponsorshipAmount;
|};

public type UserAnalytics record {|
    int totalUsers;
    int premiumUsers;
    int premiumPendingUsers;
    int adminOperators;
    int admins;
    int verifiedUsers;
    int totalPoints;
|};

public type SponsorshipAnalytics record {|
    int totalSponsorships;
    int approvedSponsorships;
    int rejectedSponsorships;
    int pendingSponsorships;
    decimal totalAmount;
    decimal averageAmount;
|};

public type ParticipationAnalytics record {|
    int totalParticipations;
    int actualParticipations;
    int interestedParticipations;
    int willJoinParticipations;
|};

public type EventParticipationSummary record {|
    string eventId;
    string eventTitle;
    int participantCount;
|};

public type UserActivitySummary record {|
    int eventsCreated;
    int eventsParticipated;
    int sponsorshipsProvided;
    int totalPointsEarned;
|};

public type SystemHealthMetrics record {|
    int totalUsers;
    int activeEvents;
    int pendingApprovals;
    string systemUptime;
|};

public type DateRangeParams record {|
    string? startDate;
    string? endDate;
|};

// Generic date range parser used by multiple analytics endpoints
public isolated function parseDateRangeParams(map<string[]> params) returns DateRangeParams {
    string? startDate = ();
    string? endDate = ();
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
    return {startDate, endDate};
}

// Parse an integer limit parameter with a default (e.g., top events)
public isolated function parseLimitParam(map<string[]> params, string name = "limit", int defaultVal = 10) returns int {
    int limitVal = defaultVal;
    if params.hasKey(name) {
        string[]? arr = params[name];
        if arr is string[] && arr.length() > 0 {
            int|error parsed = int:fromString(arr[0]);
            if parsed is int {
                limitVal = parsed;
            }
        }
    }
    return limitVal;
}

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

// Get event analytics
public function getEventAnalytics(string? startDate = (), string? endDate = ()) returns EventAnalytics|error {
    map<json> filter = {};

    if startDate is string && endDate is string {
        filter["createdAt"] = {
            "$gte": startDate,
            "$lte": endDate
        };
    }

    // Get total events
    int totalEvents = check eventCollection->countDocuments(filter);

    // Get events by status
    map<json> approvedFilter = filter.clone();
    approvedFilter["status"] = "APPROVED";
    int approvedEvents = check eventCollection->countDocuments(approvedFilter);

    map<json> rejectedFilter = filter.clone();
    rejectedFilter["status"] = "REJECTED";
    int rejectedEvents = check eventCollection->countDocuments(rejectedFilter);

    map<json> pendingFilter = filter.clone();
    pendingFilter["status"] = "PENDING";
    int pendingEvents = check eventCollection->countDocuments(pendingFilter);

    map<json> endedFilter = filter.clone();
    endedFilter["status"] = "ENDED";
    int endedEvents = check eventCollection->countDocuments(endedFilter);

    // Get participation and sponsorship counts
    int totalParticipants = 0;
    int totalSponsors = 0;
    decimal totalSponsorshipAmount = 0.0d;

    // Aggregate participation count
    totalParticipants = check participantCollection->countDocuments({});

    // Aggregate sponsorship data
    totalSponsors = check sponsorCollection->countDocuments({});

    // Calculate total sponsorship amount (simplified - in real implementation, use aggregation)
    stream<record {}, error?>|error sponsorStream = sponsorCollection->find({});
    if sponsorStream is stream<record {}, error?> {
        check sponsorStream.forEach(function(record {} sponsor) {
            // Extract amount field if available
            if sponsor.hasKey("amount") {
                decimal|error amount = decimal:fromString(sponsor["amount"].toString());
                if amount is decimal {
                    totalSponsorshipAmount += amount;
                }
            }
        });
    }

    return {
        totalEvents: totalEvents,
        approvedEvents: approvedEvents,
        rejectedEvents: rejectedEvents,
        pendingEvents: pendingEvents,
        endedEvents: endedEvents,
        totalParticipants: totalParticipants,
        totalSponsors: totalSponsors,
        totalSponsorshipAmount: totalSponsorshipAmount
    };
}

// Get user analytics
public function getUserAnalytics() returns UserAnalytics|error {
    int totalUsers = check userCollection->countDocuments({});

    int premiumUsers = check userCollection->countDocuments({"role": "PREMIUM_USER"});
    int premiumPendingUsers = check userCollection->countDocuments({"role": "PREMIUM_PENDING"});
    int adminOperators = check userCollection->countDocuments({"role": "ADMIN_OPERATOR"});
    int admins = check userCollection->countDocuments({"role": "ADMIN"});
    int verifiedUsers = check userCollection->countDocuments({"verified": true});

    // Calculate total points (simplified)
    int totalPoints = 0;
    stream<record {}, error?>|error userStream = userCollection->find({});
    if userStream is stream<record {}, error?> {
        check userStream.forEach(function(record {} user) {
            if user.hasKey("points") {
                int|error points = int:fromString(user["points"].toString());
                if points is int {
                    totalPoints += points;
                }
            }
        });
    }

    return {
        totalUsers: totalUsers,
        premiumUsers: premiumUsers,
        premiumPendingUsers: premiumPendingUsers,
        adminOperators: adminOperators,
        admins: admins,
        verifiedUsers: verifiedUsers,
        totalPoints: totalPoints
    };
}

// Get sponsorship analytics
public function getSponsorshipAnalytics(string? startDate = (), string? endDate = ()) returns SponsorshipAnalytics|error {
    map<json> filter = {};

    if startDate is string && endDate is string {
        filter["createdAt"] = {
            "$gte": startDate,
            "$lte": endDate
        };
    }

    int totalSponsorships = check sponsorCollection->countDocuments(filter);

    map<json> approvedFilter = filter.clone();
    approvedFilter["approvedStatus"] = "APPROVED";
    int approvedSponsorships = check sponsorCollection->countDocuments(approvedFilter);

    map<json> rejectedFilter = filter.clone();
    rejectedFilter["approvedStatus"] = "REJECTED";
    int rejectedSponsorships = check sponsorCollection->countDocuments(rejectedFilter);

    map<json> pendingFilter = filter.clone();
    pendingFilter["approvedStatus"] = "PENDING";
    int pendingSponsorships = check sponsorCollection->countDocuments(pendingFilter);

    decimal totalAmount = 0.0d;
    int sponsorshipCount = 0;

    stream<record {}, error?>|error sponsorStream = sponsorCollection->find(filter);
    if sponsorStream is stream<record {}, error?> {
        check sponsorStream.forEach(function(record {} sponsor) {
            if sponsor.hasKey("amount") {
                decimal|error amount = decimal:fromString(sponsor["amount"].toString());
                if amount is decimal {
                    totalAmount += amount;
                    sponsorshipCount += 1;
                }
            }
        });
    }

    decimal averageAmount = sponsorshipCount > 0 ? totalAmount / <decimal>sponsorshipCount : 0.0d;

    return {
        totalSponsorships: totalSponsorships,
        approvedSponsorships: approvedSponsorships,
        rejectedSponsorships: rejectedSponsorships,
        pendingSponsorships: pendingSponsorships,
        totalAmount: totalAmount,
        averageAmount: averageAmount
    };
}

// Get participation analytics
public function getParticipationAnalytics(string? startDate = (), string? endDate = ()) returns ParticipationAnalytics|error {
    map<json> filter = {};

    if startDate is string && endDate is string {
        filter["createdAt"] = {
            "$gte": startDate,
            "$lte": endDate
        };
    }

    int totalParticipations = check participantCollection->countDocuments(filter);

    map<json> actualFilter = filter.clone();
    actualFilter["isParticipated"] = true;
    int actualParticipations = check participantCollection->countDocuments(actualFilter);

    map<json> interestedFilter = filter.clone();
    interestedFilter["method"] = "INTERESTED";
    int interestedParticipations = check participantCollection->countDocuments(interestedFilter);

    map<json> willJoinFilter = filter.clone();
    willJoinFilter["method"] = "WILL_JOIN";
    int willJoinParticipations = check participantCollection->countDocuments(willJoinFilter);

    return {
        totalParticipations: totalParticipations,
        actualParticipations: actualParticipations,
        interestedParticipations: interestedParticipations,
        willJoinParticipations: willJoinParticipations
    };
}

// Get top events by participation
public function getTopEventsByParticipation(int limitCount = 10) returns EventParticipationSummary[]|error {
    // This would typically use MongoDB aggregation pipeline
    // For now, we'll implement a simplified version

    stream<record {}, error?>|error eventStream = eventCollection->find({});
    if eventStream is error {
        return eventStream;
    }

    EventParticipationSummary[] topEvents = [];

    check eventStream.forEach(function(record {} event) {
        if event.hasKey("_id") && event.hasKey("eventTitle") && event.hasKey("participant") {
            string eventId = event["_id"].toString();
            string eventTitle = event["eventTitle"].toString();

            // Count participants for this event
            int|error participantCount = participantCollection->countDocuments({"eventId": eventId});
            if participantCount is int {
                topEvents.push({
                    eventId: eventId,
                    eventTitle: eventTitle,
                    participantCount: participantCount
                });
            }
        }
    });

    // Sort by participant count (descending) manually
    int n = topEvents.length();
    int i = 0;
    while i < n {
        int maxIdx = i;
        int j = i + 1;
        while j < n {
            if topEvents[j].participantCount > topEvents[maxIdx].participantCount {
                maxIdx = j;
            }
            j += 1;
        }
        if maxIdx != i {
            EventParticipationSummary tmp = topEvents[i];
            topEvents[i] = topEvents[maxIdx];
            topEvents[maxIdx] = tmp;
        }
        i += 1;
    }

    // Limit results
    if n > limitCount {
        return topEvents.slice(0, limitCount);
    }
    return topEvents;
}

// Get user activity summary
public isolated function getUserActivitySummary(string userId) returns UserActivitySummary|error {

    // Count events created
    int eventsCreated = check eventCollection->countDocuments({"createdBy": userId});

    // Count events participated
    int eventsParticipated = check participantCollection->countDocuments({"userId": userId});

    // Count sponsorships provided
    int sponsorshipsProvided = check sponsorCollection->countDocuments({"sponsorId": userId});

    // Get total points (from user record)
    record {}|error|() user = userCollection->findOne({"email": userId});
    int totalPointsEarned = 0;
    if user is record {} && user.hasKey("points") {
        int|error points = int:fromString(user["points"].toString());
        if points is int {
            totalPointsEarned = points;
        }
    }

    return {
        eventsCreated: eventsCreated,
        eventsParticipated: eventsParticipated,
        sponsorshipsProvided: sponsorshipsProvided,
        totalPointsEarned: totalPointsEarned
    };
}

// Get system health metrics
public isolated function getSystemHealthMetrics() returns SystemHealthMetrics|error {

    int totalUsers = check userCollection->countDocuments({});
    int activeEvents = check eventCollection->countDocuments({"status": "APPROVED"});

    // Count pending approvals across different types
    int pendingEvents = check eventCollection->countDocuments({"status": "PENDING"});
    int pendingPremium = check userCollection->countDocuments({"role": "PREMIUM_PENDING"});
    int pendingSponsors = check sponsorCollection->countDocuments({"approvedStatus": "PENDING"});
    int pendingApprovals = pendingEvents + pendingPremium + pendingSponsors;

    string systemUptime = time:utcToString(time:utcNow());

    return {
        totalUsers: totalUsers,
        activeEvents: activeEvents,
        pendingApprovals: pendingApprovals,
        systemUptime: systemUptime
    };
}

