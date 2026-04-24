import { getAdminEmail, getAdminPassword } from "./envValuesAccessInterface.js";
export default function validateAdminCreds(cred:{email:string,password:string}) {
  return (
    getAdminEmail() == cred.email &&
    getAdminPassword() == cred.password
  );
}
