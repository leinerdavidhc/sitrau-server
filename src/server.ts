import {App} from "./config/index"
import config from "./config"

async function main(): Promise<void> {
    const app = new App(parseInt(config.port as string, 10));
    await app.start();
}
main();