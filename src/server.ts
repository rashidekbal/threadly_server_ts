import server from "./app.js";
import connection from "./db/connection.js";
import { QueryError } from "mysql2";
import { fcmService } from "./services/index.service.js";
import { getPort } from "./utils/envValuesAccessInterface.js";
import logger,{formErrorBody} from "./utils/pino.js"
const port = getPort();
connection.connect((err:QueryError|null) => {
  if (err) {
    logger.error(formErrorBody(err.message,500,null))
  } else {
    server.listen(port, () => {
      console.log("connected to database ");
      console.log(`running on server port ${port} `);
    fcmService.StartServiceFcm();
    });
  }
});


