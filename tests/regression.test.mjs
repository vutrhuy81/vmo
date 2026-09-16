import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import request from 'supertest';
import app from '../server.js';

test('không còn tài khoản admin và mật khẩu mặc định', () => {
  const auth = readFileSync('auth.js', 'utf8');
  assert.doesNotMatch(auth, /password:\s*['"]123456/);
  assert.match(auth, /const DEFAULT_USERS = \[\]/);
});

test('số lượng nội dung hiển thị khớp dữ liệu', () => {
  const tst = readFileSync('src/content/tab-tst.html', 'utf8');
  const history = readFileSync('src/content/tab-history.html', 'utf8');
  assert.equal((tst.match(/class="exam-card/g) || []).length, 23);
  assert.equal((history.match(/class="exam-card/g) || []).length, 15);
});

test('API AI từ chối truy cập ẩn danh', async () => {
  const response = await request(app).post('/api/ai-guide').send({ problemContent: 'x' });
  assert.equal(response.status, 401);
  assert.equal(response.body.code, 'AUTH_REQUIRED');
});

test('API không tồn tại trả JSON 404', async () => {
  const response = await request(app).get('/api/not-found');
  assert.equal(response.status, 404);
  assert.equal(response.type, 'application/json');
});

test('JSON lỗi không làm lộ stack trace', async () => {
  const response = await request(app).post('/api/ai-guide').set('content-type', 'application/json').send('{');
  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'BAD_REQUEST');
  assert.equal(response.body.stack, undefined);
});
