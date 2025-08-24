import ballerina/crypto;
import ballerina/lang.'int;
import ballerina/log;
import ballerina/uuid;

const int DEFAULT_ITERATIONS = 50000;

isolated function deriveSha256(byte[] input, int iterations) returns byte[] {
    byte[] out = input;
    int i = 0;
    while i < iterations {
        out = crypto:hashSha256(out);
        i += 1;
    }
    return out;
}

isolated function bytesToHex(byte[] data) returns string {
    string hex = "";
    foreach byte b in data {
        int v = <int>b & 0xFF;
        string hx = int:toHexString(v);
        if (hx.length() == 1) {
            hex = hex + "0";
        }
        hex = hex + hx;
    }
    return hex;
}

public isolated function hashPassword(string password, int cost) returns string|error {
    // Map bcrypt-like cost to iterations
    int iterations = DEFAULT_ITERATIONS + (cost * 5000);
    // Random salt via UUID
    string salt = uuid:createRandomUuid();

    string combined = salt + ":" + password;
    byte[] digest = deriveSha256(combined.toBytes(), iterations);
    string hashHex = bytesToHex(digest);
    string stored = string `ssha256$${iterations}$${salt}$${hashHex}`;
    log:printInfo("password.hash: ssha256 generated");
    return stored;
}

public isolated function verifyPassword(string password, string stored) returns boolean|error {
    log:printInfo("password.verify: start");

    // Reject legacy bcrypt hashes since external APIs are not allowed now
    if stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$") {
        log:printError("password.verify: bcrypt hash provided but bcrypt is disabled");
        return false;
    }

    // Plaintext fallback for any accidental plaintext seeds
    if !stored.startsWith("ssha256$") {
        boolean ok = password == stored;
        if !ok {
            log:printError("password.verify: unsupported hash format and plaintext mismatch");
        }
        return ok;
    }

    // Parse ssha256$<iterations>$<salt>$<hashHex>
    int len = stored.length();
    int pos1 = -1;
    int pos2 = -1;
    int pos3 = -1;
    int i = 0;
    while i < len {
        string ch = stored.substring(i, i + 1);
        if ch == "$" {
            if pos1 == -1 {
                pos1 = i;
            } else if pos2 == -1 {
                pos2 = i;
            } else {
                pos3 = i;
                break;
            }
        }
        i += 1;
    }
    if pos1 == -1 || pos2 == -1 || pos3 == -1 {
        log:printError("password.verify: invalid stored hash format (delimiters)");
        return false;
    }
    string prefix = stored.substring(0, pos1);
    if prefix != "ssha256" {
        log:printError("password.verify: unsupported hash prefix");
        return false;
    }
    string iterStr = stored.substring(pos1 + 1, pos2);
    int|error iterationsResult = int:fromString(iterStr);
    if iterationsResult is error {
        log:printError("password.verify: invalid iterations value: " + iterStr);
        return false;
    }
    int iterations = iterationsResult;
    string salt = stored.substring(pos2 + 1, pos3);
    string hashHex = stored.substring(pos3 + 1, len);

    // Recompute
    string combined = salt + ":" + password;
    byte[] digest = deriveSha256(combined.toBytes(), iterations);
    string calcHex = bytesToHex(digest);
    boolean ok = calcHex == hashHex;
    log:printInfo(string `password.verify: result ${ok}`);
    return ok;
}

