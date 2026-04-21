import "dotenv/config";
export default function validateAdminCreds(cred:{email:string,password:string}) {
  return (
    process.env.ADMIN_EMAIL == cred.email &&
    process.env.ADMIN_PASSWORD == cred.password
  );
}
