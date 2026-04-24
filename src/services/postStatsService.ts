import PostStatsRepo from "../repo/postStatsRepo.js";

export default class PostStatsService {
  postStatsRepo: PostStatsRepo;
  constructor(postStatsRepo: PostStatsRepo) {
    this.postStatsRepo = postStatsRepo;
  }

  getLikedByUsers = (postid: string, page: string | undefined) => {
    const offset = page && Number(page) == 1 ? 0 : Number(page) > 1 ? Number(page) - 1 : 0;
    return this.postStatsRepo.getLikedByUsers(postid, offset * 100);
  };

  getStoryViewedByUsers = (userid: string, storyid: string, page: string | undefined) => {
    const offset = page && Number(page) == 1 ? 0 : Number(page) > 1 ? Number(page) - 1 : 0;
    return this.postStatsRepo.getStoryViewedByUsers(userid, storyid, offset * 100);
  };

  getSharedByUsers = (postid: string, page: string | undefined) => {
    const offset = page && Number(page) == 1 ? 0 : Number(page) > 1 ? Number(page) - 1 : 0;
    return this.postStatsRepo.getSharedByUsers(postid, offset * 100);
  };
}
