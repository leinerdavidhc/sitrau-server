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
    }

}