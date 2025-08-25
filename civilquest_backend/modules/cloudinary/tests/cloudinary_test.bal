import ballerina/test;

import sachisw/cloudinary.core as core;

// Mock the imported functions from `sachisw/cloudinary` so tests don't call the real API.
@test:Mock {
    moduleName: "sachisw/cloudinary",
    functionName: "uploadSingleImage"
}
test:MockFunction uploadSingleImageMock = new ();

@test:Mock {
    moduleName: "sachisw/cloudinary",
    functionName: "deleteSingleImage"
}
test:MockFunction deleteSingleImageMock = new ();

// No custom mock functions needed; we use thenReturn() with values and errors.

// --- Tests ---
@test:Config {}
function testUploadImage_success() {
    // Return a fake Cloudinary response typed as core:UploadResult
    core:UploadResult mockUpload = {
        secure_url: "https://res.cloudinary.com/test/profiles/pic.jpg",
        public_id: "profiles/pic.jpg",
        "original_filename": "pic.jpg",
        "folder": "profiles"
    };
    test:when(uploadSingleImageMock).thenReturn(mockUpload);

    byte[] data = [0x61, 0x62, 0x63]; // "abc"
    json|error res = uploadImage(data, "profiles", "pic.jpg");

    test:assertFalse(res is error, msg = "expected json, got error");
    if res is map<json> {
        test:assertEquals(<string>res["public_id"], "profiles/pic.jpg");
        test:assertEquals(<string>res["folder"], "profiles");
        test:assertEquals(<string>res["original_filename"], "pic.jpg");
    } else {
        test:assertFail("expected JSON object");
    }
}

@test:Config {}
function testUploadImage_error() {
    // Return an error to simulate failure
    test:when(uploadSingleImageMock).thenReturn(error("mock upload failed"));

    byte[] empty = [];
    json|error res = uploadImage(empty, "x", "y");
    test:assertTrue(res is error, msg = "expected error on mocked failure");
}

@test:Config {}
function testDeleteImage_success() {
    core:DestroyResult mockDestroy = {result: "ok", "public_id": "profiles/pic.jpg"};
    test:when(deleteSingleImageMock).thenReturn(mockDestroy);

    string publicId = "profiles/pic.jpg";
    json|error res = deleteImage(publicId);
    test:assertFalse(res is error, msg = "expected json, got error");
    if res is map<json> {
        test:assertEquals(<string>res["result"], "ok");
        test:assertEquals(<string>res["public_id"], publicId);
    } else {
        test:assertFail("expected JSON object");
    }
}

@test:Config {}
function testDeleteImage_error() {
    test:when(deleteSingleImageMock).thenReturn(error("mock delete failed"));

    json|error res = deleteImage("profiles/missing.jpg");
    test:assertTrue(res is error, msg = "expected error on mocked delete failure");
}

