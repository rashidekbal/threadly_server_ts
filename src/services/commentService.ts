import CommentRepo from "../repo/commentRepo.js";

export default class CommentService {
  commentRepo: CommentRepo;
  constructor(commentRepo: CommentRepo) {
    this.commentRepo = commentRepo;
  }

  addComment = (userid: string, postid: number, comment: string) => {
    return this.commentRepo.addComment(userid, postid, comment);
  };

  removeComment = (userid: string, postid: number, commentid: number) => {
    return this.commentRepo.removeComment(userid, postid, commentid);
  };

  getComments = (userid: string, postid: number) => {
    return this.commentRepo.getComments(userid, postid);
  };

  addReply = (userid: string, postId: number, reply: string, replyToCommentId: string) => {
    return this.commentRepo.addReply(userid, postId, reply, replyToCommentId);
  };

  getCommentReplies = (userid: string, commentId: number) => {
    return this.commentRepo.getCommentReplies(userid, commentId);
  };
}
