import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { readServerSettings } from "./src/core/server.settings.ts";

try {
  const settings = readServerSettings();
  const server = await createServer({
    root: fileURLToPath(new URL("./", import.meta.url)),
    server: { port: settings.port, host: true, strictPort: true },
    plugins: [
      {
        name: "runtime-configuration",
        configureServer(instance) {
          instance.middlewares.use("/runtime-config.json", (_request, response) => {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ apiBaseUrl: settings.apiBaseUrl }));
          });
        },
      },
    ],
  });
  await server.listen();
  console.log(`Listening on http://localhost:${settings.port}`);
  const stop = async () => {
    await server.close();
    process.disconnect?.();
  };
  process.on("SIGINT", () => {
    void stop();
  });
  process.on("SIGTERM", () => {
    void stop();
  });
  process.on("message", (message) => {
    if (message === "shutdown") void stop();
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
