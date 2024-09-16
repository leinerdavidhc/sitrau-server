import { z, ZodError } from 'zod';

export class UserValidator {
    // Esquema de validación para el registro de User
    private static RegisterSchema = z.object({
        dni: z.string().min(1, "El DNI es requerido").trim(),
        name: z.string().min(1, "El nombre es requerido").toLowerCase().trim(),
        lastName: z.string().min(1, "El apellido es requerido").toLowerCase().trim(),
        email: z.string().email("El correo electrónico no es válido").min(1, "El correo electrónico es requerido").toLowerCase().trim(),
        phone: z.string().trim(),
        password: z.string()
            .min(8, "La contraseña debe tener al menos 8 caracteres")
            .regex(/[0-9]/, "La contraseña debe contener al menos un número")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe contener al menos un carácter especial")
            .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
            .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula").trim(),
        confirmPassword: z.string()
            .min(8, "La contraseña debe tener al menos 8 caracteres")
            .regex(/[0-9]/, "La contraseña debe contener al menos un número")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe contener al menos un carácter especial")
            .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
            .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula").trim(),
    });

    // Esquema de validación para el inicio de sesión de User
    private static LoginSchema = z.object({
        email: z.string().email("El correo electrónico no es válido").min(1, "El correo electrónico es requerido").toLowerCase().trim(),
        password: z.string().min(1, "La contraseña es requerida").trim(),
    });

    //esquema para cambiar contraseña de password
    private static ChangePasswordSchema = z.object({
        email: z.string().email("El correo electrónico no es válido").min(1, "El correo electrónico es requerido").toLowerCase().trim(),
        password: z.string()
            .min(8, "La contraseña debe tener al menos 8 caracteres")
            .regex(/[0-9]/, "La contraseña debe contener al menos un número")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe contener al menos un carácter especial")
            .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
            .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula").trim(),
        confirmPassword: z.string()
            .min(8, "La contraseña debe tener al menos 8 caracteres")
            .regex(/[0-9]/, "La contraseña debe contener al menos un número")
            .regex(/[!@#$%^&*(),.?":{}|<>]/, "La contraseña debe contener al menos un carácter especial")
            .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
            .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula").trim(),
    });


    // Método de validación para el registro de User
    static validateRegister(input: any) {
        try {
            this.RegisterSchema.parse(input);
            return { valid: true, errors: [] };
        } catch (error) {
            if (error instanceof ZodError) {
                return { valid: false, errors: error.errors };
            } else {
                console.error("An unexpected error occurred:", error);
                return { valid: false, errors: ["An unexpected error occurred"] };
            }
        }
    }

    // Método de validación para el inicio de sesión de User
    static validateLogin(input: any) {
        try {
            this.LoginSchema.parse(input);
            return { valid: true, errors: [] };
        } catch (error) {
            if (error instanceof ZodError) {
                return { valid: false, errors: error.errors };
            } else {
                console.error("An unexpected error occurred:", error);
                return { valid: false, errors: ["An unexpected error occurred"] };
            }
        }
    }

    //metodo para cambiar password
    static validateChangePassword(input: any) {
        try {
            this.ChangePasswordSchema.parse(input);
            return { valid: true, errors: [] };
        } catch (error) {
            if (error instanceof ZodError) {
                return { valid: false, errors: error.errors };
            } else {
                console.error("An unexpected error occurred:", error);
                return { valid: false, errors: ["An unexpected error occurred"] };
            }
        }
    }
}