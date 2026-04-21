import messageType from "../constants/messageTypeEnum.js"

type message={
      messageUid:string,
  replyToMessageId:string,
  senderUUId:string,
  recieverUUId:string,
  type:messageType,
  message:string,
  postid:number,
  postLink:string|null,
  creationTime:string,
  deliveryStatus:number,
  isDeleted:boolean
}
export default message