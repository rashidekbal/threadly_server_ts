import mysql from "mysql2";
import { getDbUrl } from "../utils/envValuesAccessInterface.js";
const db_url:string=getDbUrl();

let connection = mysql.createConnection(db_url);


export default connection;
