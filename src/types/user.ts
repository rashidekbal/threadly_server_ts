export default interface user{
    uuid:string,
    userid:string,
    username:string,
    email?:string,
    phone?:number,
    password:string,
    bio:string|"",
    dob:string,
    sessionId:string,


}