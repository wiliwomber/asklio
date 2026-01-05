import "dotenv/config";
import { startServer } from "./server.js";

const DEFAULT_PORT = 3000;

async function bootstrap(): Promise<void> {
  const port = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);

  if (Number.isNaN(port)) {
    throw new Error("PORT must be a valid number");
  }

  startServer(port);
}

bootstrap().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("Failed to start server:", errorMessage);
  process.exit(1);
});
