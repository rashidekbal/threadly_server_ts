import fs from 'fs';

const filePath = 'd:/projects/threadly/Server_typescript_migration/server/src/controller/admin/post.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'import { getUserPost, getAllPosts, deletePost } from "../../repo/adminRepo.js";',
  'import { getUserPost, getAllPosts, deletePost, getSinglePost } from "../../repo/adminRepo.js";'
);

const newEndpoint = `
const getSinglePostController = async (req: express.Request, res: express.Response) => {
  try {
    const postid = req.params.postid;
    if (!postid)
      return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid postid")));
    const result = await getSinglePost(Number(postid));
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};
`;

content = content.replace(
  'export { getUserPostsController, getAllPostsController, deletePostController };',
  newEndpoint + '\nexport { getUserPostsController, getAllPostsController, deletePostController, getSinglePostController };'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully patched post.controller.ts for getSinglePost");
