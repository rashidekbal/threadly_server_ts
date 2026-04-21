class ErrorDetails{
    errorDetails;
    constructor(error:any|null){
        this.errorDetails=error?error:"somethin went wrong....";
    }
}
export default ErrorDetails