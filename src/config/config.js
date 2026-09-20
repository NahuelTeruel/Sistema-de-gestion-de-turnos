import dotenv from "dotenv";

dotenv.config();

const config = {
    port: process.env.PORT || 8080
}
//console.log(config.port)
export default config