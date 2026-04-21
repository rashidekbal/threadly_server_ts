import path from "path";
import multer from "multer";
const storage = multer.memoryStorage(); // 👈 file RAM me rakhta hai
const uploadToRam = multer({ storage });

//upload to disk
const storageondisk = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/public/temp");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const uploadtoDisk = multer({ storage: storageondisk });
export { uploadToRam, uploadtoDisk };
