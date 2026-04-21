import bcryptUtil from "../src/utils/bcryptUtil.ts";
console.log(await bcryptUtil.hashPassword("bcrypttest"))