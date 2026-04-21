import {describe,it} from "node:test";
import assert from "assert";
import { isvalidEmail } from "../src/utils/regex.ts";
describe("regex unit test",()=>{
    it("test if emailCheck regex working for good email",()=>{
        const goodEmailExample="rtech123@gmail.com"
        const expected=true;
        const actual=isvalidEmail(goodEmailExample);
        assert.strictEqual(actual,expected);
    })
    it("test if emailCheck regex working for bad email",()=>{
        const goodEmailExample="rtech123gmail.com"
        const expected=false;
        const actual=isvalidEmail(goodEmailExample);
        assert.strictEqual(actual,expected);
    })
})