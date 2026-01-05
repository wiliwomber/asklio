import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { Binary, ObjectId } from "mongodb";
import { getUploadsCollection, type UploadDocument } from "./db.js";
import type { Server } from "node:http";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type ErrorResponse = {
  error: string;
};

type UploadSummary = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
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

function mapToSummary(document: UploadDocument): UploadSummary {
  return {
    id: document._id?.toString() ?? "",
    fileName: document.fileName,
    fileSize: document.fileSize,
    uploadedAt: document.uploadedAt.toISOString(),
  };
}

function handleErrors(error: unknown, _request: Request, response: Response<ErrorResponse>, _next: NextFunction): void {
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

  app.post("/api/uploads", upload.single("file"), async (request, response) => {
    if (!request.file) {
      response.status(400).json({ error: "No PDF was uploaded" satisfies ErrorResponse });
      return;
    }

    const uploads = await getUploadsCollection();
    const document: UploadDocument = {
      fileName: request.file.originalname,
      fileSize: request.file.size,
      mimeType: request.file.mimetype,
      data: request.file.buffer,
      uploadedAt: new Date(),
    };

    const { insertedId } = await uploads.insertOne(document);

    response.status(200).json({
      id: insertedId.toString(),
      message: "PDF stored successfully",
      fileName: document.fileName,
      fileSize: document.fileSize,
    });
  });

  app.get("/api/uploads", async (_request, response) => {
    const uploads = await getUploadsCollection();
    const documents = await uploads
      .find({}, { projection: { data: 0 } })
      .sort({ uploadedAt: -1 })
      .toArray();

    response.json(documents.map(mapToSummary));
  });

  app.get("/api/uploads/:id", async (request, response) => {
    const { id } = request.params;

    if (!ObjectId.isValid(id)) {
      response.status(400).json({ error: "Invalid upload id" });
      return;
    }

    const uploads = await getUploadsCollection();
    const document = await uploads.findOne({ _id: new ObjectId(id) });

    if (!document) {
      response.status(404).json({ error: "Upload not found" });
      return;
    }

    const data = document.data;
    const fileBuffer =
      data instanceof Buffer
        ? data
        : data instanceof Binary
          ? data.buffer
          : data instanceof Uint8Array
            ? Buffer.from(data)
            : data && typeof (data as { buffer?: unknown }).buffer === "object"
              ? Buffer.from((data as { buffer: ArrayBuffer }).buffer)
              : null;

    if (!fileBuffer) {
      response.status(500).json({ error: "Stored file is not readable" });
      return;
    }

    response.setHeader("Content-Type", document.mimeType || "application/pdf");
    response.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(document.fileName)}"`);
    response.send(fileBuffer);
  });

  app.use(handleErrors);

  return app;
}

export async function startServer(port: number): Promise<Server> {
  const app = createServer();

  await getUploadsCollection(); // Fail fast if database is unreachable.

  return await new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`File upload server listening on port ${port}`);
      resolve(server);
    });
  });
}
