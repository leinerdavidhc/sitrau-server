import { Sequelize } from "sequelize";
import "dotenv/config"
import config from "../config";

export const sequelize = new Sequelize(
    config.dbName,
    config.dbUser,
    config.dbPass,
    {
        host: "localhost",
        dialect: "mysql",
        port: 3306,
    }
);

async function generateDb():Promise<void>{
    await sequelize.sync({ force: true });
    console.log("Base de datos y tablas creadas");
}

generateDb();