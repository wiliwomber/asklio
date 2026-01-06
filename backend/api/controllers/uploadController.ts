import { type NextFunction, type Request, type Response } from "express";
import { getUploadContent, listUploadsWithRequests, storeUpload } from "../../domain/services/uploadService.js";
import { createProcurementRequest } from "../../domain/services/procurementRequestService.js";
import { extractProcurementOfferFromBuffer } from "../../parser/extractor.js";

export async function uploadPdf(request: Request, response: Response, next: NextFunction) {
  try {
    if (!request.file) {
      response.status(400).json({ error: "No PDF was uploaded" });
      return;
    }

    const { insertedId, summary } = await storeUpload({
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
      fileName: summary.fileName,
      fileSize: summary.fileSize,
      uploadedAt: summary.uploadedAt,
      procurementRequest,
    });
  } catch (error) {
    next(error);
  }
}

export async function listUploadsController(_request: Request, response: Response, next: NextFunction) {
  try {
    const uploads = await listUploadsWithRequests();
    response.json(uploads);
  } catch (error) {
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
    next(error);
  }
}
