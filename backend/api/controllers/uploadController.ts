import { type NextFunction, type Request, type Response } from "express";
import { extractProcurementOfferFromBuffer } from "../../domain/services/extractorService.js";
import {
  createProcurementRequest,
  getProcurementUploadContent,
  listProcurementRequests,
} from "../../domain/services/procurementRequestService.js";
import { logError } from "../../utils/logger.js";

export async function uploadPdf(request: Request, response: Response, next: NextFunction) {
  try {
    if (!request.file) {
      response.status(400).json({ error: "No PDF was uploaded" });
      return;
    }

    const extraction = await extractProcurementOfferFromBuffer(request.file.buffer);

    const procurementRequest = await createProcurementRequest({
      document: {
        fileName: request.file.originalname,
        mimeType: request.file.mimetype,
        fileSize: request.file.size,
        data: request.file.buffer,
        uploadedAt: new Date(),
      },
      extraction,
    });

    response.status(200).json({
      id: procurementRequest.id,
      message: "PDF stored successfully",
      procurementRequest,
    });
  } catch (error) {
    logError("Upload handler failed", error, { fileName: request.file?.originalname });
    next(error);
  }
}

export async function listUploadsController(_request: Request, response: Response, next: NextFunction) {
  try {
    const requests = await listProcurementRequests();
    response.json(requests);
  } catch (error) {
    logError("Failed to list uploads", error);
    next(error);
  }
}

export async function getUploadByIdController(request: Request, response: Response, next: NextFunction) {
  try {
    const { id } = request.params;
    const upload = await getProcurementUploadContent(id);

    if (!upload) {
      response.status(404).json({ error: "Upload not found" });
      return;
    }

    response.setHeader("Content-Type", upload.mimeType);
    response.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(upload.fileName)}"`);
    response.send(upload.data);
  } catch (error) {
    logError("Failed to fetch upload by id", error, { uploadId: request.params.id });
    next(error);
  }
}
