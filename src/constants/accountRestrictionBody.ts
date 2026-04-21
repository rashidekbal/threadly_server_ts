import BanType  from "./banTypeEnum.js";

export default class AccountRestriction_body{
    type;
    reason;
    banTime;
    constructor(type:BanType,reason:string,banTime:string){
        this.type=type;
        this.reason=reason;
        this.banTime=banTime;

    }

}