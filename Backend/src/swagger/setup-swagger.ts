import { createHash } from 'crypto';
import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';

export function setupSwagger(app: INestApplication, document: OpenAPIObject) {
  // A changed schema gets a new asset URL, even when a CDN retains the old JS.
  const version = createHash('sha256').update(JSON.stringify(document)).digest('hex').slice(0, 16);
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!/^\/api\/docs(?:\/|$|-json$|-yaml$)/.test(req.path)) return next();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
    if (req.path === '/api/docs' || req.path === '/api/docs/') {
      const send = res.send;
      res.send = function (body: any) {
        if (typeof body === 'string') {
          body = body.replace(/swagger-ui-init\.js(?=["'])/g, `swagger-ui-init.js?v=${version}`);
        }
        return send.call(this, body);
      };
    }
    next();
  });
  SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json' });
}
