import fs from 'fs';

const filePath = 'd:/projects/threadly/Server_typescript_migration/server/src/controller/admin/user.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'const page = parseInt(req.query.page as string) || 1;\n    const result = await getUsers(page, false);',
  'const page = parseInt(req.query.page as string) || 1;\n    const search = req.query.search as string || "";\n    const result = await getUsers(page, false, search);'
);

content = content.replace(
  'const page = parseInt(req.query.page as string) || 1;\n    const result = await getUsers(page, true);',
  'const page = parseInt(req.query.page as string) || 1;\n    const search = req.query.search as string || "";\n    const result = await getUsers(page, true, search);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched user.controller.ts for search");
