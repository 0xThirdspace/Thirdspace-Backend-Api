import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

export interface Params {
  folder?: string;
}

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PNG, JPEG, and JPG files are allowed."
      ),
      false
    );
  }
};

const pdfFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PNG, JPEG, PDF and JPG files are allowed."
      ),
      false
    );
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "workspace",
  } as Params,
});

const kenbanStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kenban board",
  } as Params,
});

export const kenbanUpload = multer({
  storage: kenbanStorage,
  fileFilter: pdfFilter as any,
});

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter as any,
});
