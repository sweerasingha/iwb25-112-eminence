import ballerina/test;

@test:Config {}
function testEvaluateSponsorApprovalApprove() {
    Sponsor s = { _id: "id1", userId: "u1", eventId: "e1", sponsorType: "AMOUNT", amount: 10.0, donationAmount: (), donation: (), description: "d", approvedStatus: "PENDING", createdAt: "t", updatedAt: "t" };
    [string, boolean] r = evaluateSponsorApproval(s, true);
    test:assertEquals(r[0], "APPROVED");
    test:assertTrue(r[1]);
}

@test:Config {}
function testEvaluateSponsorApprovalReject() {
    Sponsor s = { _id: "id2", userId: "u2", eventId: "e2", sponsorType: "DONATION", amount: (), donationAmount: 5.0, donation: "Books", description: "d", approvedStatus: "PENDING", createdAt: "t", updatedAt: "t" };
    [string, boolean] r = evaluateSponsorApproval(s, false);
    test:assertEquals(r[0], "REJECTED");
    test:assertFalse(r[1]);
}
