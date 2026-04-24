 import admin from "firebase-admin";
 import Response from "../constants/Response.js"
import { TokenMessage } from "firebase-admin/messaging";
import { getFirebaseAdmin } from "../utils/envValuesAccessInterface.js";
const firebaseBase64=getFirebaseAdmin();
const serviceAccount=JSON.parse(Buffer.from(firebaseBase64,"base64").toString("utf-8"));
export default class FcmService{
 StartServiceFcm = () => {

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

//  sendMessage = (token, Message) => {
//   return new Promise(async (resolve, reject) => {
//     // console.log('sending .. inside sendMessage fcm service')
//     const message = {
//       token,
//       android: {
//         priority: "high"
//       },
//       data: {
//         msg: Message.msg,
//         senderUuid: Message.senderUuid,
//         receiverUuid: Message.receiverUuid,
//         receiverUserId: Message.receiverUserId,
//         username: Message.username,
//         userid: Message.userid,
//         profile: Message.profile,
//         MsgUid: Message.MsgUid,
//         type: Message.type,
//         postId: Message.postId,
//         link: Message.link,
//         timestamp: Message.timestamp,
//         ReplyTOMsgUid: Message.ReplyTOMsgUid,
//         deliveryStatus: Message.deliveryStatus,
//         isDeleted: Message.isDeleted,
//         responseType: "chat",
//         notificationText: Message.notificationText

//       }
//     };
//     try {
//       await admin.messaging().send(message);
//       resolve(new Response(200, { msg: "success" }));

//     } catch (error) {
  
//       reject(new Response(500, { msg: error }));
//     }
//   })


// };
//  notifyStatus_via_Fcm = (token, messageuid, status, isDeleted, receiverUserId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high"
//       },
//       data: {
//         MsgUid: messageuid,
//         deliveryStatus: String(status),
//         isDeleted: String(isDeleted),
//         responseType: "statusUpdate",
//         receiverUserId: receiverUserId,

//       }
//     };
//     try {
//       await admin.messaging().send(message);
//       resolve(new Response(200, { msg: "success" }));

//     } catch (error) {

//       reject(new Response(500, { msg: error }));
//     }
//   })


// };
//  notifyUnsendMessageViaFcm = (token, messageUid, ReceiverUUId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high"
//       },
//       data: {
//         MsgUid: messageUid,
//         ReceiverUUId: ReceiverUUId,
//         responseType: "msgUnsendEvent"

//       }
//     };
//     try {
//       // console.log(message.data);
//       await admin.messaging().send(message);
//       resolve(new Response(200, { msg: "success" }));

//     } catch (error) {

//       reject(new Response(500, { msg: error }));
//     }
//   })

// }
//  notify_postLiked_via_fcm = async (token, postId, postLink, userprofile, username, userid, insertId, ReceiverUserId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high",
//       },

//       data: {
//         responseType: "postLike",
//         userId: userid,
//         username: username,
//         ReceiverUserId: ReceiverUserId,
//         postId: String(postId), postLink: postLink,
//         userprofile: userprofile, insertId: String(insertId)
//       }

//     }

//     try {
//       await admin.messaging().send(message);
//       resolve(new Response(200, { msg: "success" }))
//     } catch (e) {
//       reject(new Response(500, { msg: e }))
//     }
//   })

// };
//  notify_post_unliked_via_fcm = async (token, userId, postId, ReceiverUserId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high"
//       }
//       ,
//       data: {
//         responseType: "postUnLike",
//         userId: userId,
//         ReceiverUserId: ReceiverUserId,
//         postId: String(postId)
//       }
//     }
//     try {
//       await admin.messaging().send(message);
//       resolve(new Response(200, { msg: "success" }))


//     } catch (e) {
//       reject(new Response(500, { msg: e }))

//     }
//   });



// }
//  notify_new_Follower_via_fcm = async (token, userid, username, profile, isFollowed, ReceiverUserId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high",
//       },

//       data: {
//         responseType: "newFollower",
//         username: username,
//         userid: userid,
//         ReceiverUserId: ReceiverUserId,
//         isFollowed: String(isFollowed),
//         profile: profile
//       }
//     }
//     try {
//       await admin.messaging().send(message);
//       resolve(new Response(200, { msg: "success" }))

//     } catch (error) {
//       reject(new Response(500, { msg: error }))

//     }
//   })
// }

 notify_Follow_request_accepted_fcm = async (packet:{token:string, userid:string, username:string, profile:string, isFollowed:string, ReceiverUserId:string}) => {
  return new Promise(async (resolve, reject) => {
    const message:TokenMessage = {
      token:packet.token,
      android: {
        priority: "high",
      },

      data: {
        responseType: "followAccepted",
        username: packet.username,
        userid: packet.userid,
        ReceiverUserId: packet.ReceiverUserId,
        isFollowed: packet.isFollowed,
        profile: packet.profile
      }
    }
    try {
      await admin.messaging().send(message);
      resolve(new Response(200, { msg: "success" }))

    } catch (error) {
      reject(new Response(500, { msg: error }))

    }
  })
}
 notify_new_Follower_via_fcm = async (packet:{token:string, userid:string, username:string, profile:string, isFollowed:string, ReceiverUserId:string}) => {
  return new Promise(async (resolve, reject) => {
    const message:TokenMessage = {
      token:packet.token,
      android: {
        priority: "high",
      },

      data: {
        responseType: "newFollower",
        username: packet.username,
        userid: packet.userid,
        ReceiverUserId: packet.ReceiverUserId,
        isFollowed: packet.isFollowed,
        profile: packet.profile
      }
    }
    try {
      await admin.messaging().send(message);
      resolve(new Response(200, { msg: "success" }))

    } catch (error) {
      reject(new Response(500, { msg: error }))

    }
  })
}


 notify_new_Follower_request_fcm=async (packet:{token:string, userid:string, username:string, profile:string, isFollowed:string, ReceiverUserId:string}) => {
  return new Promise(async (resolve, reject) => {
    //  console.log(ReceiverUserId);
    const message:TokenMessage = {
      token:packet.token,
      android: {
        priority: "high",
      },
     

      data: {
        responseType: "newFollowRequest",
        username: packet.username,
        userid: packet.userid,
        ReceiverUserId: packet.ReceiverUserId,
        isFollowed: packet.isFollowed,
        profile: packet.profile
      }
    }
    try {
      await admin.messaging().send(message);
      resolve(new Response(200, { msg: "success" }))

    } catch (error) {
      reject(new Response(500, { msg: error }))

    }
  })
}



//  notify_followRequestCancel_via_fcm= async (token, userId, ReceiverUserId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high"
//       }
//       ,
//       data: {
//         responseType: "followRequestCancel",
//         ReceiverUserId: ReceiverUserId,
//         userId: userId,

//       }
//     }
//     try {
//       await admin.messaging().send(message);
//       resolve(new Response(200, { msg: "success" }))


//     } catch (e) {
//       reject(new Response(500, { msg: e }))

//     }
//   });



// }





//  notify_UnFollow_via_fcm = async (token, userId, ReceiverUserId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high"
//       }
//       ,
//       data: {
//         responseType: "UnFollow",
//         ReceiverUserId: ReceiverUserId,
//         userId: userId,

//       }
//     }
//     try {
//       await admin.messaging().send(message);
//       resolve(new Response(200, { msg: "success" }))


//     } catch (e) {
//       reject(new Response(500, { msg: e }))

//     }
//   });



// }
//  notifyCommentLike_via_fcm = async (token, userid, username, profile, postid, Commentid, postLink, ReceiverUserId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high"
//       },
//       data: {
//         responseType: "commentLike",
//         ReceiverUserId: ReceiverUserId,
//         userId: userid,
//         username: username,
//         profile: profile,
//         postId: String(postid),
//         postLink: postLink,
//         commentId: String(Commentid)

//       }
//     }
//     try {
//       await admin.messaging().send(message);

//       resolve(new Response(200, { msg: "success" }));

//     } catch (error) {
//       reject(new Response(500, { msg: error }));

//     }
//   })
// }
//  notifyCommentUnlike_via_fcm = async (token, userid, Commentid, ReceiverUserId) => {
//   return new Promise(async (resolve, reject) => {
//     const message = {
//       token,
//       android: {
//         priority: "high"
//       },
//       data: {
//         responseType: "commentUnlike",
//         userId: userid,
//         ReceiverUserId: ReceiverUserId,
//         commentId: String(Commentid)

//       }
//     }
//     try {
//       await admin.messaging().send(message);

//       resolve(new Response(200, { msg: "success" }));

//     } catch (error) {
//       reject(new Response(500, { msg: error }));

//     }
//   })
// }



}