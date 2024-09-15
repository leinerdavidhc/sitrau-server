import {Router} from "express"
import SuperUserController from "../controllers/superUser.controller"
import SuperUserMiddleware  from "../middlewares/superUser.middleware";

export default class SuperUserRouter{
    public router:Router = Router();
    constructor(){
        this.initializer();
    }

    private initializer(){
        this.router.post("/superuser/dashboard/login",SuperUserMiddleware.validateLogin,SuperUserController.Login)
        this.router.post("/superuser/dashboard/register",SuperUserMiddleware.validateRegister,SuperUserController.createSuperUser)
        this.router.get("/superuser/dashboard/logout",SuperUserController.Logout)
        this.router.get("/superuser/dashboard/protected",SuperUserMiddleware.verifyToken,SuperUserController.Protected)
    }
}