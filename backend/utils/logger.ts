type LogContext = Record<string, unknown>;

function formatError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

export function logError(message: string, error: unknown, context: LogContext = {}): void {
  const timestamp = new Date().toISOString();
  const formattedError = formatError(error);

  // Keep a structured payload for easier grepping/ingestion.
  console.error(
    `[${timestamp}] ERROR: ${message}`,
    JSON.stringify({ ...context, error: formattedError.message, stack: formattedError.stack }),
  );
}
