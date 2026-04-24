import StoryRepo from "../repo/storyRepo.js";
import logger, { formErrorBody } from "../utils/pino.js";
import {
  uploadOnColudinaryFromRam,
  uploadOnColudinaryviaLocalPath,
} from "./cloudinary.js";

export default class StoryService {
  storyRepo: StoryRepo;
  constructor(storyRepo: StoryRepo) {
    this.storyRepo = storyRepo;
  }

  addStoryFromRam = async (buffer: any, userid: string, type: string) => {
    const url = await uploadOnColudinaryFromRam(buffer);
    if (!url) return null;
    await this.storyRepo.addStory(userid, url, type);
    return url;
  };

  addStoryFromDisk = async (path: string, userid: string, type: string) => {
    const url = await uploadOnColudinaryviaLocalPath(path);
    if (!url) return null;
    await this.storyRepo.addStory(userid, url, type);
    return url;
  };

  removeStory = (userid: string, storyid: number) => {
    return this.storyRepo.removeStory(userid, storyid);
  };

  getAllStories = (userid: string) => {
    return this.storyRepo.getAllStories(userid);
  };

  getMyStories = (userid: string) => {
    return this.storyRepo.getMyStories(userid);
  };

  getStoryOfUser = (loggedInUser: string, userid: string) => {
    return this.storyRepo.getStoryOfUser(loggedInUser, userid);
  };

  recordStoryView = (userid: string, uuid: string, storyid: string) => {
    return this.storyRepo.recordStoryView(userid, uuid, storyid);
  };
}
