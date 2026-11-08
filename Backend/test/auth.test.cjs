require('ts-node/register');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Module, ValidationPipe } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { ConfigModule } = require('@nestjs/config');
const { MongooseModule, getModelToken } = require('@nestjs/mongoose');
const { JwtService } = require('@nestjs/jwt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { AuthModule } = require('../src/auth/auth.module');
const { AuthUser } = require('../src/auth/user.schema');
const { AuthService } = require('../src/auth/auth.service');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');

test('Auth HTTP: tenant isolation, hashing, JWT validation, DTOs and throttling', async () => {
  const mongo = await MongoMemoryServer.create();
  let app;
  const secret = 'test-only-secret-with-at-least-32-bytes';
  try {
    class TestModule {}
    Module({ imports: [ConfigModule.forRoot({ ignoreEnvFile: true, load: [() => ({ JWT_SECRET: secret })] }), MongooseModule.forRoot(mongo.getUri()), AuthModule] })(TestModule);
    app = await NestFactory.create(TestModule, { logger: false });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.get(getModelToken(AuthUser.name)).init();
    const spec = SwaggerModule.createDocument(app, new DocumentBuilder().addBearerAuth().build());
    assert.ok(spec.paths['/api/auth/{site}/login']);
    assert.ok(spec.paths['/api/auth/{site}/me'].get.security);
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const payload = { email: 'Person@Gmail.com', password: 'GoodPassword123!', name: 'Test User', phone: '0901234567', address: '123 Test Street' };
    const post = (site, action, body) => fetch(`${base}/api/auth/${site}/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const me = (site, token) => fetch(`${base}/api/auth/${site}/me`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const registration = await post('shop', 'register', payload);
    assert.equal(registration.status, 201);
    assert.equal(registration.headers.get('cache-control'), 'no-store');
    const registered = await registration.json();
    assert.equal(registered.user.email, 'person@gmail.com');
    assert.equal(registered.user.phone, payload.phone);
    assert.equal(registered.user.address, payload.address);
    assert.equal(registered.expiresIn, 900);
    assert.equal(JSON.stringify(registered).includes('password'), false);
    const stored = await app.get(getModelToken(AuthUser.name)).findOne().select('+passwordHash');
    assert.notEqual(stored.passwordHash, payload.password);
    assert.match(stored.passwordHash, /^[a-f0-9]{32}:[a-f0-9]{128}$/);
    assert.equal((await post('shop', 'register', payload)).status, 409);
    assert.equal((await post('other', 'register', payload)).status, 201);
    const login = await post('shop', 'login', { email: payload.email, password: payload.password });
    assert.equal(login.status, 200);
    const { accessToken } = await login.json();
    assert.equal((await me('shop', accessToken)).status, 200);
    assert.equal((await me('other', accessToken)).status, 401);
    assert.equal((await me('shop')).status, 401);
    assert.equal((await me('shop', accessToken + 'bad')).status, 401);
    const jwt = new JwtService();
    const claims = { site: 'shop' };
    const options = { secret, subject: registered.user.id, issuer: 'common-api', audience: 'shop' };
    assert.equal((await me('shop', jwt.sign(claims, { ...options, expiresIn: -1 }))).status, 401);
    assert.equal((await me('shop', jwt.sign(claims, { ...options, issuer: 'wrong' }))).status, 401);
    assert.equal((await me('shop', jwt.sign(claims, { ...options, secret: 'another-secret' }))).status, 401);
    assert.equal((await post('shop', 'login', { email: payload.email, password: 'WrongPassword123' })).status, 401);
    assert.equal((await post('shop', 'login', { email: 'unknown@gmail.com', password: payload.password })).status, 401);
    assert.equal((await post('shop', 'register', { ...payload, email: 'invalid' })).status, 400);
    assert.equal((await post('shop', 'register', { ...payload, phone: 'abc' })).status, 400);
    assert.equal((await post('INVALID', 'login', { email: payload.email, password: payload.password })).status, 400);
    let last;
    for (let i = 0; i < 11; i++) last = await post('shop', 'login', { email: payload.email, password: 'WrongPassword123' });
    assert.equal(last.status, 429);
  } finally { if (app) await app.close(); await mongo.stop(); }
});

test('Auth refuses missing signing secret or temporary database', async () => {
  for (const values of [{}, { JWT_SECRET: 'short' }, { JWT_SECRET: 'x'.repeat(32), AUTH_DB_PERSISTENT: false }]) {
    const auth = new AuthService({}, {}, { get: key => values[key] });
    await assert.rejects(auth.login('shop', {}), err => err.getStatus() === 503);
  }
});
