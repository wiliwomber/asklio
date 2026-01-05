import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type ErrorResponse = {
  error: string;
};

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

function handleUpload(request: Request, response: Response): void {
  if (!request.file) {
    response.status(400).json({ error: "No PDF was uploaded" satisfies ErrorResponse });
    return;
  }

  response.status(200).json({
    message: "PDF received successfully",
    fileName: request.file.originalname,
    fileSize: request.file.size,
  });
}

function handleErrors(error: unknown, _request: Request, response: Response<ErrorResponse>, next: NextFunction): void {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "PDF exceeds maximum size of 10MB" : error.message;
    response.status(400).json({ error: message });
    return;
  }

  if (error instanceof Error) {
    response.status(400).json({ error: error.message });
    return;
  }

  response.status(500).json({ error: "Unexpected server error" });
}

export function createServer() {
  const app = express();
  const upload = createUploadMiddleware();

  app.use(cors({ origin: true }));
  app.post("/api/uploads", upload.single("file"), handleUpload);
  app.use(handleErrors);

  return app;
}

export function startServer(port: number) {
  const app = createServer();

  return app.listen(port, () => {
    console.log(`File upload server listening on port ${port}`);
  });
}
