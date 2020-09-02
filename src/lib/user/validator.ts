import { UserService } from "@lib/user/service"

interface ValidationResult {
    isValid: boolean,
    reason?: string
}

const userService = new UserService();

class UserValidator {
    public async validate(userId: string): Promise<ValidationResult> {
        let exists = (await userService.get(userId)) != undefined;

        return <ValidationResult>{
            isValid: exists,
            reason: exists ? "user id exists." : "user id not found."
        }
    }
}

export { ValidationResult, UserValidator }