// Server module - HTTP API routing and endpoint definitions
// Purpose: Routes HTTP requests to appropriate business logic modules
// Dependencies: All business logic modules (auth, events, users, etc.)

import civilquest_api.analytics;
import civilquest_api.audit;
import civilquest_api.auth;
import civilquest_api.events;
import civilquest_api.middleware;
import civilquest_api.notifications;
import civilquest_api.participants;
import civilquest_api.points;
import civilquest_api.sponsors;
import civilquest_api.user;
import civilquest_api.utils;

import ballerina/http;

public configurable int server_port = ?;

public listener http:Listener httpListener = new (server_port);

@http:ServiceConfig {
    cors: {
        allowOrigins: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
        allowCredentials: true,
        exposeHeaders: ["Content-Type", "Authorization"]
    }
}
service /api on httpListener {

    // ========================================
    // AUTHENTICATION ENDPOINTS  
    // ========================================

    // User login - Authenticate with email/password
    isolated resource function post auth/login(http:Caller caller, http:Request req) returns error? {
        check auth:login(caller, req);
    }

    // Registration initiation - Start user registration process
    isolated resource function post auth/register/init(http:Caller caller, http:Request req) returns error? {
        check auth:initRegisteration(caller, req);
    }

    // Registration completion - Complete user registration with OTP verification
    isolated resource function post auth/register/complete(http:Caller caller, http:Request req) returns error? {
        check auth:completeRegistration(caller, req);
    }

    isolated resource function post auth/password/reset/request(http:Caller caller, http:Request req) returns error? {
        check auth:requestPasswordResetOtp(caller, req);
    }

    isolated resource function post auth/password/reset/verify(http:Caller caller, http:Request req) returns error? {
        check auth:resetPassword(caller, req);
    }

    // ========================================
    // USER MANAGEMENT ENDPOINTS
    // ========================================

    // Premium membership application - User applies for premium status
    isolated resource function post users/premium/apply(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["USER"]);
        check user:requestPremium(caller, req);
    }

    // Premium approval - Admin approves premium membership request
    isolated resource function put users/[string userId]/premium/approve(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN_OPERATOR", "ADMIN"]);
        check user:approvePremium(caller, req, userId, true);
    }

    // Premium rejection - Admin rejects premium membership request
    isolated resource function put users/[string userId]/premium/reject(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN_OPERATOR"]);
        check user:approvePremium(caller, req, userId, false);
    }

    // ========================================
    // ADMIN MANAGEMENT ENDPOINTS (SUPER_ADMIN only)
    // ========================================

    // Create new admin account - Super admin creates admin accounts
    isolated resource function post accounts/admins(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["SUPER_ADMIN"]);
        check user:createAdmin(caller, req);
    }

    // Update admin account - Super admin updates admin information
    isolated resource function put accounts/admins/[string adminId](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["SUPER_ADMIN"]);
        check user:updateAdmin(caller, req, adminId);
    }

    isolated resource function delete accounts/admins/[string adminId](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["SUPER_ADMIN"]);
        check user:deleteAdmin(caller, req, adminId);
    }

    resource function get accounts/admins(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["SUPER_ADMIN"]);
        check user:getAllAdmins(caller, req);
    }

    // Admin manages admin operators (CRUD Operations)
    isolated resource function post accounts/admin_operators(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN"]);
        check user:createAdminOperator(caller, req);
    }

    resource function put accounts/admin_operators/[string operatorId](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN"]);
        check user:updateAdminOperator(caller, req, operatorId);
    }

    isolated resource function delete accounts/admin_operators/[string operatorId](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN"]);
        check user:deleteAdminOperator(caller, req, operatorId);
    }

    resource function get accounts/admin_operators(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN"]);
        check user:getAllAdminOperators(caller, req);
    }

    // ========================================
    // EVENT MANAGEMENT ENDPOINTS
    // ========================================

    // Create event - Admin operators and premium users can create events
    resource function post events(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "ADMIN_OPERATOR", "PREMIUM_USER"]);
        check events:createEvent(caller, req);
    }

    resource function put events/[string eventId]/approve(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "ADMIN_OPERATOR", "SUPER_ADMIN"]);
        check events:approveEvent(caller, req, eventId, true);
    }

    resource function put events/[string eventId]/reject(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "ADMIN_OPERATOR", "SUPER_ADMIN"]);
        check events:approveEvent(caller, req, eventId, false);
    }

    resource function post events/[string eventId]/end(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "ADMIN_OPERATOR", "PREMIUM_USER"]);
        check events:endEvent(caller, req, eventId);
    }

    // Sponsorships - Users, Premium Users, and Admin Operators can sponsor
    resource function post sponsors(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["USER", "PREMIUM_PENDING", "PREMIUM_USER", "ADMIN_OPERATOR"]);
        check sponsors:createSponsor(caller, req);
    }

    resource function put sponsors/[string sponsorId]/approve(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN_OPERATOR", "PREMIUM_USER"]);
        check sponsors:approveSponsor(caller, req, sponsorId, true);
    }

    resource function put sponsors/[string sponsorId]/reject(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN_OPERATOR", "PREMIUM_USER"]);
        check sponsors:approveSponsor(caller, req, sponsorId, false);
    }

    // Participants - Users and Premium Users can apply to events
    resource function post events/[string eventId]/apply(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["USER", "PREMIUM_PENDING", "PREMIUM_USER"]);
        check participants:applyToEvent(caller, req, eventId);
    }

    // Participation confirmation allowed only on the event day during the event time
    resource function post events/[string eventId]/participate(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["USER", "PREMIUM_USER"]);
        check participants:participateInEvent(caller, req, eventId);
    }

    // ===== NEW COMPREHENSIVE API ENDPOINTS =====

    // Event Management
    resource function get events(http:Caller caller, http:Request req) returns error? {
        check events:getEvents(caller, req);
    }

    // Provinces and cities mapping
    resource function get provinces(http:Caller caller, http:Request req) returns error? {
        map<string[]> mapping = events:getProvinceCityMapping();
        check caller->respond(<http:Ok>{body: mapping});
    }

    resource function get events/[string eventId](http:Caller caller, http:Request req) returns error? {
        check events:getEvent(caller, req, eventId);
    }

    resource function put events/[string eventId](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "ADMIN_OPERATOR", "PREMIUM_USER"]);
        check events:updateEvent(caller, req, eventId);
    }

    // Official sponsorship by Admin Operators
    resource function post sponsors/official(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN_OPERATOR"]);
        check sponsors:createOfficialSponsor(caller, req);
    }

    // Sponsor Management
    resource function get sponsors(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check sponsors:getSponsors(caller, req);
    }

    resource function get sponsors/[string sponsorId](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check sponsors:getSponsor(caller, req, sponsorId);
    }

    // Participant Management
    resource function get participants(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check participants:getParticipants(caller, req);
    }

    // Get user's own participation status across all events
    resource function get users/me/participations(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["USER", "PREMIUM_PENDING", "PREMIUM_USER"]);
        check participants:getUserParticipations(caller, req);
    }

    // Get the list of events the user has applied to (regardless of later participation)
    resource function get users/me/events/applied(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["USER", "PREMIUM_PENDING", "PREMIUM_USER"]);
        check participants:getUserAppliedEvents(caller, req);
    }

    // Get user's participation status for a specific event
    resource function get events/[string eventId]/participation/me(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["USER", "PREMIUM_PENDING", "PREMIUM_USER"]);
        check participants:getUserEventParticipation(caller, req, eventId);
    }

    resource function put events/[string eventId]/participants/[string participantId]/status(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN_OPERATOR"]);
        check participants:updateParticipationStatus(caller, req, eventId, participantId);
    }

    resource function delete events/[string eventId]/participants/[string participantId](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN_OPERATOR", "USER", "PREMIUM_PENDING", "PREMIUM_USER"]);
        check participants:removeParticipation(caller, req, eventId, participantId);
    }

    // Admin function to fix participant count discrepancies
    resource function post admin/participants/'sync\-counts(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN"]);
        check participants:fixAllParticipantCounts(caller, req);
    }

    // User Profile Management
    resource function get users/profile(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check user:getUserProfile(caller, req);
    }

    resource function put users/profile(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check user:updateUserProfile(caller, req);
    }

    // Admin functions for user management
    resource function get users/role/[string role](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["SUPER_ADMIN", "ADMIN", "ADMIN_OPERATOR"]);
        check user:getUsersByRole(caller, req, role);
    }

    // User search/filter capabilities
    resource function get users/search(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["SUPER_ADMIN", "ADMIN", "ADMIN_OPERATOR"]);
        check user:searchUsers(caller, req);
    }

    resource function get users/premium/pending(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN_OPERATOR", "ADMIN"]);
        check user:getPendingPremiumRequests(caller, req);
    }

    // Admin event management (for Admins to manage events) - CRUD operations
    resource function get admin/events(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN", "ADMIN_OPERATOR"]);
        check events:getEvents(caller, req);
    }

    // Event participant management
    resource function get events/[string eventId]/participants(http:Caller caller, http:Request req) returns error? {
        check participants:getEventParticipants(caller, req, eventId);
    }

    resource function delete events/[string eventId](http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "ADMIN_OPERATOR", "SUPER_ADMIN"]);
        check events:deleteEvent(caller, req, eventId);
    }

    // ===== POINTS MANAGEMENT ENDPOINTS =====

    // Get points history for a user
    resource function get users/[string userEmail]/points/history(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check points:getPointsHistory(caller, req, userEmail);
    }

    // Get points configuration (admin only)
    resource function get admin/points/config(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "ADMIN_OPERATOR"]);
        check points:getPointsConfig(caller, req);
    }

    // Update points configuration (admin only)
    resource function put admin/points/config(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN"]);
        check points:updatePointsConfig(caller, req);
    }

    // Administrative points adjustment (admin only)
    resource function post admin/points/adjust(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "ADMIN_OPERATOR"]);
        check points:adminAdjustPoints(caller, req);
    }

    // Public leaderboard/scoreboard with optional city filter and pagination
    resource function get points/leaderboard(http:Caller caller, http:Request req) returns error? {
        check points:getLeaderboard(caller, req);
    }

    // ===== NOTIFICATION MANAGEMENT ENDPOINTS =====

    // Get user notifications
    resource function get users/[string userId]/notifications(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        map<string[]> queryParams = req.getQueryParams();
        notifications:NotificationQueryParams parsed = notifications:parseNotificationQueryParams(queryParams);
        notifications:Notification[]|error userNotifications = notifications:getUserNotifications(userId, parsed.unreadOnly, parsed.limitCount);
        if userNotifications is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: userNotifications});
    }

    // Mark notification as read
    resource function put notifications/[string notificationId]/read(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);

        error? markResult = notifications:markNotificationRead(notificationId);
        if markResult is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: {message: "Notification marked as read"}});
    }

    // Mark all user notifications as read
    resource function put users/[string userId]/notifications/read(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);

        error? markResult = notifications:markAllNotificationsRead(userId);
        if markResult is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: {message: "All notifications marked as read"}});
    }

    // Get unread notification count
    resource function get users/[string userId]/notifications/count/unread(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);

        int|error unreadCount = notifications:getUnreadNotificationCount(userId);
        if unreadCount is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: {count: unreadCount}});
    }

    // ===== AUDIT LOG ENDPOINTS =====

    // Get audit logs (admin only)
    resource function get admin/audit/logs(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN"]);
        map<string[]> queryParams = req.getQueryParams();
        audit:AuditLogQueryParams params = audit:parseAuditLogQueryParams(queryParams);
        audit:AuditLog[]|error auditLogs = audit:getAuditLogs(params.userId, params.action, params.resourceType, params.startDate, params.endDate, params.limitCount, params.skipCount);
        if auditLogs is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: auditLogs});
    }

    // Get audit log count (admin only)
    resource function get admin/audit/logs/count(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN"]);
        map<string[]> queryParams = req.getQueryParams();
        audit:AuditLogQueryParams params = audit:parseAuditLogQueryParams(queryParams);
        int|error auditCount = audit:getAuditLogCount(params.userId, params.action, params.resourceType, params.startDate, params.endDate);
        if auditCount is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: {count: auditCount}});
    }

    // ===== ANALYTICS AND REPORTING ENDPOINTS =====

    // Get event analytics (admin only)
    resource function get admin/analytics/events(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN"]);
        map<string[]> queryParams = req.getQueryParams();
        analytics:DateRangeParams dr = analytics:parseDateRangeParams(queryParams);
        analytics:EventAnalytics|error eventAnalytics = analytics:getEventAnalytics(dr.startDate, dr.endDate);
        if eventAnalytics is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: eventAnalytics});
    }

    // Get user analytics (admin only)
    resource function get admin/analytics/users(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN"]);

        analytics:UserAnalytics|error userAnalytics = analytics:getUserAnalytics();
        if userAnalytics is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: userAnalytics});
    }

    // Get sponsorship analytics (admin only)
    resource function get admin/analytics/sponsorships(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN"]);
        map<string[]> queryParams = req.getQueryParams();
        analytics:DateRangeParams dr = analytics:parseDateRangeParams(queryParams);
        analytics:SponsorshipAnalytics|error sponsorshipAnalytics = analytics:getSponsorshipAnalytics(dr.startDate, dr.endDate);
        if sponsorshipAnalytics is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: sponsorshipAnalytics});
    }

    // Get participation analytics (admin only)
    resource function get admin/analytics/participation(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN"]);
        map<string[]> queryParams = req.getQueryParams();
        analytics:DateRangeParams dr = analytics:parseDateRangeParams(queryParams);
        analytics:ParticipationAnalytics|error participationAnalytics = analytics:getParticipationAnalytics(dr.startDate, dr.endDate);
        if participationAnalytics is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: participationAnalytics});
    }

    // Get top events by participation
    resource function get admin/analytics/events/top(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN", "ADMIN_OPERATOR"]);
        map<string[]> queryParams = req.getQueryParams();
        int limitCount = analytics:parseLimitParam(queryParams, "limit", 10);
        analytics:EventParticipationSummary[]|error topEvents = analytics:getTopEventsByParticipation(limitCount);
        if topEvents is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: topEvents});
    }

    // Get user activity summary
    isolated resource function get users/[string userId]/analytics/activity(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);

        analytics:UserActivitySummary|error userActivity = analytics:getUserActivitySummary(userId);
        if userActivity is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: userActivity});
    }

    // Get system health metrics (admin only)
    isolated resource function get admin/analytics/system/health(http:Caller caller, http:Request req) returns error? {
        check middleware:tokenValidation(caller, req);
        check middleware:assertAnyRole(caller, req, ["ADMIN", "SUPER_ADMIN"]);

        analytics:SystemHealthMetrics|error systemHealth = analytics:getSystemHealthMetrics();
        if systemHealth is error {
            return utils:serverError(caller);
        }

        check caller->respond(<http:Ok>{body: systemHealth});
    }
}

