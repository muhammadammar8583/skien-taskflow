const ApiMessages = {
    success: {
        userCreated: "User created successfully",
        userLoggedIn: "User logged in succesfully",
        userLoggedOut: "User logged out successfully",
    },
    error: {
        userCreationFailed: "User creation failed",
        userNotFound: "User not found",
        internalError: "Internal server error"
    },
    validation: {
        emailRequired: "Email is required",
        passwordRequired: "Password is required",
        confirmPasswordRequired: "Confirm password is required",
        missingFields: (fields: string[]) =>
            `Missing required field(s): ${fields.join(", ")}`,
        invalidEmail: "Invalid email!",
        passwordMismatch: "Password and confirm password do not match",
        userAlreadyExists: "User already exists",
        invalidCredentials: "invalid Credentials!",
        invalidInput: "Invald Input!",
        emailEmpty: "Email cannot be empty",
        passwordEmpty: "Password cannot be empty",
        invalidData: "Invalid data provided",
    }
}

export default ApiMessages;