// import {StartServiceFcm } from "./src/Fcm/FcmService.js";
import server from "./app.js";
import "dotenv/config";
import connection from "./db/connection.js";
import { fcmService } from "./services/index.service.js";
const port = process.env.PORT;
connection.connect((err) => {
    if (err) {
        console.log(err);
    }
    else {
        server.listen(port, () => {
            console.log("connected to database ");
            console.log(`running on server port ${port} `);
            fcmService.StartServiceFcm();
        });
    }
});
