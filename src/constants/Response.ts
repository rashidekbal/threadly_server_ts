export default class Response{
    status:number;
    data:unknown;
    constructor(statusCode:number,dataBody:unknown){
        this.status=statusCode;
        this.data=dataBody;
    }

}