import SearchRepo from "../repo/searchRepo.js";

export default class SearchService {
  searchRepo: SearchRepo;
  constructor(searchRepo: SearchRepo) {
    this.searchRepo = searchRepo;
  }

  search = async (target: string, userid: string) => {
    const accountResult = await this.searchRepo.searchAccounts(target);
    const reelsResult = await this.searchRepo.searchReels(target, userid);
    return { Account: accountResult, Reels: reelsResult };
  };
}
