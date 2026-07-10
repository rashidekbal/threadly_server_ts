import fs from 'fs';

const filePath = 'd:/projects/threadly/Server_typescript_migration/server/src/controller/admin/post.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'const getAllPostsController = async (req: express.Request, res: express.Response) => {\n  try {\n    const sort = req.query.sort as string || "";\n    const result = await getAllPosts(sort);',
  'const getAllPostsController = async (req: express.Request, res: express.Response) => {\n  try {\n    const sort = req.query.sort as string || "";\n    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;\n    const result = await getAllPosts(sort, page);'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched post.controller.ts for getAllPosts");
