import ballerina/crypto;
import ballerina/http;
import ballerina/mime;
import ballerina/time;

configurable string cloud_name = "demo";
configurable string? upload_preset = ();
configurable string? api_key = ();
configurable string? api_secret = ();

// Upload an image to Cloudinary. Prefer signed upload when api_key/api_secret are set; otherwise use unsigned preset.
public function uploadImage(byte[] bytes, string folder, string filename) returns json|error {
    string cn = cloud_name.trim();
    http:Client cloud = check new (string `https://api.cloudinary.com/v1_1/${cn}/image/upload`);

    mime:Entity imagePart = new;
    _ = imagePart.addHeader("Content-Disposition", string `form-data; name="file"; filename="${filename}"`);
    mime:Error? byteError = imagePart.setByteArray(bytes, contentType = "application/octet-stream");
    if byteError is mime:Error {
        return error("Failed to set byte array");
    }

    mime:Entity folderPart = new;
    _ = folderPart.addHeader("Content-Disposition", "form-data; name=\"folder\"");
    mime:Error? folderError = folderPart.setText(folder);
    if folderError is mime:Error {
        return error("Failed to set folder text");
    }

    http:Request req = new;

    if api_key is string && api_secret is string {
        int ts = getEpochSeconds();
        string tsStr = ts.toString();

        string apiSecret = <string>api_secret;
        string paramString = string `folder=${folder}&timestamp=${tsStr}${apiSecret}`;
        byte[] sha = crypto:hashSha1(paramString.toBytes());
        string signature = toHex(sha);

        mime:Entity apiKeyPart = new;
        _ = apiKeyPart.addHeader("Content-Disposition", "form-data; name=\"api_key\"");
        string apiKey = <string>api_key;
        mime:Error? kErr = apiKeyPart.setText(apiKey);
        if kErr is mime:Error {
            return error("Failed to set api_key");
        }

        mime:Entity tsPart = new;
        _ = tsPart.addHeader("Content-Disposition", "form-data; name=\"timestamp\"");
        mime:Error? tErr = tsPart.setText(tsStr);
        if tErr is mime:Error {
            return error("Failed to set timestamp");
        }

        mime:Entity sigPart = new;
        _ = sigPart.addHeader("Content-Disposition", "form-data; name=\"signature\"");
        mime:Error? sErr = sigPart.setText(signature);
        if sErr is mime:Error {
            return error("Failed to set signature");
        }

        req.setBodyParts([imagePart, folderPart, apiKeyPart, tsPart, sigPart]);
    } else if upload_preset is string {
        mime:Entity presetPart = new;
        _ = presetPart.addHeader("Content-Disposition", "form-data; name=\"upload_preset\"");
        string preset = <string>upload_preset;
        mime:Error? presetError = presetPart.setText(preset);
        if presetError is mime:Error {
            return error("Failed to set preset text");
        }
        req.setBodyParts([imagePart, presetPart, folderPart]);
    } else {
        return error("Cloudinary config missing: set api_key/api_secret for signed uploads or an upload_preset for unsigned uploads");
    }

    http:Response resp = check cloud->post("", req);

    if resp.statusCode < 200 || resp.statusCode >= 300 {
        json|error errBody = resp.getJsonPayload();
        if errBody is json {
            if errBody is map<json> {
                json e = errBody["error"];
                if e is map<json> {
                    json msg = e["message"];
                    if msg is string {
                        return error(string `Cloudinary error (${resp.statusCode}): ${msg}`);
                    }
                }
            }
        }
        return error(string `Cloudinary upload failed with status ${resp.statusCode}`);
    }

    json|error body = resp.getJsonPayload();
    return body;
}

isolated function getEpochSeconds() returns int {
    string nowStr = time:utcToString(time:utcNow());
    if nowStr.length() < 19 {
        return 0;
    }
    int|error y = int:fromString(nowStr.substring(0, 4));
    int|error m = int:fromString(nowStr.substring(5, 7));
    int|error d = int:fromString(nowStr.substring(8, 10));
    int|error hh = int:fromString(nowStr.substring(11, 13));
    int|error mm = int:fromString(nowStr.substring(14, 16));
    int|error ss = int:fromString(nowStr.substring(17, 19));
    if y is error || m is error || d is error || hh is error || mm is error || ss is error {
        return 0;
    }
    int days = daysSinceEpoch(<int>y, <int>m, <int>d);
    return days * 86400 + (<int>hh * 3600) + (<int>mm * 60) + <int>ss;
}

isolated function daysSinceEpoch(int year, int month, int day) returns int {
    int days = 0;
    int y = 1970;
    while y < year {
        days += isLeap(y) ? 366 : 365;
        y += 1;
    }
    int[] monthDaysNonLeap = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    int[] monthDaysLeap = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    int i = 1;
    while i < month {
        days += isLeap(year) ? monthDaysLeap[i - 1] : monthDaysNonLeap[i - 1];
        i += 1;
    }
    days += (day - 1);
    return days;
}

isolated function isLeap(int y) returns boolean {
    return (y % 4 == 0) && ((y % 100 != 0) || (y % 400 == 0));
}

isolated function toHex(byte[] bytes) returns string {
    string[] hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    string out = "";
    foreach byte b in bytes {
        int hi = (b & 0xF0) >> 4;
        int lo = b & 0x0F;
        out = out + hexDigits[hi] + hexDigits[lo];
    }
    return out;
}

