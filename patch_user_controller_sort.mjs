import fs from 'fs';

const filePath = 'd:/projects/threadly/Server_typescript_migration/server/src/controller/admin/user.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'const result = await getUsers(page, false, search);',
  'const sort = req.query.sort as string || "";\n    const result = await getUsers(page, false, search, sort);'
);

content = content.replace(
  'const result = await getUsers(page, true, search);',
  'const sort = req.query.sort as string || "";\n    const result = await getUsers(page, true, search, sort);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched user.controller.ts for sort filter");
