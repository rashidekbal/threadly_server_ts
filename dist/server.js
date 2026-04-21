import "dotenv/config";
import app from "./app.js";
const port = process.env.PORT;
app.listen(port, (err) => {
    if (err) {
        console.log("error starting server : " + err);
        return;
    }
    console.log(`server running at port ${port}`);
});
