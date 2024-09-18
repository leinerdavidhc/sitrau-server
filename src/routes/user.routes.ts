import UserController from "../controllers/user.controller"
import UserMiddleware  from "../middlewares/user.middleware";
import { Router } from "express";
export default class UserRouter {
    public router: Router = Router();
    constructor() {
        this.initializer();
    }

    private initializer() {
        this.router.post("/user/register", UserMiddleware.validateRegister, UserController.createUser);
        this.router.post("/user/login", UserMiddleware.validateLogin, UserController.login);
        this.router.get("/user/protected", UserMiddleware.authenticateToken, UserController.getProtectedData);
        this.router.post("/user/preRegister", UserMiddleware.validateRegister,UserController.PreCreateUser);
        this.router.get("/user/getOneUser/:id",UserController.getOneUser)
        this.router.post("/user/generateCode",UserController.generateCode)
        this.router.post("/user/changePassword",UserMiddleware.changePassword,UserController.changePassword)
    }

}