import { Router } from "express";
import multer from "multer";
import {
  getUploadByIdController,
  listUploadsController,
  updateProcurementRequestController,
  uploadPdf,
} from "../controllers/uploadController.js";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function createUploadMiddleware(): multer.Multer {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (_req, file, callback) => {
      const hasPdfMimeType = file.mimetype === "application/pdf";
      const hasPdfExtension = file.originalname.toLowerCase().endsWith(".pdf");

      if (!hasPdfMimeType || !hasPdfExtension) {
        callback(new Error("Only PDF files are allowed"));
        return;
      }

      callback(null, true);
    },
  });
}

export function createUploadRouter() {
  const router = Router();
  const upload = createUploadMiddleware();

  router.post("/uploads", upload.single("file"), uploadPdf);
  router.get("/uploads", listUploadsController);
  router.get("/uploads/:id", getUploadByIdController);
  router.patch("/requests/:id", updateProcurementRequestController);

  return router;
}
