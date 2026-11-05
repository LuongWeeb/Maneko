const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
      const filePath = path.resolve(root, relativePath);
      const allowed = relativePath === 'index.html' || relativePath.startsWith('assets/');
      if (!allowed || !filePath.startsWith(`${root}${path.sep}`) || !['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(404).end('Not found');
        return;
      }
      const data = await fs.readFile(filePath);
      response.writeHead(200, {
        'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  createServer().listen(port, '127.0.0.1', () => console.log(`Maneko: http://127.0.0.1:${port}`));
}

module.exports = { createServer };
