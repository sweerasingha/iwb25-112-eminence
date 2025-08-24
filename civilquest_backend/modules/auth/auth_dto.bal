import ballerina/constraint;

type LoginUserDto record {
    @constraint:String {
        minLength: {
            value: 5,
            message: "Email should have at least 5 characters"
        },
        maxLength: {
            value: 254,
            message: "Email can have at most 254 characters"
        },
        pattern: {
            value: re `^[^\s@]+@[^\s@]+\.[^\s@]+$`,
            message: "Email should be in a valid format"
        }
    }
    string email;

    @constraint:String {
        minLength: {
            value: 8,
            message: "Password should have at least 8 characters"
        },
        maxLength: {
            value: 20,
            message: "Password can have at most 20 characters"
        }
    }
    string password;
};

type RegisterUserDto record {
    @constraint:String {
        minLength: {
            value: 5,
            message: "Email should have at least 5 characters"
        },
        maxLength: {
            value: 254,
            message: "Email can have at most 254 characters"
        },
        pattern: {
            value: re `^[^\s@]+@[^\s@]+\.[^\s@]+$`,
            message: "Email should be in a valid format"
        }
    }
    string email;

    @constraint:String {
        minLength: {
            value: 8,
            message: "Password should have at least 8 characters"
        },
        maxLength: {
            value: 20,
            message: "Password can have at most 20 characters"
        },
        pattern: {
            value: re `^[A-Za-z\d@$!%*#?&]{8,20}$`,
            message: "Password should include letters, numbers, and special characters"
        }
    }
    string password;

    @constraint:String {
        minLength: {
            value: 3,
            message: "Name should have at least 3 characters"
        },
        maxLength: {
            value: 20,
            message: "Name can have at most 20 characters"
        },
        pattern: {
            value: re `^[A-Za-z\s]+$`,
            message: "Name should contain only letters"
        }
    }
    string name;
};

type OtpRequestDto record {
    string email;
};

type OtpVerifyDto record {
    string email;
    string otp;
};

type PasswordResetRequestDto record {|
    string email;
|};

type PasswordResetDto record {
    string email;
    string otp;

    @constraint:String {
        minLength: {
            value: 8,
            message: "Password should have at least 8 characters"
        },
        maxLength: {
            value: 20,
            message: "Password can have at most 20 characters"
        },
        pattern: {
            value: re `^[A-Za-z\d@$!%*#?&]{8,20}$`,
            message: "Password should include letters, numbers, and special characters"
        }
    }
    string newPassword;
};

