import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import type { Server } from "node:http";
import multer from "multer";
import { createUploadRouter } from "./api/routes/uploadRoutes.js";
import { getMongoClient } from "./db/client.js";
import { logError } from "./utils/logger.js";

type ErrorResponse = {
  error: string;
};

function errorHandler(error: unknown, _request: Request, response: Response<ErrorResponse>, _next: NextFunction): void {
  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE" ? "PDF exceeds maximum size of 10MB" : error.message;
    response.status(400).json({ error: message });
    return;
  }

  if (error instanceof Error) {
    logError("Request handler error", error);
    response.status(400).json({ error: error.message });
    return;
  }

  logError("Unexpected request handler error", error);
  response.status(500).json({ error: "Unexpected server error" });
}

export function createServer() {
  const app = express();

  app.use(cors({ origin: true }));
  app.use("/api", createUploadRouter());
  app.use(errorHandler);

  return app;
}

export async function startServer(port: number): Promise<Server> {
  await getMongoClient(); // Fail fast if database is unreachable.
  const app = createServer();

  return await new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`File upload server listening on port ${port}`);
      resolve(server);
    });
  });
}
