import civilquest_api.token;
import civilquest_api.utils;

import ballerina/http;

// Validates JWT token from request headers
public isolated function tokenValidation(http:Caller caller, http:Request req) returns error? {
    // Extract Authorization header
    string|error? authHeader = req.getHeader("Authorization");
    if authHeader is string {
        string tokenStr = authHeader.substring(7);
        if token:validateToken(tokenStr) is error {
            check utils:unauthorized(caller); // Authentication required
            return error("Authentication failed");
        }
        return; // Success
    }
    check utils:unauthorized(caller);
    return error("Authentication missing");
}

// Validates user has required role permissions
public isolated function assertAnyRole(http:Caller caller, http:Request req, string[] allowedRoles) returns error? {
    // Extract Authorization header
    string|error? authHeader = req.getHeader("Authorization");

    if authHeader is string {
        string tokenStr = authHeader.substring(7);
        string|error role = token:extractRole(tokenStr);

        if role is string {
            // Check if user has any of the allowed roles
            foreach var allowedRole in allowedRoles {
                if allowedRole == role {
                    return; // Success - user has required role
                }
            }

            // User doesn't have required role
            check utils:forbidden(caller);
            return error("Forbidden: User lacks required role");
        } else {
            // Token extraction failed / invalid token
            check utils:unauthorized(caller, "Invalid token");
            return error("Invalid token");
        }
    } else {
        // No Authorization header
        check utils:unauthorized(caller);
        return error("Authentication failed");
    }
}

