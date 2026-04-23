import ErrorDetails from "./errorDetails.js";
import ErrorEnum from "./errorsEnum.js";

export default class ServiceError extends ErrorDetails{
    type:ErrorEnum;
    constructor(errorType:ErrorEnum,errorDetails:string){
        super(errorDetails)
        this.type=errorType;
    }
    
}