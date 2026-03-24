package com.ehrassist.exception;

public class FhirValidationException extends RuntimeException {
    public FhirValidationException(String message) {
        super(message);
    }
}
