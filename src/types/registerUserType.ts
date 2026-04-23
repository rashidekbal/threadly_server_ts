import user from "./user.js";

  type registerUserType=Omit<user,"userid"|"sessionId"|"uuid">
 export default registerUserType;