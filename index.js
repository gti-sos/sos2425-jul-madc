import express from "express";
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