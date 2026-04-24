import server from "./app.js";
import connection from "./db/connection.js";
import { QueryError } from "mysql2";
import { fcmService } from "./services/index.service.js";
import { getPort } from "./utils/envValuesAccessInterface.js";
const port = getPort();
connection.connect((err:QueryError|null) => {
  if (err) {
    console.log(err);
  } else {
    server.listen(port, () => {
      console.log("connected to database ");
      console.log(`running on server port ${port} `);
    fcmService.StartServiceFcm();
    });
  }
});


