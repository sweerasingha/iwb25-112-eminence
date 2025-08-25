import sachisw/cloudinary as cloudinary;

// Delegates to the external Cloudinary client and returns a JSON payload.
public function uploadImage(byte[] bytes, string folder, string filename) returns json|error {
    var res = check cloudinary:uploadSingleImage(bytes, folder, filename);
    return <json>res;
}

public function deleteImage(string publicId) returns json|error {
    var res = check cloudinary:deleteSingleImage(publicId);
    return <json>res;
}
