/*import express from "express";
import cors from "cors";
import request from "request";
import { loadBackendMADC } from "./src/back/index-MADC.js";
import { handler } from './src/front/build/handler.js';

const app = express();
const PORT = process.env.PORT || 3000;
const PROYECTNAME = `SOS2425-jul-madc`;

app.use(express.json());
app.use(cors());

// Cargar backends
loadBackendMADC(app);

// handler Svelte
app.use(handler);

// Rutas estáticas
app.use("/public", express.static("./public/"));
app.use("/about", express.static("./about/"));

// Inicializar el servidor
app.listen(PORT, () => {
  console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});
*/

import express from "express";
import cors from "cors";
import request from "request";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { loadBackendMADC } from "./src/back/index-MADC.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const PROYECTNAME = `SOS2425-jul-madc`;

app.use(express.json());
app.use(cors());

// Cargar backends
loadBackendMADC(app);

// Importación dinámica del handler de Svelte
const possiblePaths = [
  './src/front/build/handler.js',
  './front/build/handler.js',
  join(__dirname, 'src/front/build/handler.js'),
  join(__dirname, 'front/build/handler.js'),
  './build/handler.js',
  join(__dirname, 'build/handler.js'),
  '/opt/render/project/src/dist/handler.js'
];

let handlerPath;
for (const path of possiblePaths) {
  if (existsSync(path)) {
    handlerPath = path;
    break;
  }
}

if (!handlerPath) {
  console.error('Handler not found in any of these paths:', possiblePaths);
  console.error('Cannot start server without Svelte handler');
  process.exit(1);
}

try {
  const { handler } = await import(handlerPath);
  app.use(handler);
  console.log('Using handler from:', handlerPath);
} catch (error) {
  console.error('Error loading handler:', error.message);
  console.error('Cannot start server without Svelte handler');
  process.exit(1);
}

// Rutas estáticas
app.use("/public", express.static("./public/"));
app.use("/about", express.static("./about/"));

// Inicializar el servidor
app.listen(PORT, () => {
  console.log(`Proyect ${PROYECTNAME} correctly deployed and running at port ${PORT}`);
});