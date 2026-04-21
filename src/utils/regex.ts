const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isvalidEmail=(email:string)=>{
    return emailRegex.test(email);

}
export { isvalidEmail};
