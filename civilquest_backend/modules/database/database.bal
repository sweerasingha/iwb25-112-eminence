import ballerina/io;
import ballerinax/mongodb;

configurable string mongodb_con_string = "mongodb://localhost:27017";
configurable string mongodb_database = "testdb";

final mongodb:Client mongoDb = check new ({
    connection: mongodb_con_string
});

public final mongodb:Database db;

function init() returns error? {
    db = check mongoDb->getDatabase(mongodb_database);
    io:println("[~] Connected to the MongoDb database.");
}

