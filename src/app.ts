import http from "http";
import cors from "cors"
import { Server } from "socket.io";
import express from "express";
import OptRoute from "./routes/otp.route.js";
import postRoute from "./routes/post.route.js";
import LikeRouter from "./routes/like.route.js";
import followRoute from "./routes/follow.route.js";
import commentRoute from "./routes/comment.route.js";
import usersRouter from "./routes/user.route.js";
import ForgetPasswordRoute from "./routes/forgetPassword.route.js";
import profileRouter from "./routes/profile.route.js";
import MessagesRouter from "./routes/message.route.js";
import storyRouter from "./routes/story.route.js";
import SearchRouter from "./routes/search.route.js";
import Fcmrouter from "./routes/fcm.route.js";
import PrivacyRouter from "./routes/privacy.route.js";
import authRoute from "./routes/auth.route.js";
import AdminAuthRouter from "./routes/admin/adminAuth.route.js";

import { setSocketFunctions } from "./socketHandlers/SocketMainHandler.js";
import AdminPostsRoute from "./routes/admin/post.route.js"
import AdminStoryRoute from "./routes/admin/story.route.js"
import AdminCommentRoute from "./routes/admin/adminCommentsRoute.js"
import AdminUsersRouter from "./routes/admin/user.route.js";
import statsRoute from "./routes/admin/stats.route.js"
let app = express();

let server = http.createServer(app);
export let socketIo = new Server(server, {
  cors: {
    origin: "*",
  },
  transports: ["websocket", "polling"],
});

app.use(express.json({ limit: "16kb" }));
app.use(cors({ origin: "*" }));
app.use(express.static("public"));

socketIo.on("connection", (socket) => {
  setSocketFunctions(socket, socketIo);
});
app.get("/", (req, res) => {
  res.send("welcome");
});
//routes
app.use("/api/otp", OptRoute);
app.use("/api/auth", authRoute);
app.use("/api/ForgetPassword", ForgetPasswordRoute);
app.use("/api/posts", postRoute);
app.use("/api/like", LikeRouter);
app.use("/api/follow", followRoute);
app.use("/api/comment", commentRoute);
app.use("/api/users", usersRouter);
app.use("/api/profile", profileRouter);
app.use("/api/story", storyRouter);
app.use("/api/fcm", Fcmrouter);
app.use("/api/messages", MessagesRouter);
app.use("/api/privacy", PrivacyRouter);
app.use("/api/search", SearchRouter);
// all routes below are for admin panel use 
app.use("/api/admin/v1/auth", AdminAuthRouter);
app.use("/api/admin/v1/users",AdminUsersRouter);
app.use("/api/admin/v1/posts",AdminPostsRoute);
app.use("/api/admin/v1/story",AdminStoryRoute);
app.use("/api/admin/v1/comments",AdminCommentRoute);
app.use("/api/admin/v1/stats",statsRoute);
export default server