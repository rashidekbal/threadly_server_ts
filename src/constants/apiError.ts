import apiErrorType from "./apiErrorTypesEnum.js";

export default class ApiError {
    /** HTTP status code of the error */
    status;
    
    /** Error message describing what went wrong */
    errorBody;
    errorType;

    
    constructor(status:number,errorType:apiErrorType ,dataObject:unknown) {
        this.status = status;
        this.errorBody = dataObject;
        this.errorType=errorType;
    }
}