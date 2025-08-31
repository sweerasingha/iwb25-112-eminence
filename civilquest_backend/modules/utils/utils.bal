import ballerina/http;
import ballerina/io;

// Sends a JSON response with specified status code
public isolated function jsonResponse(http:Caller caller, json payload, int statusCode) returns error? {
    http:Response resp = new;
    resp.setJsonPayload(payload);
    resp.statusCode = statusCode;
    check caller->respond(resp);
}

// Converts a hexadecimal string to a regular string
isolated function hexToString(string hex) returns string|error {
    string result = "";
    int hexLength = hex.length();
    int i = 0;
    while i < hexLength {
        if i + 2 <= hexLength {
            string hexPair = hex.substring(i, i + 2);
            int byteValue = check int:fromHexString(hexPair);
            result += check string:fromCodePointInt(byteValue);
        }
        i += 2;
    }
    return result;
}

// Decodes CivilQuest asset listing ABI-like hex response into structured JSON array
public isolated function decodeCivilquestData(string response) returns json|error {
    json[] listedcivilquests = [];

    // Remove the leading '0x'
    string abiResponse = response.substring(2);

    // Extract the number of civilquests
    string numberOfcivilquestsHex = abiResponse.substring(64, 128);

    int numberOfcivilquests = check int:fromString(numberOfcivilquestsHex.trim());

    int offset = 128 + 64 * numberOfcivilquests;

    // Iterate over each civilquest
    int i = 0;
    while i < numberOfcivilquests {
        // Extract Token ID
        string tokenIDHex = abiResponse.substring(offset, offset + 64);
        int tokenID = check int:fromString(tokenIDHex.trim());

        // Move to next field (Price)
        offset += 128;

        // Extract Price
        string priceHex = abiResponse.substring(offset, offset + 64);
        int priceWei = check int:fromHexString(priceHex.trim());

        // Move to next field (URI length + URI)
        offset += 64;

        // Extract Token URI length
        string uriLengthHex = abiResponse.substring(offset, offset + 64);
        int uriLength = check int:fromHexString(uriLengthHex.trim());

        // Move to the actual URI data (hex encoded string)
        offset += 64;
        string tokenURIHex = abiResponse.substring(offset, offset + (uriLength * 2));

        string tokenURI = check hexToString(tokenURIHex);

        json civilquestData = {
            "tokenID": tokenID,
            "priceWei": priceWei,
            "tokenURI": tokenURI
        };

        listedcivilquests.push(civilquestData);

        offset += (uriLength * 2 + 56);
        i += 1;
    }

    return listedcivilquests;
}

// Function to retrieve images from the uploads dir
public isolated function retrieveImage(http:Caller caller, string imagePath) returns error? {
    string filePath = "./uploads/" + imagePath;

    byte[] content = check io:fileReadBytes(filePath);

    http:Response response = new;

    check response.setContentType("application/octet-stream");
    response.setHeader("Content-Type", "application/octet-stream");
    response.setHeader("Content-Description", "File Transfer");
    response.setHeader("Transfer-Encoding", "chunked");
    response.setHeader("Content-Disposition", "attachment; filename=" + imagePath);
    response.setBinaryPayload(content);

    check caller->respond(response);
}

// Backward compatibility (deprecated names)
public isolated function decodecivilquestData(string response) returns json|error => decodeCivilquestData(response);

public isolated function retriviewImage(http:Caller caller, string imagePath) returns error? => retrieveImage(caller, imagePath);

// Send a standardized error JSON body with provided status record type (e.g., <http:BadRequest>)
public isolated function sendError(http:Caller caller, string message, int statusCode = 500) returns error? {
    http:Response resp = new;
    resp.statusCode = statusCode;
    json payload = {"error": message};
    resp.setJsonPayload(payload);
    check caller->respond(resp);
}

// Convenience wrappers matching coding standards messages
public isolated function badRequest(http:Caller caller, string msg) returns error? => sendError(caller, msg, 400);

public isolated function unauthorized(http:Caller caller, string msg = "Authentication required") returns error? => sendError(caller, msg, 401);

public isolated function forbidden(http:Caller caller, string msg = "Insufficient permissions") returns error? => sendError(caller, msg, 403);

public isolated function notFound(http:Caller caller, string msg = "Resource not found") returns error? => sendError(caller, msg, 404);

public isolated function serverError(http:Caller caller, string msg = "Server error") returns error? => sendError(caller, msg, 502);

// Internal helpers for trigonometric and sqrt approximations (sufficient for ~500m checks)
isolated function toRadians(float deg) returns float => deg * 3.14159265358979323846 / 180.0;

// Cosine approximation using Taylor series up to x^10 term
isolated function cosApprox(float x) returns float {
    float x2 = x * x;
    float term = 1.0;
    float sum = 1.0;
    // k from 1..5 computes terms for 2,4,6,8,10
    int k = 1;
    while k <= 5 {
        float denom = (2.0 * k - 1.0) * (2.0 * k);
        term = term * x2 / denom;
        // alternate signs: -, +, -, +, -
        if (k % 2 == 1) {
            sum -= term;
        } else {
            sum += term;
        }
        k += 1;
    }
    return sum;
}

// Square root approximation via Newton-Raphson
isolated function sqrtApprox(float v) returns float {
    if v <= 0.0 {
        return 0.0;
    }
    float x = v > 1.0 ? v / 2.0 : 1.0;
    int i = 0;
    while i < 8 {
        x = 0.5 * (x + v / x);
        i += 1;
    }
    return x;
}

// Calculate approximate great-circle distance between two coordinates in meters using equirectangular approximation
public isolated function calculateHaversineDistanceMeters(float lat1, float lon1, float lat2, float lon2) returns float {
    // Convert degrees to radians
    float φ1 = toRadians(lat1);
    float φ2 = toRadians(lat2);
    float Δφ = toRadians(lat2 - lat1);
    float Δλ = toRadians(lon2 - lon1);

    // Haversine formula
    float sinDφ2 = float:sin(Δφ / 2.0);
    float sinDλ2 = float:sin(Δλ / 2.0);
    float a = sinDφ2 * sinDφ2 + float:cos(φ1) * float:cos(φ2) * sinDλ2 * sinDλ2;
    float sqrtA = float:sqrt(a);
    if sqrtA > 1.0 {
        sqrtA = 1.0;
    }
    float c = 2.0 * float:asin(sqrtA);
    float R = 6371000.0; // meters
    return R * c;
}

