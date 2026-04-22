import Response from "../../constants/Response.js";
import { adminService } from "../../services/index.service.js";
import express from "express"

 async function statsController(req:express.Request, res:express.Response) {
  const likeStats = await adminService.getLikesStats();
  const commentStats = await adminService.getCommentsStats();
  const usersStats = await adminService.getUsersStats();
  const postViewStats = await adminService.getPostViewStats();
  return res.json(
    new Response(200, { likeStats, commentStats, usersStats, postViewStats }),
  );
}
export{statsController}

