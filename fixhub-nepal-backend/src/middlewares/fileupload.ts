import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "uploads/");
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = file.originalname.split(".").pop();
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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const single = (fieldname: string) => upload.single(fieldname);
export const array = (fieldname: string, maxCount: number) => upload.array(fieldname, maxCount);
export const fields = (fieldsArray: multer.Field[]) => upload.fields(fieldsArray);
