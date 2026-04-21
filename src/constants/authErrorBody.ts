export default class AuthError_body{
    invalid_parameter;
    message;
    constructor(invalid_parameter:string,message:string){
        this.invalid_parameter=invalid_parameter;
        this.message=message;

    }
}