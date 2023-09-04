class UserNotFoundException extends Error {
    constructor(message: string = "UserNotFoundException") {
        super(message);
        this.name = "UserNotFoundException";
    }
}

class DuplicateEmailException extends Error {
    constructor(message: string = "DuplicateEmailException") {
        super(message);
        this.name = "DuplicateEmailException";
    }
}

class DuplicateNameException extends Error {
    constructor(message: string = "DuplicateEmailException") {
        super(message);
        this.name = "DuplicateEmailException";
    }
}

class NotImplementedError extends Error {
    constructor(message: string = "NotImplementedError") {
        super(message);
        this.name = "NotImplementedError";
    }
}

class OwnUserNotSetException extends Error {
    constructor(message: string = "OwnUserNotSetException") {
        super(message);
        this.name = "OwnUserNotSetException";
    }
}

export {UserNotFoundException, DuplicateEmailException, DuplicateNameException, NotImplementedError, OwnUserNotSetException}