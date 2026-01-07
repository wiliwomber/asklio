import { type NextFunction, type Request, type Response } from "express";
import { getUploadContent, listUploadsWithRequests, storeUpload } from "../../domain/services/uploadService.js";
import { createProcurementRequest } from "../../domain/services/procurementRequestService.js";
import { extractProcurementOfferFromBuffer } from "../../domain/services/extractorService.js";
import { logError } from "../../utils/logger.js";

export async function uploadPdf(request: Request, response: Response, next: NextFunction) {
  try {
    if (!request.file) {
      response.status(400).json({ error: "No PDF was uploaded" });
      return;
    }

    const { insertedId, uploadMeta } = await storeUpload({
      fileName: request.file.originalname,
      mimeType: request.file.mimetype,
      fileSize: request.file.size,
      data: request.file.buffer,
    });

    const extraction = await extractProcurementOfferFromBuffer(request.file.buffer);

    const procurementRequest = await createProcurementRequest({ uploadId: insertedId, extraction });

    response.status(200).json({
      id: insertedId.toString(),
      message: "PDF stored successfully",
      uploadMeta,
      procurementRequest: {
        id: procurementRequest._id?.toString() ?? "",
        uploadId: procurementRequest.uploadId.toString(),
        status: procurementRequest.status,
        extraction: procurementRequest.extraction,
        createdAt: procurementRequest.createdAt.toISOString(),
        updatedAt: procurementRequest.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    logError("Upload handler failed", error, { fileName: request.file?.originalname });
    next(error);
  }
}

export async function listUploadsController(_request: Request, response: Response, next: NextFunction) {
  try {
    const uploads = await listUploadsWithRequests();
    response.json(uploads);
  } catch (error) {
    logError("Failed to list uploads", error);
    next(error);
  }
}

export async function getUploadByIdController(request: Request, response: Response, next: NextFunction) {
  try {
    const { id } = request.params;
    const upload = await getUploadContent(id);

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
