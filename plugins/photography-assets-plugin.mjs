import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const virtualModuleId = "virtual:photography-assets";
const resolvedVirtualModuleId = `\0${virtualModuleId}`;
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

function getAltText(fileName) {
  const nameWithoutExtension = path.basename(fileName, path.extname(fileName));
  const readableName = nameWithoutExtension
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return readableName ? `Photography item ${readableName}` : "Photography gallery item";
}

function encodePublicPath(fileName) {
  return `/photography/${encodeURIComponent(fileName)}`;
}

export function photographyAssetsPlugin() {
  let photographyDir;

  async function readPhotographyAssets() {
    try {
      const entries = await readdir(photographyDir, { withFileTypes: true });

      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((fileName) => imageExtensions.has(path.extname(fileName).toLowerCase()))
        .sort((first, second) => first.localeCompare(second, undefined, { numeric: true, sensitivity: "base" }))
        .map((fileName) => ({
          type: "image",
          src: encodePublicPath(fileName),
          alt: getAltText(fileName),
        }));
    } catch (error) {
      if (error.code === "ENOENT") {
        await mkdir(photographyDir, { recursive: true });
        return [];
      }

      throw error;
    }
  }

  return {
    name: "photography-assets",
    configResolved(config) {
      photographyDir = path.join(config.root, "public", "photography");
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }

      return null;
    },
    async load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null;
      }

      const assets = await readPhotographyAssets();
      return `export const photographyAssets = ${JSON.stringify(assets, null, 2)};`;
    },
    configureServer(server) {
      server.watcher.add(photographyDir);

      const reloadPhotography = () => {
        const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }

        server.ws.send({ type: "full-reload" });
      };

      server.watcher.on("add", (filePath) => {
        if (path.dirname(filePath) === photographyDir) {
          reloadPhotography();
        }
      });

      server.watcher.on("unlink", (filePath) => {
        if (path.dirname(filePath) === photographyDir) {
          reloadPhotography();
        }
      });
    },
  };
}
