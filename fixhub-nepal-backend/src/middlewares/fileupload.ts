import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

const uploadsDir = "uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadsDir + "/");
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const raw = file.originalname || "";
    const ext = (raw.includes(".") ? raw.split(".").pop() : null) || "jpg";
    cb(null, `${file.fieldname}-${uuidv4()}.${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image allowed"));
  }
};

/** Accepts image/* or application/octet-stream when filename looks like an image (e.g. Flutter web). */
const profilePictureFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
  }
  if (file.mimetype === "application/octet-stream" || !file.mimetype) {
    const name = (file.originalname || "").toLowerCase();
    const imageExt = /\.(jpe?g|png|gif|webp)$/i.test(name);
    if (imageExt) return cb(null, true);
  }
  cb(new Error("Only image allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadProfilePicture = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: profilePictureFileFilter,
});

export const single = (fieldname: string) => upload.single(fieldname);
/** Use for POST /profile/picture so app (Flutter web) uploads with octet-stream are accepted. */
export const singleProfilePicture = (fieldname: string) => uploadProfilePicture.single(fieldname);
export const array = (fieldname: string, maxCount: number) => upload.array(fieldname, maxCount);
export const fields = (fieldsArray: multer.Field[]) => upload.fields(fieldsArray);
