interface ValidationResult {
    isValid: boolean,
    reason?: string
}

class RatingValidator {
    public validate(value: number): ValidationResult {
        return { isValid: (value >= 0 && value <= 5) };
    }
}

export { ValidationResult, RatingValidator }