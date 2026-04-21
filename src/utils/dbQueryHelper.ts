import connection from "../db/connection.js";

async function fetchDb(query:string, value:any[]|null) {
  return new Promise((resovle, reject) => {
    if (value) {
      connection.query(query, value, (err, response) => {
        if (!err) resovle(response);
        else reject(err);
      });
    } else {
      connection.query(query, (err, response) => {
        if (!err) resovle(response);
        else reject(err);
      });
    }
  });
}
export default fetchDb;
