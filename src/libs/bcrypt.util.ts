import bcrypt from 'bcrypt';

// Función para comparar contraseñas
export const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    // Compara la contraseña ingresada con la encriptada
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (error) {
    console.error("Error comparando contraseñas:", error);
    throw new Error("Error al comparar contraseñas");
  }
};

// Función para encriptar una contraseña
export const encryptPassword = async (plainPassword: string): Promise<string> => {
  try {
    const saltRounds = 10; // Cuántas veces se genera el hash
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error encriptando contraseña:", error);
    throw new Error("Error al encriptar la contraseña");
  }
};
