require('ts-node/register');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Module, ValidationPipe } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { ImagesController } = require('../src/cloudinary/images.controller');
const { ProductsController } = require('../src/products/products.controller');
const { ProductsService } = require('../src/products/products.service');
const { AppController } = require('../src/app.controller');
const { CloudinaryService } = require('../src/cloudinary/cloudinary.service');
const { setupSwagger } = require('../src/swagger/setup-swagger');
const { v2: cloudinary } = require('cloudinary');

test('Common images HTTP API validates files, supports folder IDs and generates Swagger', async () => {
  let uploaded = 0;
  let removed;
  let uploadedFolder;
  const service = {
    commonFolder: 'common_images',
    uploadImage: async (file, folder) => {
      uploaded++;
      uploadedFolder = folder;
      return { secure_url: 'https://example.com/image.png', public_id: `${folder}/abc`, format: 'png', bytes: file.size };
    },
    deleteImage: async (id) => { removed = id; return id !== 'missing'; },
  };
  class TestModule {}
  Module({ controllers: [ImagesController, ProductsController, AppController], providers: [{ provide: CloudinaryService, useValue: service }, { provide: ProductsService, useValue: {} }] })(TestModule);
  const app = await NestFactory.create(TestModule, { logger: false });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Test').setVersion('1').build());
  setupSwagger(app, document);
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const upload = (bytes, mime = 'image/png', folder) => {
    const form = new FormData();
    if (folder !== undefined) form.set('folder', folder);
    form.set('file', new Blob([bytes], { type: mime }), 'test.png');
    return fetch(`${base}/api/images`, { method: 'POST', body: form });
  };
  const remove = (body) => fetch(`${base}/api/images`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=', 'base64');
    const response = await upload(png);
    assert.equal(response.status, 201);
    assert.equal((await response.json()).data.public_id, 'common_images/abc');
    assert.equal((await upload('fake png')).status, 400);
    assert.equal((await upload('', 'image/png')).status, 400);
    assert.equal((await upload('<svg/>', 'image/svg+xml')).status, 400);
    assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1))).status, 413);
    assert.equal((await fetch(`${base}/api/images`, { method: 'POST', body: new FormData() })).status, 400);
    assert.equal(uploaded, 1);
    assert.equal(uploadedFolder, 'common_images');
    const custom = await upload(png, 'image/png', 'products/wine');
    assert.equal(custom.status, 201);
    assert.equal((await custom.json()).data.public_id, 'products/wine/abc');
    assert.equal(uploadedFolder, 'products/wine');
    assert.equal((await upload(png, 'image/png', '  ')).status, 201);
    assert.equal(uploadedFolder, 'common_images');
    assert.equal((await upload(png, 'image/png', 'x'.repeat(256))).status, 400);
    for (const body of [{}, { publicId: '' }, { publicId: '   ' }, { publicId: 123 }]) assert.equal((await remove(body)).status, 400);
    assert.equal((await remove({ publicId: 'common_images/abc' })).status, 200);
    assert.equal(removed, 'common_images/abc');
    assert.equal((await remove({ publicId: 'missing' })).status, 404);
    const spec = await (await fetch(`${base}/api/docs-json`)).json();
    assert.equal(spec.paths['/api/images'].post.requestBody.content['multipart/form-data'].schema.properties.folder.type, 'string');
    assert.ok(spec.paths['/api/images'].delete.requestBody);
    assert.ok(spec.components.schemas.CreateProductDto.properties.name);
    assert.ok(spec.paths['/api/products'].get.parameters.some(parameter => parameter.name === 'q'));
    assert.ok(spec.paths['/api/products/{id}/upload-image'].post.requestBody.content['multipart/form-data']);
    for (const path of ['/api/docs', '/api/docs/']) {
      const page = await fetch(`${base}${path}`);
      assert.equal(page.status, 200);
      assert.match(page.headers.get('cache-control'), /no-store/);
      const html = await page.text();
      const script = html.match(/src="([^"]*swagger-ui-init\.js\?v=[a-f0-9]{16})"/);
      assert.ok(script, 'Swagger initializer must have a schema version');
      const js = await fetch(new URL(script[1], `${base}${path}`));
      assert.equal(js.status, 200);
      assert.equal(js.headers.get('cloudflare-cdn-cache-control'), 'no-store');
      assert.match(await js.text(), /"folder"/);
    }
  } finally { await app.close(); }
});

test('Cloudinary service reports configuration, provider failures and deletion outcomes', async () => {
  const oldUrl = process.env.CLOUDINARY_URL;
  const originalDestroy = cloudinary.uploader.destroy;
  const originalUpload = cloudinary.uploader.upload_stream;
  delete process.env.CLOUDINARY_URL;
  try {
    const missing = new CloudinaryService({ get: () => '' });
    await assert.rejects(missing.deleteImage('abc'), error => error.getStatus() === 503);
    await assert.rejects(missing.uploadImage({ buffer: Buffer.from('x') }), error => error.getStatus() === 503);
    const service = new CloudinaryService({ get: () => 'cloudinary://key:secret@test' });
    cloudinary.uploader.destroy = async (id, options) => { assert.equal(id, 'folder/image'); assert.equal(options.invalidate, true); return { result: 'ok' }; };
    assert.equal(await service.deleteImage('folder/image'), true);
    cloudinary.uploader.destroy = async () => ({ result: 'not found' });
    assert.equal(await service.deleteImage('missing'), false);
    cloudinary.uploader.destroy = async () => { throw Error('provider secret'); };
    await assert.rejects(service.deleteImage('abc'), error => error.getStatus() === 502 && !error.message.includes('secret'));
    cloudinary.uploader.upload_stream = (options, callback) => ({ end: () => callback({ message: 'provider error' }) });
    await assert.rejects(service.uploadImage({ buffer: Buffer.from('x') }), error => error.getStatus() === 502);
  } finally {
    cloudinary.uploader.destroy = originalDestroy;
    cloudinary.uploader.upload_stream = originalUpload;
    if (oldUrl === undefined) delete process.env.CLOUDINARY_URL; else process.env.CLOUDINARY_URL = oldUrl;
  }
});
