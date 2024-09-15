import SuperUserRouter from "./superUser.routes";
import UserRouter from "./user.routes";

export default class IndexRoutes {
  public RouterSuperUser = new SuperUserRouter();
  public RouterUser = new UserRouter();
}
