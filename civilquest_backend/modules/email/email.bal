import ballerina/email;

configurable string SMTP_HOST = "localhost";
configurable int SMTP_PORT = 2525;
configurable string SMTP_USER = "user";
configurable string SMTP_PASS = "pass";
configurable string FROM_EMAIL = "noreply@example.com";
configurable string SMTP_SECURITY = "START_TLS_NEVER";

function toSecurity(string mode) returns email:Security {
    string m = mode.toUpperAscii();
    if m == "SSL" {
        return email:SSL;
    } else if m == "START_TLS_AUTO" {
        return email:START_TLS_AUTO;
    } else if m == "START_TLS_NEVER" {
        return email:START_TLS_NEVER;
    }
    return email:START_TLS_ALWAYS;
}

final email:SmtpClient smtpClient = checkpanic new (
    SMTP_HOST,
    SMTP_USER,
    SMTP_PASS,
    {
        port: SMTP_PORT,
        security: toSecurity(SMTP_SECURITY)
    }
);

public isolated function sendEmail(string to, string subject, string text) returns error? {
    email:Message msg = {
        to: [to],
        subject,
        body: text,
        'from: FROM_EMAIL
    };
    error? sendResult = smtpClient->sendMessage(msg);
    if sendResult is error {
        return sendResult;
    }
}
