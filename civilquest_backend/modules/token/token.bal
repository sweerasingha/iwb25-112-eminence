import ballerina/jwt;

configurable string secret_key = "test-secret";
configurable string private_key_path = "./keys/private.key";
configurable string public_key_path = "./keys/cert.pem";
configurable string issuer = "test-issuer";
configurable string audience = "test-audience";

// Generates JWT token with user credentials and role
public isolated function generateToken(string username, string role) returns string|error {
    jwt:IssuerConfig issuerConfig = {
        username: username,
        issuer: issuer,
        audience: audience,
        expTime: 36000,
        signatureConfig: {
            config: {
                keyFile: private_key_path
            }
        },
        customClaims: {
            "role": role
        }
    };

    // Issue the JWT token
    string jwt = check jwt:issue(issuerConfig);
    return jwt;
}

// Validates JWT token and returns payload
public isolated function validateToken(string token) returns jwt:Payload|error {
    jwt:ValidatorConfig validatorConfig = {
        issuer: issuer,
        audience: audience,
        clockSkew: 60,
        signatureConfig: {
            certFile: public_key_path
        }
    };

    // Validate the JWT token
    jwt:Payload result = check jwt:validate(token, validatorConfig);
    return result;
}

// Extracts user role from JWT token
public isolated function extractRole(string token) returns string|error {
    jwt:ValidatorConfig validatorConfig = {
        issuer: issuer,
        audience: audience,
        clockSkew: 60,
        signatureConfig: {
            certFile: public_key_path
        }
    };

    jwt:Payload|error payload = jwt:validate(token, validatorConfig);
    if payload is error {
        return error("Token validation failed");
    }

    // Check for role in payload
    anydata|() roleFromPayload = payload["role"];
    if roleFromPayload is string {
        return roleFromPayload;
    }

    // Check custom claims for role
    anydata|() cc = payload["customClaims"];
    if cc is map<anydata> {
        anydata|() rc = cc["role"];
        if rc is string {
            return rc;
        }
    } else if cc is map<json> {
        json|() rc = cc["role"];
        if rc is string {
            return rc;
        }
    }

    // Check all payload entries
    foreach var [key, value] in payload.entries() {
        if key == "role" && value is string {
            return value;
        }
    }

    return error("Role claim not found in token");
}

// Extracts user ID from JWT token
public isolated function extractUserId(string token) returns string|error {
    jwt:ValidatorConfig validatorConfig = {
        issuer: issuer,
        audience: audience,
        clockSkew: 60,
        signatureConfig: {
            certFile: public_key_path
        }
    };

    jwt:Payload|error payload = jwt:validate(token, validatorConfig);
    if payload is error {
        return error("Token validation failed");
    }

    // Check 'sub' claim (standard JWT subject)
    anydata|() subject = payload["sub"];
    if subject is string {
        return subject;
    }

    // Fallback to 'username' claim
    anydata|() username = payload["username"];
    if username is string {
        return username;
    }

    return error("User identifier not found in token");
}

