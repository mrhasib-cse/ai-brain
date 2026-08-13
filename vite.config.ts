import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'mcp-api-middleware',
        configureServer(server) {
          const handleApiRoute = async (modulePath: string, req: any, res: any) => {
            const buffers: Uint8Array[] = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawBody = Buffer.concat(buffers).toString('utf-8');
            req.body = rawBody;
            try {
              const { default: handler } = await server.ssrLoadModule(modulePath);
              await handler(req, res);
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          };

          server.middlewares.use(async (req: any, res: any, next: any) => {
            const url = (req.url || '').split('?')[0];

            if (url === '/.well-known/oauth-protected-resource' || url === '/api/.well-known/oauth-protected-resource') {
              return handleApiRoute('/api/well-known-oauth-protected-resource.ts', req, res);
            }
            if (url === '/.well-known/oauth-authorization-server' || url === '/api/.well-known/oauth-authorization-server') {
              return handleApiRoute('/api/well-known-oauth-authorization-server.ts', req, res);
            }
            if (url === '/api/oauth/register') {
              return handleApiRoute('/api/oauth/register.ts', req, res);
            }
            if (url === '/api/oauth/authorize') {
              return handleApiRoute('/api/oauth/authorize.ts', req, res);
            }
            if (url === '/api/oauth/create-code') {
              return handleApiRoute('/api/oauth/create-code.ts', req, res);
            }
            if (url === '/api/oauth/token') {
              return handleApiRoute('/api/oauth/token.ts', req, res);
            }
            if (url === '/api/mcp') {
              return handleApiRoute('/api/mcp.ts', req, res);
            }

            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
