import { Request, Response } from "express";
import { encryptPassword,comparePasswords } from "../libs/bcrypt.util";
import { SuperUser, SuperUserAddI, SuperUserGetI } from "../models/superUser.model";
import jwt from 'jsonwebtoken';
import config from "../config";
export default class SuperUserController {
    public static async createSuperUser(req: Request, res: Response) {
        const { name, lastName, password, email } = req.body;
        
        try {
            // Verificar si ya existe un superusuario activo
            const existingSuperUser: SuperUserGetI[] | null = await SuperUser.findAll({ where: { active: true } });

            if (existingSuperUser.length > 0) {
                return res.status(400).json({ success: false, message: "Ya existe un superusuario activo." });
            }

            // Encriptar la contraseña
            const passwordEncrypt = await encryptPassword(password);


            // Crear nuevo superusuario
            const superUser: SuperUserAddI = { name, lastName, password: passwordEncrypt, email };
            const createdSuperUser = await SuperUser.create(superUser);

            res.status(201).json({ success: true, message: "Superusuario creado exitosamente.", user: { name: createdSuperUser.name, lastName: createdSuperUser.lastName } });
        } catch (error) {
            console.error("Error al crear el superusuario:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor al crear el superusuario.", error });
        }
    }
    static async Login(req: Request, res: Response) {
        const { email, password } = req.body;
        try {
            const superUserExists: SuperUserGetI | null = await SuperUser.findOne({ where: { email, active: true } })

            if (!superUserExists) return res.status(400).json({ message: 'Email is not registered' });

            const isMatch = await comparePasswords(password, superUserExists!.password)

            if (!isMatch) return res.status(400).json({ message: "Incorrect password" })

            const token = jwt.sign({ email: superUserExists.email, name: superUserExists.name,lastName: superUserExists.lastName }, config.jwtSecret as string, { expiresIn: "1h" })
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV == 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60
            })

            res.status(200).json({ message: "Login successful" })

        } catch (error) {
            res.status(500).json({ message:"Login failed", error: error })
        }
    }

    public static async getSuperUser(req: Request, res: Response) {
        try {
            const superUsers: SuperUserGetI[] | null = await SuperUser.findAll({ where: { active: true }, attributes: { exclude: ['password'] } });
            res.status(200).json({ success: true, superUsers });
        } catch (error) {
            console.error("Error al obtener los superusuarios:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor al obtener los superusuarios.", error });
        }
    }

    public static async getOneSuperUser(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const superUser: SuperUserGetI | null = await SuperUser.findOne({ where: { id, active: true }, attributes: { exclude: ['password'] } });

            if (!superUser) {
                return res.status(404).json({ success: false, message: "Superusuario no encontrado." });
            }

            res.status(200).json({ success: true, superUser });
        } catch (error) {
            console.error("Error al obtener el superusuario:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor al obtener el superusuario.", error });
        }
    }

    public static async deleteSuperUser(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const [updated] = await SuperUser.update({ active: false }, { where: { id } });

            if (updated === 0) {
                return res.status(404).json({ success: false, message: "Superusuario no encontrado." });
            }

            res.status(200).json({ success: true, message: "Superusuario eliminado exitosamente." });
        } catch (error) {
            console.error("Error al eliminar el superusuario:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor al eliminar el superusuario.", error });
        }
    }

    public static async updateSuperUser(req: Request, res: Response) {
        const { id } = req.params;
        const { name, lastName, password, email } = req.body;
        try {
            // Encriptar la nueva contraseña si se proporciona
            const updateData: Partial<SuperUserAddI> = { name, lastName, email };
            if (password) {
                updateData.password = await encryptPassword(password);
            }

            const [updated] = await SuperUser.update(updateData, { where: { id } });

            if (updated === 0) {
                return res.status(404).json({ success: false, message: "Superusuario no encontrado." });
            }

            res.status(200).json({ success: true, message: "Superusuario actualizado exitosamente." });
        } catch (error) {
            console.error("Error al actualizar el superusuario:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor al actualizar el superusuario.", error });
        }
    }

    public static async deleteActiveSuperUser(req: Request, res: Response) {
        try {
            const deletedCount = await SuperUser.update({ active: false }, { where: { active: true } });

            if (deletedCount[0] === 0) {
                return res.status(404).json({ success: false, message: "No se encontraron superusuarios activos para eliminar." });
            }

            res.status(200).json({ success: true, message: "Superusuarios activos eliminados exitosamente." });
        } catch (error) {
            console.error("Error al eliminar superusuarios activos:", error);
            res.status(500).json({ success: false, message: "Error interno del servidor al eliminar superusuarios activos.", error });
        }
    }

    static async Logout(req: Request, res: Response) {
        res.clearCookie("access_token")
        res.status(200).json({ message: "session terminated" })
    }

    static async Protected(req: Request, res: Response) {
        try {
            res.json({ user: req.user,authorized:true });
        } catch (error) {
            res.status(401).json({ message: 'not authorized' });
        }
    }
}
