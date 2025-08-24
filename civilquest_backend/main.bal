import civilquest_api.bootstrap;
import civilquest_api.server;

import ballerina/io;
import ballerina/log;

public function main() returns error? {
    // Initialize system and ensure integrity
    log:printInfo("Initializing CivilQuest API system...");

    error? systemCheck = bootstrap:checkSystemIntegrity();
    if systemCheck is error {
        log:printError("System integrity check failed: " + systemCheck.message());
        return systemCheck;
    }

    io:println("[~] System integrity check completed successfully.");
    io:println("[~] Listening on the port " + server:server_port.toString() + ".");
    io:println("[~] API initialization completed.");
}
