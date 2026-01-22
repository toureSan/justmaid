import { defineEventHandler, setHeader, setResponseStatus } from "h3";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROBOTS_PATH = join(__dirname, "..", "public", "robots.txt");

export default defineEventHandler(async (event) => {
  try {
    const txt = await readFile(ROBOTS_PATH, "utf8");
    setHeader(event, "Content-Type", "text/plain; charset=utf-8");
    setHeader(event, "Cache-Control", "public, max-age=3600");
    return txt;
  } catch {
    setResponseStatus(event, 404);
    setHeader(event, "Content-Type", "text/plain; charset=utf-8");
    return "Not found";
  }
});

