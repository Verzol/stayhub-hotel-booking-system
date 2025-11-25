package com.verzol.stayhub.exception;

/**
 * Exception thrown when a user attempts to access a resource without proper authentication.
 * Returns HTTP 401 Unauthorized status.
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
