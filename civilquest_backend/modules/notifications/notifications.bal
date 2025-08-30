import civilquest_api.database;
import civilquest_api.email;

import ballerina/time;
import ballerina/uuid;
import ballerinax/mongodb;

public type Notification record {|
    string _id;
    string userId;
    string notificationType;
    string title;
    string message;
    string? relatedId;
    boolean read = false;
    string timestamp;
    json? metadata;
|};

// Flexible typed document shape for reading from MongoDB
type UserDoc record {|
    string|anydata _id?;
    string email?;
    anydata...;
|};

final mongodb:Collection notificationCollection;
final mongodb:Collection userCollection;

function init() returns error? {
    notificationCollection = check database:db->getCollection("notifications");
    userCollection = check database:db->getCollection("users");
}

public type NotificationQueryParams record {|
    boolean unreadOnly;
    int limitCount;
|};

// Parse notification related query parameters (unreadOnly, limit)
public isolated function parseNotificationQueryParams(map<string[]> params) returns NotificationQueryParams {
    boolean unreadOnly = false;
    int limitCount = 50;

    if params.hasKey("unreadOnly") {
        string[]? unreadArr = params["unreadOnly"];
        if unreadArr is string[] && unreadArr.length() > 0 {
            unreadOnly = unreadArr[0] == "true";
        }
    }

    if params.hasKey("limit") {
        string[]? limitArr = params["limit"];
        if limitArr is string[] && limitArr.length() > 0 {
            int|error parsed = int:fromString(limitArr[0]);
            if parsed is int {
                limitCount = parsed;
            }
        }
    }

    return {unreadOnly, limitCount};
}

// Creates a new notification for a user
public isolated function createNotification(
        string userId,
        string notifType,
        string title,
        string message,
        string? relatedId = (),
        json? metadata = ()
) returns error? {
    string notificationId = uuid:createRandomUuid();
    string now = time:utcToString(time:utcNow());

    Notification notification = {
        _id: notificationId,
        userId: userId,
        notificationType: notifType,
        title: title,
        message: message,
        relatedId: relatedId,
        read: false,
        timestamp: now,
        metadata: metadata
    };

    error? insertResult = notificationCollection->insertOne(notification);
    if insertResult is error {
        return insertResult;
    }
}

// Send notification and email
public isolated function sendNotificationWithEmail(
        string userId,
        string notifType,
        string title,
        string message,
        string? relatedId = (),
        json? metadata = ()
) returns error? {

    // Create in-app notification
    check createNotification(userId, notifType, title, message, relatedId, metadata);

    // Get user email for sending email notification
    UserDoc|error|() userDoc = userCollection->findOne({"email": userId});
    if userDoc is error {
        return;
    }

    if userDoc is () {
        return;
    }

    // Send email notification
    error? emailResult = email:sendEmail(userId, title, message);
    if emailResult is error {
        // Continue operation even if email fails
    }
}

// Event approval notification
public isolated function notifyEventApproval(string creatorEmail, string eventTitle, boolean approved) returns error? {
    string title = approved ? "Event Approved" : "Event Rejected";
    string message = approved ?
        "Your event '" + eventTitle + "' has been approved and is now live!" :
        "Your event '" + eventTitle + "' has been rejected. Please review and resubmit.";

    string notifType = approved ? "EVENT_APPROVED" : "EVENT_REJECTED";

    check sendNotificationWithEmail(
            creatorEmail,
            notifType,
            title,
            message,
            (),
            {"eventTitle": eventTitle}
    );
}

// Premium status notification
// Premium membership approval notification
public isolated function notifyPremiumApproval(string userEmail, boolean approved) returns error? {
    string title = approved ? "Premium Status Approved" : "Premium Status Rejected";
    string message = approved ?
        "Congratulations! Your premium user application has been approved. You now have access to premium features. Please log out and login again." :
        "Your premium user application has been rejected. Please contact support for more information.";

    string notifType = approved ? "PREMIUM_APPROVED" : "PREMIUM_REJECTED";

    check sendNotificationWithEmail(
            userEmail,
            notifType,
            title,
            message
    );
}

// Sponsorship notification
public isolated function notifySponsorshipApproval(string sponsorEmail, string eventTitle, boolean approved, decimal amount) returns error? {
    string title = approved ? "Sponsorship Approved" : "Sponsorship Rejected";
    string message = approved ?
        "Your sponsorship of Rs. " + amount.toString() + " for '" + eventTitle + "' has been approved!" :
        "Your sponsorship for '" + eventTitle + "' has been rejected. Please contact the event organizer.";

    string notifType = approved ? "SPONSORSHIP_APPROVED" : "SPONSORSHIP_REJECTED";

    check sendNotificationWithEmail(
            sponsorEmail,
            notifType,
            title,
            message,
            (),
            {"eventTitle": eventTitle, "amount": amount}
    );
}

// Event reminder notification
public isolated function notifyEventReminder(string participantEmail, string eventTitle, string eventDate, string location) returns error? {
    string title = "Event Reminder";
    string message = "Don't forget! The event '" + eventTitle + "' is scheduled for " + eventDate + " at " + location + ".";

    check sendNotificationWithEmail(
            participantEmail,
            "EVENT_REMINDER",
            title,
            message,
            (),
            {"eventTitle": eventTitle, "eventDate": eventDate, "location": location}
    );
}

// Points award notification
public isolated function notifyPointsAwarded(string userEmail, int points, string reason) returns error? {
    string title = "Points Awarded";
    string message = "You've earned " + points.toString() + " points! " + reason;

    check createNotification(
            userEmail,
            "POINTS_AWARDED",
            title,
            message,
            (),
            {"points": points, "reason": reason}
    );
}

// Event completion notification
public isolated function notifyEventCompleted(string creatorEmail, string eventTitle) returns error? {
    string title = "Event Completed";
    string message = "Your event '" + eventTitle + "' has been marked as completed. Thank you for organizing!";

    check sendNotificationWithEmail(
            creatorEmail,
            "EVENT_COMPLETED",
            title,
            message,
            (),
            {"eventTitle": eventTitle}
    );
}

// Get user notifications
public function getUserNotifications(string userId, boolean? unreadOnly = false, int limitCount = 50) returns Notification[]|error {
    map<json> filter = {"userId": userId};

    if unreadOnly == true {
        filter["read"] = false;
    }

    mongodb:FindOptions findOptions = {
        sort: {"timestamp": -1} // Most recent first
    };

    stream<Notification, error?>|error notificationStream = notificationCollection->find(filter, findOptions);
    if notificationStream is error {
        return notificationStream;
    }

    Notification[] notifications = [];
    int count = 0;

    check notificationStream.forEach(function(Notification notification) {
        if count < limitCount {
            notifications.push(notification);
            count += 1;
        }
    });

    return notifications;
}

// Mark notification as read
public function markNotificationRead(string notificationId) returns error? {
    mongodb:UpdateResult|error updateResult = notificationCollection->updateOne(
        {"_id": notificationId},
        {"set": {"read": true}}
    );

    if updateResult is error {
        return updateResult;
    }

    if updateResult.matchedCount == 0 {
        return error("Notification not found");
    }
}

// Mark all user notifications as read
public function markAllNotificationsRead(string userId) returns error? {
    mongodb:UpdateResult|error updateResult = notificationCollection->updateMany(
        {"userId": userId, "read": false},
        {"set": {"read": true}}
    );

    if updateResult is error {
        return updateResult;
    }

    return;
}

// Get unread notification count
public function getUnreadNotificationCount(string userId) returns int|error {
    int|error count = notificationCollection->countDocuments({"userId": userId, "read": false});
    return count;
}

// Delete old notifications (cleanup)
public function deleteOldNotifications(int daysOld = 30) returns error? {
    time:Utc cutoffTime = time:utcNow();
    time:Seconds secondsToSubtract = <time:Seconds>(daysOld * 24 * 60 * 60);
    time:Utc oldTime = time:utcAddSeconds(cutoffTime, -secondsToSubtract);
    string cutoffTimestamp = time:utcToString(oldTime);

    mongodb:DeleteResult|error deleteResult = notificationCollection->deleteMany({
        "timestamp": {"$lt": cutoffTimestamp},
        "read": true
    });

    if deleteResult is error {
        return deleteResult;
    }
}

