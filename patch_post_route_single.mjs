import fs from 'fs';

const filePath = 'd:/projects/threadly/Server_typescript_migration/server/src/routes/admin/post.route.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'import { getUserPostsController, getAllPostsController, deletePostController } from "../../controller/admin/post.controller.js";',
  'import { getUserPostsController, getAllPostsController, deletePostController, getSinglePostController } from "../../controller/admin/post.controller.js";'
);

content = content.replace(
  'export default router;',
  'router.route("/single/:postid").get(adminAuthorizationVerification, checkAdminAccess, getSinglePostController);\nexport default router;'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched post.route.ts for single post");
