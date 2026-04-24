import LikeRepo from "../repo/likeRepo.js";
import logger, { formErrorBody } from "../utils/pino.js";

export default class LikeService {
  likeRepo: LikeRepo;
  constructor(likeRepo: LikeRepo) {
    this.likeRepo = likeRepo;
  }

  likePost = async (userid: string, postid: number) => {
    const response: any = await this.likeRepo.likePost(userid, postid);
    this.notifyPostLike(String(postid), userid, response.insertId);
    return response;
  };

  unlikePost = async (userid: string, postid: number) => {
    const response = await this.likeRepo.unlikePost(userid, postid);
    this.notifyPostUnlike(String(postid), userid);
    return response;
  };

  likeComment = async (userid: string, commentid: string) => {
    await this.likeRepo.likeComment(userid, commentid);
    this.notifyCommentLike(commentid, userid);
  };

  unlikeComment = async (userid: string, commentid: string) => {
    await this.likeRepo.unlikeComment(userid, commentid);
    this.notifyCommentUnLike(commentid, userid);
  };

  likeStory = (userid: string, storyid: string) => {
    return this.likeRepo.likeStory(userid, storyid);
  };

  unlikeStory = (userid: string, storyid: string) => {
    return this.likeRepo.unlikeStory(userid, storyid);
  };

  // --- notification helpers (fire-and-forget) ---

  private notifyPostLike = async (postId: string, userid: string, insertId: number) => {
    try {
      const userDetails: any = await this.likeRepo.getUserBasicDetails(userid);
      const postDetails: any = await this.likeRepo.getPostOwnerDetailsWithLink(postId);
      if (postDetails.length > 0 && userDetails.length > 0) {
        const token = postDetails[0].fcmToken;
        const username = userDetails[0].username;
        const ReceiverUserId = postDetails[0].userid;
        const postLink = postDetails[0].imageurl;
        if (username != null && token != null && postLink != null && ReceiverUserId !== userid) {
          // FCM notification - to be enabled later
        }
      }
    } catch (e) {
      logger.error(formErrorBody(e as string, null, null));
    }
  };

  private notifyPostUnlike = async (postId: string, userId: string) => {
    try {
      const postDetails: any = await this.likeRepo.getPostOwnerDetails(postId);
      if (postDetails.length > 0) {
        const token = postDetails[0].fcmToken;
        if (token != null && userId != postDetails[0].userid) {
          // FCM notification - to be enabled later
        }
      }
    } catch (e) {
      logger.error(formErrorBody(e as string, null, null));
    }
  };

  private notifyCommentLike = async (commentId: string, userid: string) => {
    try {
      const userDetails: any = await this.likeRepo.getUserBasicDetails(userid);
      const commentDetails: any = await this.likeRepo.getCommentOwnerDetails(commentId);
      if (commentDetails.length > 0 && userDetails.length > 0) {
        const token = commentDetails[0].fcmToken;
        if (token != null && commentDetails[0].userid != userid) {
          // FCM notification - to be enabled later
        }
      }
    } catch (e) {
      logger.error(formErrorBody(e as string, null, null));
    }
  };

  private notifyCommentUnLike = async (commentId: string, userid: string) => {
    try {
      const commentDetails: any = await this.likeRepo.getCommentOwnerBasicDetails(commentId);
      if (commentDetails.length > 0) {
        const token = commentDetails[0].fcmToken;
        if (token != null && commentDetails[0].userid != userid) {
          // FCM notification - to be enabled later
        }
      }
    } catch (e) {
      logger.error(formErrorBody(e as string, null, null));
    }
  };
}
