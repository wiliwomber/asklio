import { type ProcurementRequest } from "../types";

export function isOrderLinesComplete(request: ProcurementRequest | null): boolean {
  if (!request || !request.orderLines || request.orderLines.length === 0) return false;

  return request.orderLines.every((line) => {
    return (
      !!line.product &&
      line.unitPrice !== null &&
      line.unitPrice !== undefined &&
      Number.isFinite(line.unitPrice) &&
      line.quantity !== null &&
      line.quantity !== undefined &&
      Number.isInteger(line.quantity) &&
      line.quantity > 0 &&
      line.totalCost !== null &&
      line.totalCost !== undefined &&
      Number.isFinite(line.totalCost) &&
      line.totalCost > 0
    );
  });
}

export function isRequestComplete(request: ProcurementRequest | null): boolean {
  if (!request) return false;

  const requiredStrings = [
    request.requestor,
    request.requestorDepartment,
    request.vendor,
    request.description,
    request.vatId,
    request.commodityGroup,
    request.category,
  ];

  const hasStrings = requiredStrings.every((value) => !!value);
  const hasTotal =
    request.totalCost !== null && request.totalCost !== undefined && Number.isFinite(request.totalCost) && request.totalCost > 0;

  return hasStrings && hasTotal && isOrderLinesComplete(request);
}
