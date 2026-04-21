import {describe,it} from "node:test";
import bcryptUtil from "../src/utils/bcryptUtil.ts"
import  assert  from "assert";
describe("bcryptUtil wrappers test",()=>{
    it("bcrytp hash string working for right password",async()=>{
        const expected=true;
        const hashedpassword="$2b$12$.Jg3iwf2l8PYF3bAQcH1c.pljoOTzac5M66b50hmTSZml40DztwYC";
        const testString="bcrypttest";
        const actual=await bcryptUtil.verifyPassword(hashedpassword,testString);
        assert.strictEqual(actual,expected);

       

    })
     it("bcrytp hash string working for wrong password",async()=>{
        const expected=false;
        const hashedpassword="$2b$12$.Jg3iwf2l8PYF3bAQcH1c.pljoOTzac5M66b50hmTSZml40DztwYC";
        const testString="bcrypttesw";
        const actual=await bcryptUtil.verifyPassword(hashedpassword,testString);
        assert.strictEqual(actual,expected);

       

    })
})

