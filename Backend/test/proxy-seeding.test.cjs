require('ts-node/register');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Module, ValidationPipe } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { ConfigModule } = require('@nestjs/config');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const {
  ProxySeedingModule,
  ProxySeedingService,
} = require('../src/proxy-seeding/proxy-seeding.module');

test('Proxy Seeding: Swagger spec, DTO validation, and service check', async () => {
  let app;
  try {
    class TestAppModule {}
    Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        ProxySeedingModule,
      ],
    })(TestAppModule);

    app = await NestFactory.create(TestAppModule, { logger: false });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    const spec = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Test API').build(),
    );

    // Verify OpenAPI paths
    const postOp = spec.paths['/api/proxy-seeding']?.post;
    const getOp = spec.paths['/api/proxy-seeding']?.get;
    assert.ok(postOp, 'POST /api/proxy-seeding endpoint should exist in Swagger');
    assert.ok(getOp, 'GET /api/proxy-seeding endpoint should exist in Swagger');
    assert.deepEqual(postOp.tags, ['Proxy Seeding']);

    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();

    // Test rejection of invalid target URL
    const invalidRes = await fetch(`${base}/api/proxy-seeding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://127.0.0.1:8080/internal' }),
    });
    assert.equal(invalidRes.status, 400);

    // Test live check with default configured proxy
    const res = await fetch(`${base}/api/proxy-seeding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(typeof body.success, 'boolean');
    assert.equal(typeof body.status, 'number');
    assert.ok(body.finalUrl, 'finalUrl must be present in response');
    assert.ok(body.redirectUrl, 'redirectUrl must be present in response');
    assert.ok(body.proxyLocation, 'proxyLocation must be present in response');
    assert.equal(body.proxyLocation.success, true);
    assert.ok(body.proxyLocation.ip, 'proxyLocation.ip must be present');
    assert.ok(body.proxyLocation.country, 'proxyLocation.country must be present');
    assert.ok(body.device, 'device must be present');
    assert.ok(body.meta, 'meta must be present');

    console.log('✅ Live proxy check passed:');
    console.log('   - IP:', body.proxyLocation.ip, `(${body.proxyLocation.details})`);
    console.log('   - Final URL:', body.finalUrl);
    console.log('   - Redirect Type:', body.meta.redirectType);
  } catch (err) {
    console.error('Test failed with error:', err);
    throw err;
  } finally {
    if (app) {
      await app.close();
    }
  }
});
