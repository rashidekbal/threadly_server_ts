import logger, { formErrorBody } from "../utils/pino.js";
import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryCloudName, getCloudinaryApiKey, getCloudinarySecretKey } from "../utils/envValuesAccessInterface.js";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: getCloudinaryCloudName(),
  api_key: getCloudinaryApiKey(),
  api_secret: getCloudinarySecretKey(),
});

// Upload an image
async function uploadOnColudinaryFromRam(buffer:any) {
  try {
    if (!buffer) return null;

    return await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) return reject(null);
          if(!result) return reject(null);
          let secureUrl = result.secure_url.replace("http://", "https://");
          return resolve(secureUrl);
        }
      );
      stream.end(buffer); // ⬅️ RAM buffer se upload
    });
  } catch (error) {
         logger.error(formErrorBody(error as string,null,null));

    return null;
  }
}

//upload on cloudnary from storage

 function uploadOnColudinaryviaLocalPath(localpath:string) {
  return new Promise(async(resolve,reject)=>{
    try {
    if (!localpath) return null;
    let response = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localpath);
    response.url = response.url.replace("http://", "https://");
    return resolve(response.url);
  } catch (error) {
    fs.unlinkSync(localpath); //remove temp file
        logger.error(formErrorBody(error as string,null,null));

    return reject(null);
  }

  })
}

export { uploadOnColudinaryFromRam, uploadOnColudinaryviaLocalPath };
