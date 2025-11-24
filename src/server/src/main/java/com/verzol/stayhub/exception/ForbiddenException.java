package com.verzol.stayhub.exception;

/**
 * Exception thrown when a user attempts to access a resource without proper authorization.
 * Returns HTTP 403 Forbidden status.
 */
public class ForbiddenException extends RuntimeException {
    
    public ForbiddenException(String message) {
        super(message);
    }
    
    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}
