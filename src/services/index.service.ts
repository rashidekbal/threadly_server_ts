import FollowRepo from "../repo/followRepo.js";
import UserRepo from "../repo/userRepo.js";
import PostRepo from "../repo/postRepo.js";
import LikeRepo from "../repo/likeRepo.js";
import CommentRepo from "../repo/commentRepo.js";
import StoryRepo from "../repo/storyRepo.js";
import SearchRepo from "../repo/searchRepo.js";
import MessageRepo from "../repo/messageRepo.js";
import PostStatsRepo from "../repo/postStatsRepo.js";
import PostShareRepo from "../repo/postShareRepo.js";

import AdminService from "./AdminService.js";
import AuthService from "./authService.js";
import FcmService from "./fcmService.js";
import FollowService from "./followService.js";
import PrivacyService from "./PrivacyService.js";
import UserService from "./UserServices.js";
import PostService from "./postService.js";
import LikeService from "./likeService.js";
import CommentService from "./commentService.js";
import StoryService from "./storyService.js";
import SearchService from "./searchService.js";
import MessageService from "./messageService.js";
import PostStatsService from "./postStatsService.js";
import PostShareService from "./postShareService.js";
import ProfileService from "./profileService.js";
import ForgetPasswordService from "./forgetPasswordService.js";


const adminService: AdminService = new AdminService();
const userService: UserService = new UserService(new UserRepo());
const authService: AuthService = new AuthService(new UserRepo());
const privacyService: PrivacyService = new PrivacyService(new UserRepo());
const followService: FollowService = new FollowService(new FollowRepo());
const fcmService: FcmService = new FcmService();
const postService: PostService = new PostService(new PostRepo());
const likeService: LikeService = new LikeService(new LikeRepo());
const commentService: CommentService = new CommentService(new CommentRepo());
const storyService: StoryService = new StoryService(new StoryRepo());
const searchService: SearchService = new SearchService(new SearchRepo());
const messageService: MessageService = new MessageService(new MessageRepo(), new UserRepo());
const postStatsService: PostStatsService = new PostStatsService(new PostStatsRepo());
const postShareService: PostShareService = new PostShareService(new PostShareRepo());
const profileService: ProfileService = new ProfileService(new UserRepo());
const forgetPasswordService: ForgetPasswordService = new ForgetPasswordService(new UserRepo());

export {
    adminService,
    userService,
    authService,
    privacyService,
    followService,
    fcmService,
    postService,
    likeService,
    commentService,
    storyService,
    searchService,
    messageService,
    postStatsService,
    postShareService,
    profileService,
    forgetPasswordService,
}