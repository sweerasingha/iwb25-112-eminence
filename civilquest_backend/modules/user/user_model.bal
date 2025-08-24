public type User record {|
    string? _id?;
    string id?;
    string createdAt?;
    string updatedAt?;
    string name;
    string phoneNumber?;
    string password;
    boolean verified = false;
    string role = "USER"; // USER, PREMIUM_USER, PREMIUM_PENDING, ADMIN_OPERATOR, ADMIN, SUPER_ADMIN
    string email?;
    string username?;
    string address?;
    string hometown?;
    string livingCity?;
    string gender?;
    boolean otpVerified = false;
    string nationalid?;
    string profile_url?;
    string id_photo_url?;
    int points = 0;
    string[] eventId = [];
    string[] organizeEventId = [];

    string? province?;
    string? city?;
    string? managedBy?;
|};

public type Authorize record {|
    string _id;
    string id;
    string createdAt;
    string updatedAt;
    string name;
    string role;
    string email;
    string password;
    string phoneNumber;
    string username;
    string[] organizeEventId = [];

    string? province?;
    string? city?;
    string? managedBy?;
|};

