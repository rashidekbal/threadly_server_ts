import fs from 'fs';

const filePath = 'd:/projects/threadly/Server_typescript_migration/server/src/controller/admin/post.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'const result = await getAllPosts();',
  'const sort = req.query.sort as string || "";\n    const result = await getAllPosts(sort);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched post.controller.ts for sort filter");
