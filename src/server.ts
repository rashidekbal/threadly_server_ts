
// import {StartServiceFcm } from "./src/Fcm/FcmService.js";
import server from "./app.js";
import "dotenv/config"
import connection from "./db/connection.js";
import { QueryError } from "mysql2";
const port = process.env.PORT;
connection.connect((err:QueryError|null) => {
  if (err) {
    console.log(err);
  } else {
    server.listen(port, () => {
      console.log("connected to database ");
      console.log(`running on server port ${port} `);
    //   StartServiceFcm();
    });
  }
});


