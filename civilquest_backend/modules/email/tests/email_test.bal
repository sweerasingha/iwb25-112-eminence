import ballerina/test;
import ballerina/email;

@test:Config {}
function testToSecurityMappings() {
    test:assertEquals(toSecurity("ssl"), email:SSL);
    test:assertEquals(toSecurity("START_TLS_AUTO"), email:START_TLS_AUTO);
    test:assertEquals(toSecurity("START_TLS_NEVER"), email:START_TLS_NEVER);
    // Unknown should fall through to ALWAYS
    test:assertEquals(toSecurity("something"), email:START_TLS_ALWAYS);
}
