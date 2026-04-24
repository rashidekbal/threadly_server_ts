import PostRepo from "../repo/postRepo.js";
import logger, { formErrorBody } from "../utils/pino.js";
import {
  uploadOnColudinaryFromRam,
  uploadOnColudinaryviaLocalPath,
} from "../services/cloudinary.js";

export default class PostService {
  postRepo: PostRepo;
  constructor(postRepo: PostRepo) {
    this.postRepo = postRepo;
  }

  backgroundUpload = async (path: any, userid: string, caption: string | null, type: string) => {
    try {
      let url = await uploadOnColudinaryviaLocalPath(path);
      await this.postRepo.addPost(userid, url, caption, type);
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  };

  backgroundUploadFromRam = async (buffer: any, userid: string, caption: string | null, type: string) => {
    try {
      let url = await uploadOnColudinaryFromRam(buffer);
      await this.postRepo.addPost(userid, url, caption, type);
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  };

  removePost = (userid: string, postid: number) => {
    return this.postRepo.removePost(userid, postid);
  };

  getPostInfo = (userid: string, postid: string) => {
    return this.postRepo.getPostInfo(userid, postid);
  };

  getImageFeed = (userid: string) => {
    return this.postRepo.getImageFeed(userid);
  };

  getVideoFeed = (userid: string, limit: number = 15) => {
    return this.postRepo.getVideoFeed(userid, limit);
  };

  getUserPosts = (reqMakerUserId: string, userid: string, limit: number, offset: number) => {
    return this.postRepo.getUserPosts(reqMakerUserId, userid, limit, offset);
  };

  recordPostView = (userid: string, uuid: string, postid: string) => {
    return this.postRepo.recordPostView(userid, uuid, postid);
  };
}
