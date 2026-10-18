import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SAMPLES } from './samples.js';

const root = dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
const publicFiles = new Set(['index.html', 'styles.css', 'app.js', 'domain.js', 'home-layout.js', 'home-view.js', 'samples.js', 'assets/favicon.svg', ...SAMPLES.map(sample => sample.file)]);
const port = Number(process.env.PORT || 5173);

createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';
    const file = resolve(root, path);
    if (!publicFiles.has(path) || !file.startsWith(root + sep)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    console.error('Unable to serve request:', error.message);
    response.writeHead(error instanceof URIError ? 400 : 500).end('Unable to serve request');
  }
}).listen(port, '127.0.0.1', () => console.log(`VisionStock is ready at http://127.0.0.1:${port}`));
