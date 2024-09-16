import express,{Application} from 'express';
import cors from "cors"
import morgan from 'morgan'
import cookieParser from 'cookie-parser';
import IndexRoutes from '../routes/index.routes';

export class App{
    public app: Application;
    private Routes = new IndexRoutes();
    constructor(private port: number | 3000){
        this.app = express();
        this.setting();
        this.middlewares();
        this.routes();
    }

    private setting():void{
        this.app.set("port", this.port);
    }

    private middlewares():void{
        this.app.use(morgan('dev'))
        this.app.use(express.json())
        this.app.use(express.urlencoded({extended:false}))
        this.app.use(cors({
            origin: ['http://localhost:3000', 'exp://192.168.1.14:8081'],
            credentials: true
        }));
        
        this.app.use(cookieParser());
    }

    private routes():void{
        this.app.use("/admin", this.Routes.RouterSuperUser.router);
        this.app.use("/auth", this.Routes.RouterUser.router);
    }

   async start(): Promise<void> {
       await this.app.listen(this.app.get("port"));
       console.log("Server on port", this.app.get("port"));
   }
}