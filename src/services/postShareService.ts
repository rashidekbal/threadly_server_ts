import PostShareRepo from "../repo/postShareRepo.js";

export default class PostShareService {
  postShareRepo: PostShareRepo;
  constructor(postShareRepo: PostShareRepo) {
    this.postShareRepo = postShareRepo;
  }

  sharePost = (senderId: string, receiverId: string, postid: string) => {
    return this.postShareRepo.addShareRecord(senderId, receiverId, postid);
  };
}
