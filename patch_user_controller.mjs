import fs from 'fs';

const filePath = 'd:/projects/threadly/Server_typescript_migration/server/src/controller/admin/user.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'const result = await getUsers(1, false);',
  'const page = parseInt(req.query.page as string) || 1;\n    const result = await getUsers(page, false);'
);

content = content.replace(
  'const result = await getUsers(1, true);',
  'const page = parseInt(req.query.page as string) || 1;\n    const result = await getUsers(page, true);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched user.controller.ts");
