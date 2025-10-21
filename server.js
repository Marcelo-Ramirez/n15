const { createServer: createHttpsServer } = require('https');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const fs = require('fs');
const path = require('path');

// --- Forzar modo Producción ---
const dev = false;
const port = 443; // Puerto de producción
// ---------------------------------

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressServer = express();

  // Dejamos que Next.js maneje todas las peticiones
  expressServer.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url, true);
    return handle(req, res, parsedUrl);
  });

  // --- Iniciar Servidor HTTPS (Modo Producción) ---
  
  // Lee los certificados que están en la misma carpeta
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'fullchain.pem')),
  };

  // Inicia el servidor HTTPS
  createHttpsServer(httpsOptions, expressServer).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Listo en https://muytuna.shop:${port}`);
  });
});