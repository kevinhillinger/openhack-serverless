import { ProductService } from "./service"

interface ValidationResult {
    isValid: boolean,
    reason?: string
}

const productService = new ProductService();

class ProductValidator {
    public async validate(productId: string): Promise<ValidationResult> {
        let exists = (await productService.get(productId)) != undefined;

        return <ValidationResult>{
            isValid: exists,
            reason: exists ? "product exists." : "product not found. invalid product id."
        }
    }
}

export { ValidationResult, ProductValidator }