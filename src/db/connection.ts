import "dotenv/config";
import mysql from "mysql2";
const db_url:string|undefined=process.env.DB_URL

let connection = mysql.createConnection(db_url as string);


export default connection;
